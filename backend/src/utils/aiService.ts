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
  
  private circuitState: CircuitState = 'CLOSED'
  private failureCount: number = 0
  private lastFailureTime: number = 0
  private readonly FAILURE_THRESHOLD = 5
  private readonly COOLDOWN_PERIOD = 30000

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

  public async generateResponse(prompt: string, caseContext?: string, userId?: string, history: { role: string, content: string }[] = []): Promise<IChatResponse> {
    try {
      const startTime = Date.now()
      const systemPrompt = this.buildSystemPrompt(caseContext)
      
      if (userId) {
        const user = await User.findById(userId)
        if (user) {
          const limits = (config.planLimits as any)[user.plan] || config.planLimits.basic
          if (user.totalTokensConsumed >= limits.maxTokens) {
            throw new Error(`AI_LIMIT_REACHED: You have exceeded your token limit for the current billing period. Please upgrade your plan to continue using AI Intelligence features immediately, or wait until your next billing cycle for your tokens to be replenished.`)
          }
        }
      }

      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt }
      ]
      
      const response = await this.callWithRetry(() => this.openai.chat.completions.create({
        model: this.modelName,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }))

      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.'
      
      const totalTokens = response.usage?.total_tokens || Math.ceil((prompt.length + aiResponse.length + systemPrompt.length) / 4)

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
      aiLogger.error({ err: error }, 'AI Service Error')
      
      const isLimitError = error.message?.startsWith('AI_LIMIT_REACHED:')
      const displayMessage = isLimitError 
        ? error.message.replace('AI_LIMIT_REACHED: ', '')
        : `I apologize, but I'm experiencing technical difficulties (Error: ${error.message}). Please try again later.`

       return {
        response: displayMessage,
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

      if (userId) {
        const user = await User.findById(userId)
        if (user) {
          const limits = (config.planLimits as any)[user.plan] || config.planLimits.basic
          if (user.totalTokensConsumed >= limits.maxTokens) {
            throw new Error(`AI_LIMIT_REACHED: You have exceeded your token limit for the current billing period. Please upgrade your plan to continue using AI Intelligence features immediately, or wait until your next billing cycle for your tokens to be replenished.`)
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
      
      const isLimitError = error.message?.startsWith('AI_LIMIT_REACHED:')
      const displayMessage = isLimitError 
        ? error.message.replace('AI_LIMIT_REACHED: ', '')
        : `Unable to analyze document at this time due to system error: ${error.message}`

      return {
        summary: displayMessage,
        keyPoints: [],
        suggestedActions: []
      }
    }
  }

  public async globalAudit(globalContext: string, userId?: string): Promise<{
    strategicInsights: string[]
    identifiedPatterns: string[]
    riskVectors: string[]
  }> {
    try {
      const systemPrompt = `You are a legal intelligence auditor. Your task is to perform a "Deep Audit" across all of a lawyer's cases. 
      Identify strategic insights (opportunities), patterns (similar legal issues or client behaviors), and risk vectors (contradictions or upcoming threats).
      Return your analysis in valid JSON format with three exact keys: "strategicInsights" (array of strings), "identifiedPatterns" (array of strings), and "riskVectors" (array of strings).`
      
      const prompt = `Please perform a global intelligence audit based on the following cross-case repository context:\n\n${globalContext}`

      if (userId) {
        const user = await User.findById(userId)
        if (user) {
          const limits = (config.planLimits as any)[user.plan] || config.planLimits.basic
          if (user.totalTokensConsumed >= limits.maxTokens) {
            throw new Error(`AI_LIMIT_REACHED: You have exceeded your token limit for the current billing period. Please upgrade your plan to continue using AI Intelligence features immediately, or wait until your next billing cycle for your tokens to be replenished.`)
          }
        }
      }

      const response = await this.callWithRetry(() => this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }))

      const content = response.choices[0]?.message?.content || '{}'
      const totalTokens = response.usage?.total_tokens || Math.ceil((globalContext.length + content.length) / 4)
      
      let analysis
      try {
        analysis = JSON.parse(content)
      } catch (e) {
        aiLogger.error({ content }, 'Failed to parse JSON response from Global Audit')
        analysis = { strategicInsights: ['Error parsing analysis'], identifiedPatterns: [], riskVectors: [] }
      }
      
      if (userId) {
        this.updateUserTokens(userId, totalTokens).catch((err: any) => 
          aiLogger.error({ err, userId }, 'Failed to update user tokens')
        )
      }

      aiLogger.info('Global intelligence audit completed')
      return {
        strategicInsights: analysis.strategicInsights || [],
        identifiedPatterns: analysis.identifiedPatterns || [],
        riskVectors: analysis.riskVectors || []
      }
    } catch (error: any) {
      aiLogger.error({ err: error }, 'Global Audit Error')
      
      const isLimitError = error.message?.startsWith('AI_LIMIT_REACHED:')
      const displayMessage = isLimitError 
        ? error.message.replace('AI_LIMIT_REACHED: ', '')
        : `Unable to perform global audit at this time: ${error.message}`

      return {
        strategicInsights: [displayMessage],
        identifiedPatterns: [],
        riskVectors: []
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
    const basePrompt = `You are an elite AI legal strategist for LawCaseAI. Your users are highly qualified lawyers and legal professionals. 

Your role is to:
1. Act as a high-level legal research and analysis peer.
2. Provide deep, technical insights into case law, statutes, and legal strategy.
3. Assist with intensive document analysis and case management.
4. Maintain a professional, executive, and analytical tone at all times.

Critical Guidelines:
- DO NOT provide generic disclaimers such as "I am an AI," "I cannot provide legal advice," or "Consult with an attorney." The users ARE attorneys and find these warnings redundant and unprofessional.
- Focus on being a force-multiplier for their legal research.
- If the user provides a document via the chat, assist them with its content immediately.
- Mention that they can save this analysis to their permanent repository via the 'Commit to Repository' button ONLY when you have provided a significant summary, expanded analysis, or key takeaway.
- ALWAYS respond in English, regardless of the language the user writes in. This is a STRICT requirement for UI consistency.`

    if (caseContext) {
      return `${basePrompt}\n\nCurrent Case Context:\n${caseContext}`
    }

    return basePrompt
  }
}

export default AIService
