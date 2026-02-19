import axios from 'axios'
import { config } from '@/config'
import { IChatResponse } from '@/types'

export class AIService {
  private static instance: AIService
  private baseURL: string
  private apiKey: string

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

  public async generateResponse(prompt: string, caseContext?: string): Promise<IChatResponse> {
    try {
      const startTime = Date.now()
      
      const systemPrompt = this.buildSystemPrompt(caseContext)
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds
        }
      )

      const endTime = Date.now()
      const responseTime = endTime - startTime

      const aiResponse = response.data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.'
      
      return {
        response: aiResponse,
        model: 'gpt-3.5-turbo',
        tokens: response.data.usage?.total_tokens || 0,
        responseTime
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      
      // Fallback response
      return {
        response: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.',
        model: 'gpt-3.5-turbo',
        tokens: 0,
        responseTime: 0
      }
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
      return `${basePrompt}

Current Case Context:
${caseContext}

Please provide assistance based on the above case information.`
    }

    return basePrompt
  }

  public async analyzeDocument(documentContent: string): Promise<{
    summary: string
    keyPoints: string[]
    suggestedActions: string[]
  }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a legal document analyzer. Analyze the provided document and provide a concise summary, key points, and suggested actions for the handling attorney.'
            },
            {
              role: 'user',
              content: `Please analyze this legal document and provide:\n1. A brief summary\n2. Key points and important information\n3. Suggested next steps or actions\n\nDocument content:\n${documentContent}`
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 seconds for document analysis
        }
      )

      const analysis = response.data.choices[0]?.message?.content || ''
      
      // Parse the response (this is a simplified approach)
      const summary = this.extractSection(analysis, 'summary') || 'Unable to generate summary'
      const keyPoints = this.extractListItems(analysis, 'key points') || []
      const suggestedActions = this.extractListItems(analysis, 'suggested actions') || []

      return {
        summary,
        keyPoints,
        suggestedActions
      }
    } catch (error) {
      console.error('Document Analysis Error:', error)
      return {
        summary: 'Unable to analyze document at this time',
        keyPoints: [],
        suggestedActions: []
      }
    }
  }

  private extractSection(text: string, sectionName: string): string | null {
    const regex = new RegExp(`${sectionName}[\\s:]+([\\s\\S]*?)(?=\\n|$)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : null
  }

  private extractListItems(text: string, listName: string): string[] {
    const section = this.extractSection(text, listName)
    if (!section) return []
    
    return section
      .split('\n')
      .filter(line => line.trim().match(/^[-*•]\s+/))
      .map(line => line.replace(/^[-*•]\s+/, '').trim())
      .filter(item => item.length > 0)
  }
}

export default AIService
