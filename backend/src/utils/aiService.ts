import OpenAI from 'openai'
import config from '../config'
import { IChatResponse } from '../types'
import logger from './logger'
import { User } from '../models'

const aiLogger = logger.child({ module: 'ai-service' })

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export class AIService {
  private static instance: AIService
  private openai: OpenAI
  private modelName: string
  
  // Circuit Breaker State
  private circuitState: CircuitState = 'CLOSED'
  private failureCount: number = 0
  private lastFailureTime: number = 0
  private readonly FAILURE_THRESHOLD = 5
  private readonly COOLDOWN_PERIOD = 30000 // 30 seconds

  private constructor() {
    this.openai = new OpenAI({
      apiKey: config.ai.apiKey,
      baseURL: config.ai.baseURL,
      defaultHeaders: {
        "HTTP-Referer": "https://lawcaseai.com",
        "X-Title": "LawCaseAI",
      }
    })
    this.modelName = config.ai.model
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  private checkCircuit(): boolean {
    if (this.circuitState === 'OPEN') {
      const now = Date.now()
      if (now - this.lastFailureTime > this.COOLDOWN_PERIOD) {
        this.circuitState = 'HALF_OPEN'
        return true
      }
      return false
    }
    return true
  }

  private recordSuccess() {
    this.failureCount = 0
    this.circuitState = 'CLOSED'
  }

  private recordFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.circuitState = 'OPEN'
      aiLogger.warn('AI Circuit Breaker TRIPPED (OPEN)')
    }
  }

  private async callWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        if (!this.checkCircuit()) {
          throw new Error('Circuit Breaker is OPEN')
        }
        const result = await fn()
        this.recordSuccess()
        return result
      } catch (error: any) {
        if (i === retries - 1) {
          this.recordFailure()
          throw error
        }
        const delay = Math.pow(2, i) * 1000
        aiLogger.info({ attempt: i + 1, delay }, 'Retrying AI request...')
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    throw new Error('Max retries reached')
  }

  public async generateResponse(prompt: string, caseContext?: string, userId?: string): Promise<IChatResponse> {
    try {
      const startTime = Date.now()
      const systemPrompt = this.buildSystemPrompt(caseContext)
      
      // Enforce token limit
      if (userId) {
        const user = await User.findById(userId)
        if (user) {
          const limits = (config.planLimits as any)[user.plan] || config.planLimits.basic
          if (user.totalTokensConsumed >= limits.maxTokens) {
            throw new Error(`AI Limit Reached: Your current plan allows for ${limits.maxTokens.toLocaleString()} tokens. Please upgrade to continue using AI features.`)
          }
        }
      }
      
      const response = await this.callWithRetry(() => this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }))

      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.'
      
      // Token tracking via API response if available, otherwise estimate
      const totalTokens = response.usage?.total_tokens || Math.ceil((prompt.length + aiResponse.length + systemPrompt.length) / 4)

      // Update token tracking if userId is provided
      if (userId) {
        this.updateUserTokens(userId, totalTokens).catch((err: any) => 
          aiLogger.error({ err, userId }, 'Failed to update user tokens')
        )
      }

      aiLogger.info(
        { model: this.modelName, tokens: totalTokens, responseTime },
        'AI response generated'
      )

      return {
        response: aiResponse,
        model: this.modelName,
        tokens: totalTokens,
        responseTime
      }
    } catch (error: any) {
      aiLogger.error({ err: error }, 'AI Service Error — returning fallback response')
       return {
        response: `I apologize, but I'm experiencing technical difficulties (Error: ${error.message}). Please try again later.`,
        model: this.modelName,
        tokens: 0,
        responseTime: 0
      }
    }
  }

  public async analyzeDocument(documentContent: string, userId?: string): Promise<{
    summary: string
    keyPoints: string[]
    suggestedActions: string[]
  }> {
    try {
      const systemPrompt = 'You are a legal document analyzer. Return your analysis in valid JSON format with three exact keys: "summary" (string), "keyPoints" (array of strings), and "suggestedActions" (array of strings). Do not include any other text except the JSON object.'
      const prompt = `Please analyze this legal document and provide JSON-formatted summary, key points, and suggested actions.\n\nDocument content:\n${documentContent}`

      // Enforce token limit
      if (userId) {
        const user = await User.findById(userId)
        if (user) {
          const limits = (config.planLimits as any)[user.plan] || config.planLimits.basic
          if (user.totalTokensConsumed >= limits.maxTokens) {
            throw new Error(`AI Limit Reached: Your current plan allows for ${limits.maxTokens.toLocaleString()} tokens. Please upgrade to continue analyzing documents.`)
          }
        }
      }

      const response = await this.callWithRetry(() => this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      }))

      const content = response.choices[0]?.message?.content || '{}'
      const totalTokens = response.usage?.total_tokens || Math.ceil((documentContent.length + content.length) / 4)
      
      let analysis
      try {
        analysis = JSON.parse(content)
      } catch (e) {
        aiLogger.error({ content }, 'Failed to parse JSON response from AI')
        analysis = { summary: 'Error parsing analysis', keyPoints: [], suggestedActions: [] }
      }
      
      if (userId) {
        this.updateUserTokens(userId, totalTokens).catch((err: any) => 
          aiLogger.error({ err, userId }, 'Failed to update user tokens')
        )
      }

      aiLogger.info('Document analysis completed')
      return {
        summary: analysis.summary || 'Summary unavailable',
        keyPoints: analysis.keyPoints || [],
        suggestedActions: analysis.suggestedActions || []
      }
    } catch (error: any) {
      aiLogger.error({ err: error }, 'Document Analysis Error')
      return {
        summary: `Unable to analyze document at this time due to system error: ${error.message}`,
        keyPoints: [],
        suggestedActions: []
      }
    }
  }

  private async updateUserTokens(userId: string, tokens: number) {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalTokensConsumed: tokens }
      })
    } catch (error: unknown) {
       aiLogger.error({ err: error, userId }, 'Database error updating tokens')
    }
  }

  private buildSystemPrompt(caseContext?: string): string {
    const basePrompt = `You are an AI legal assistant for LawCaseAI, a platform that helps lawyers manage their cases more efficiently. 

Your role is to:
1. Provide helpful, accurate legal information and guidance
2. Assist with case management and document analysis
3. Suggest best practices for legal workflows
4. Help lawyers understand complex legal concepts
5. Always maintain professional and ethical standards

Important guidelines:
- Never provide legal advice that could be considered as practicing law without a license
- Always suggest consulting with qualified attorneys for specific legal matters
- Be helpful but acknowledge the limitations of AI in legal contexts
- Focus on general legal information and process guidance
- Maintain confidentiality and professionalism
- If the user provides a document via the chat, assist them with its content. Always proactively remind them that they can save this document to their permanent case repository by clicking the 'Commit to Repository' button below your message, where they will also be able to choose a custom name for the file.
- ALWAYS respond in English, regardless of the language the user writes in. This is a STRICT requirement for the UI consistency.`

    if (caseContext) {
      return `${basePrompt}\n\nCurrent Case Context:\n${caseContext}`
    }

    return basePrompt
  }
}

export default AIService
