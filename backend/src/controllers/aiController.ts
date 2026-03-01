import { Response } from 'express'
import { IAuthRequest } from '../types'
import AIService from '@/utils/aiService'
import { Case, CaseFile, ChatMessage, User } from '@/models'
import { logAction } from '@/utils/auditLogger'
import config from '@/config'
import logger from '@/utils/logger'

const controllerLogger = logger.child({ module: 'ai-controller' })

const aiService = AIService.getInstance()

/**
 * @desc    Chat with AI about a specific case
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chatWithAI = async (req: IAuthRequest, res: Response): Promise<Response> => {
    try {
        const { message, caseId, temporaryFileId } = req.body

        if (!message || !caseId) {
            return res.status(400).json({
                success: false,
                message: 'Both a message and a valid Case ID are required to consult the AI.'
            })
        }

        // Check if case exists and belongs to user
        const currentCase = await Case.findOne({ _id: caseId, userId: req.user?._id })
        if (!currentCase) {
             controllerLogger.warn({ caseId, userId: req.user?._id }, 'AI Chat: Case not found or unauthorized access')
             return res.status(404).json({ success: false, message: 'This case could not be found, or you do not have permission to access it.' })
        }

        // Fetch files context 
        let filesContext = 'No files uploaded yet.'
        const filesToInclude = []

        let tempFile = null
        if (temporaryFileId) {
            // Prioritize the explicitly attached temporary file
            tempFile = await CaseFile.findOne({ _id: temporaryFileId, userId: req.user?._id })
            if (tempFile) filesToInclude.push(tempFile)
        } else {
            // Otherwise get recent permanent files
            const recentFiles = await CaseFile.find({ caseId, isTemporary: false })
                .sort({ createdAt: -1 })
                .select('name extractedText type')
                .limit(3)
            filesToInclude.push(...recentFiles)
        }

        if (filesToInclude.length > 0) {
            filesContext = filesToInclude.map(f => {
                const text = f.extractedText?.trim();
                if (!text) {
                    return `--- Document: ${f.name} ---\n[SYSTEM NOTE: No selectable text was found in this document. It is likely a scanned image or encrypted. Please inform the user that you cannot analyze its specific content unless they provide a text-based version or use OCR.]`;
                }
                return `--- Document: ${f.name} ---\n${text}`;
            }).join('\n\n')
        }

        const caseContext = `Case Name: ${currentCase.name}\nPractice Area: ${currentCase.practiceArea || 'General'}\nDescription: ${currentCase.description || 'N/A'}\n\nDocument Context:\n${filesContext}`

        const aiRes = await aiService.generateResponse(message, caseContext, req.user?._id?.toString())

        // Determine if we should suggest saving this response
        const isSummaryRequest = /resum|summar|analyz|analiz/i.test(message);
        const shouldSuggestSaving = !!temporaryFileId || (isSummaryRequest && filesToInclude.length > 0);
        const relatedType = tempFile?.type || (filesToInclude.length > 0 ? filesToInclude[0].type : 'text/markdown');

        // Persist messages to Database
        try {
            const userTimestamp = new Date()
            const aiTimestamp = new Date(userTimestamp.getTime() + 500) // 500ms later to ensure order

            await ChatMessage.create([
                {
                    content: message,
                    sender: 'user',
                    caseId: currentCase._id,
                    userId: req.user?._id,
                    timestamp: userTimestamp
                },
                {
                    content: aiRes.response,
                    sender: 'ai',
                    caseId: currentCase._id,
                    userId: req.user?._id,
                    timestamp: aiTimestamp,
                    metadata: {
                        model: aiRes.model,
                        tokens: aiRes.tokens,
                        responseTime: aiRes.responseTime,
                        suggestsSaving: shouldSuggestSaving,
                        relatedFileType: relatedType
                    }
                }
            ])
        } catch (dbErr) {
            controllerLogger.error({ err: dbErr, caseId: currentCase._id }, 'Failed to persist chat messages')
            // Don't fail the request if chat persistence fails, but log it
        }

        // Update Cognitive Time Saved (Intelligent calculation: 1h per 10k tokens)
        try {
            const tokensProcessed = aiRes.tokens || (message.length / 4); // Fallback estimate
            const hoursToInc = Math.max(0.1, Math.round((tokensProcessed / 10000) * 10) / 10);
            
            await User.findByIdAndUpdate(req.user?._id, {
                $inc: { 
                    hoursSavedByAI: hoursToInc,
                    hoursSavedToday: hoursToInc
                }
            })
        } catch (userErr) {
            controllerLogger.error({ err: userErr, userId: req.user?._id }, 'Failed to update user hours saved')
        }

        // Log the action
        await logAction({
            adminId: req.user?._id as any,
            adminName: req.user?.name || 'User',
            targetId: currentCase._id as any,
            targetName: currentCase.name,
            targetType: 'case',
            category: 'platform',
            action: 'AI_CONSULTATION' as any,
            description: `User consulted AI for case "${currentCase.name}"`
        })

        return res.status(200).json({
            success: true,
            data: {
                ...aiRes,
                suggestsSaving: shouldSuggestSaving,
                relatedFileType: relatedType
            }
        })
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'AI Chat Controller Error')
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
export const analyzeCaseFile = async (req: IAuthRequest, res: Response): Promise<Response> => {
    try {
        const { fileId } = req.params

        const file = await CaseFile.findOne({ _id: fileId, userId: req.user?._id })
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'The requested file could not be found, or you do not have permission to analyze it.'
            })
        }

        // Use extracted text for real analysis
        const content = file.extractedText || `Filename: ${file.name}. (No text could be extracted from this file for analysis).`
        const analysis = await aiService.analyzeDocument(content, req.user?._id?.toString())

        // Persist to ChatMessage for analytics tracking
        try {
            await ChatMessage.create({
                content: `[AI ANALYSIS REQUEST] Document: ${file.name}`,
                sender: 'user',
                caseId: file.caseId,
                userId: req.user?._id,
                timestamp: new Date()
            })

            await ChatMessage.create({
                content: `[AI ANALYSIS COMPLETED] Document: ${file.name}. Summary provided in modal.`,
                sender: 'ai',
                caseId: file.caseId,
                userId: req.user?._id,
                timestamp: new Date(),
                metadata: {
                    model: config.ai.model,
                    tokens: Math.ceil(content.length / 4) + 500, // Estimate tokens if not returned directly from analysis call
                    responseTime: 0, // Not explicitly tracked here yet
                    suggestsSaving: false,
                    relatedFileType: file.type
                }
            })
        } catch (dbErr) {
            controllerLogger.error({ err: dbErr, fileId }, 'Failed to persist analysis chat messages')
        }

        // Update Cognitive Time Saved (1h per 10k content tokens estimated by chars)
        try {
            const charCount = content.length;
            const estimatedTokens = charCount / 4;
            const hoursToInc = Math.max(0.5, Math.round((estimatedTokens / 10000) * 10) / 10);

            await User.findByIdAndUpdate(req.user?._id, {
                $inc: { 
                    hoursSavedByAI: hoursToInc,
                    hoursSavedToday: hoursToInc
                }
            })
        } catch (userErr) {
            controllerLogger.error({ err: userErr, userId: req.user?._id }, 'Failed to update user hours saved during analysis')
        }

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
            data: {
                ...analysis,
                fileName: file.name,
                formattedSummary: `### **Document Analysis: ${file.name}**\n\n#### **Summary**\n${analysis.summary}\n\n#### **Key Points**\n${analysis.keyPoints.map((p: string) => `* ${p}`).join('\n')}\n\n#### **Suggested Actions**\n${analysis.suggestedActions.map((a: string) => `* ${a}`).join('\n')}`
            }
        })
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'AI Analysis Controller Error')
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
export const getCaseSummary = async (req: IAuthRequest, res: Response): Promise<Response> => {
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

        const aiRes = await aiService.generateResponse(prompt, context, req.user?._id?.toString())

        return res.status(200).json({
            success: true,
            data: {
                summary: aiRes.response,
                lastUpdated: new Date()
            }
        })
    } catch (error: unknown) {
        controllerLogger.error({ err: error }, 'AI Case Summary Controller Error')
        return res.status(500).json({
            success: false,
            message: 'Server error during case summary generation'
        })
    }
}
