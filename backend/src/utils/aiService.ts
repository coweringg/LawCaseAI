import axios from 'axios'
import { config } from '@/config'
import { IChatResponse } from '@/types'
import logger from '@/utils/logger'
import User from '@/models/User'

const aiLogger = logger.child({ module: 'ai-service' })

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export class AIService {
  private static instance: AIService
  private baseURL: string
  private apiKey: string
  
  // Circuit Breaker State
  private circuitState: CircuitState = 'CLOSED'
  private failureCount: number = 0
  private lastFailureTime: number = 0
  private readonly FAILURE_THRESHOLD = 5
  private readonly COOLDOWN_PERIOD = 30000 // 30 seconds

  private constructor() {
    this.baseURL = config.freellm.baseUrl
    this.apiKey = config.freellm.apiKey
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

  private async callWithRetry(fn: () => Promise<any>, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        if (!this.checkCircuit()) {
          throw new Error('Circuit Breaker is OPEN')
        }
        const result = await fn()
        this.recordSuccess()
        return result
      } catch (error: any) {
        const isTransient = (error as any).response ? (error as any).response.status >= 500 : true
        if (i === retries - 1 || !isTransient) {
          this.recordFailure()
          throw error
        }
        const delay = Math.pow(2, i) * 1000
        aiLogger.info({ attempt: i + 1, delay }, 'Retrying AI request...')
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  public async generateResponse(prompt: string, caseContext?: string, userId?: string): Promise<IChatResponse> {
    try {
      const startTime = Date.now()
      const systemPrompt = this.buildSystemPrompt(caseContext)
      
      const response = await this.callWithRetry(() => axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      ))

      const endTime = Date.now()
      const responseTime = endTime - startTime
      const usage = response.data.usage
      const aiResponse = response.data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.'
      
      // Update token tracking if userId is provided
      if (userId && usage?.total_tokens) {
        this.updateUserTokens(userId, usage.total_tokens).catch(err => 
          aiLogger.error({ err, userId }, 'Failed to update user tokens')
        )
      }

      aiLogger.info(
        { model: 'gpt-3.5-turbo', tokens: usage?.total_tokens, responseTime },
        'AI response generated'
      )

      return {
        response: aiResponse,
        model: 'gpt-3.5-turbo',
        tokens: usage?.total_tokens || 0,
        responseTime
      }
    } catch (error: unknown) {
      aiLogger.error({ err: error }, 'AI Service Error — returning fallback response')
       return {
        response: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.',
        model: 'gpt-3.5-turbo',
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
      const response = await this.callWithRetry(() => axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a legal document analyzer. Return your analysis in valid JSON format with keys: "summary" (string), "keyPoints" (array of strings), and "suggestedActions" (array of strings).'
            },
            {
              role: 'user',
              content: `Please analyze this legal document and provide JSON-formatted summary, key points, and suggested actions.\n\nDocument content:\n${documentContent}`
            }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1500,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      ))

      const usage = response.data.usage
      const content = response.data.choices[0]?.message?.content || '{}'
      let analysis
      try {
        analysis = JSON.parse(content)
      } catch (e) {
        aiLogger.error({ content }, 'Failed to parse JSON response from AI')
        analysis = { summary: 'Error parsing analysis', keyPoints: [], suggestedActions: [] }
      }
      
      if (userId && usage?.total_tokens) {
        this.updateUserTokens(userId, usage.total_tokens).catch(err => 
          aiLogger.error({ err, userId }, 'Failed to update user tokens')
        )
      }

      aiLogger.info('Document analysis completed')
      return {
        summary: analysis.summary || 'Summary unavailable',
        keyPoints: analysis.keyPoints || [],
        suggestedActions: analysis.suggestedActions || []
      }
    } catch (error) {
      aiLogger.error({ err: error }, 'Document Analysis Error')
      return {
        summary: 'Unable to analyze document at this time due to high system load.',
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
- Maintain confidentiality and professionalism`

    if (caseContext) {
      return `${basePrompt}\n\nCurrent Case Context:\n${caseContext}`
    }

    return basePrompt
  }
}

export default AIService
