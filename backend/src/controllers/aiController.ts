import { Response } from 'express'
import { IAuthRequest } from '../types'
import AIService from '@/utils/aiService'
import { Case, CaseFile } from '@/models'
import { logAction } from '@/utils/auditLogger'

const aiService = AIService.getInstance()

/**
 * @desc    Chat with AI about a specific case
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chatWithAI = async (req: IAuthRequest, res: Response): Promise<any> => {
    try {
        const { message, caseId } = req.body

        if (!message || !caseId) {
            return res.status(400).json({
                success: false,
                message: 'Both a message and a valid Case ID are required to consult the AI.'
            })
        }

        // Check if case exists and belongs to user
        const currentCase = await Case.findOne({ _id: caseId, userId: req.user?._id })
        if (!currentCase) {
            return res.status(404).json({
                success: false,
                message: 'This case could not be found, or you do not have permission to access it.'
            })
        }

        // Fetch some files context if available
        const files = await CaseFile.find({ caseId }).limit(5)
        const filesContext = files.length > 0
            ? `Case Files: ${files.map(f => f.name).join(', ')}`
            : 'No files uploaded yet.'

        const caseContext = `Case Name: ${currentCase.name}\nPractice Area: ${currentCase.practiceArea || 'General'}\nDescription: ${currentCase.description || 'N/A'}\n${filesContext}`

        const aiRes = await aiService.generateResponse(message, caseContext)

        // Log the action
        await logAction({
            adminId: req.user?._id as any,
            adminName: req.user?.name || 'User',
            targetId: currentCase._id as any,
            targetName: currentCase.name,
            targetType: 'case',
            category: 'platform',
            action: 'UPDATE', // AI interaction is an update to case activity
            description: `User consulted AI for case "${currentCase.name}"`
        })

        return res.status(200).json({
            success: true,
            data: aiRes
        })
    } catch (error: any) {
        console.error('AI Chat Controller Error:', error)
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while communicating with the AI. Please try again in a moment.'
        })
    }
}

/**
 * @desc    Analyze a specific file
 * @route   POST /api/ai/analyze/:fileId
 * @access  Private
 */
export const analyzeCaseFile = async (req: IAuthRequest, res: Response): Promise<any> => {
    try {
        const { fileId } = req.params

        const file = await CaseFile.findOne({ _id: fileId, userId: req.user?._id })
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'The requested file could not be found, or you do not have permission to analyze it.'
            })
        }

        // Since we don't have OCR/PDF text extraction fully implemented yet in this version,
        // we'll "analyze" based on metadata and a placeholder for text content.
        // In a real app, we'd fetch the file from R2 and extract text.

        const mockContent = `Document: ${file.name}. Type: ${file.type}. Size: ${file.size} bytes.`
        const analysis = await aiService.analyzeDocument(mockContent)

        // Log the action
        await logAction({
            adminId: req.user?._id as any,
            adminName: req.user?.name || 'User',
            targetId: file._id as any,
            targetName: file.name,
            targetType: 'case',
            category: 'platform',
            action: 'UPDATE',
            description: `User performed AI analysis on document: ${file.name}`
        })

        return res.status(200).json({
            success: true,
            data: analysis
        })
    } catch (error: any) {
        console.error('AI Analysis Controller Error:', error)
        return res.status(500).json({
            success: false,
            message: 'Server error during file analysis'
        })
    }
}

/**
 * @desc    Get an overall AI summary of the case
 * @route   GET /api/ai/summary/:caseId
 * @access  Private
 */
export const getCaseSummary = async (req: IAuthRequest, res: Response): Promise<any> => {
    try {
        const { caseId } = req.params

        const currentCase = await Case.findOne({ _id: caseId, userId: req.user?._id })
        if (!currentCase) {
            return res.status(404).json({
                success: false,
                message: 'The requested case summary is unavailable because the case could not be found or you lack permission.'
            })
        }

        const files = await CaseFile.find({ caseId })

        const context = `Case Name: ${currentCase.name}\nClient: ${currentCase.client || 'N/A'}\nPractice Area: ${currentCase.practiceArea || 'General'}\nNumber of files: ${files.length}\nFiles: ${files.map(f => f.name).join(', ')}`

        const prompt = "Please provide a high-level executive summary of this case based on the provided metadata. Highlight potential legal challenges and suggest next steps."

        const aiRes = await aiService.generateResponse(prompt, context)

        return res.status(200).json({
            success: true,
            data: {
                summary: aiRes.response,
                lastUpdated: new Date()
            }
        })
    } catch (error: any) {
        console.error('AI Case Summary Controller Error:', error)
        return res.status(500).json({
            success: false,
            message: 'Server error during case summary generation'
        })
    }
}
