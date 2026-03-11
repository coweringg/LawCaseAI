import { Response } from 'express'
import { IAuthRequest } from '../types'
import AIService from '@/utils/aiService'
import { Case, CaseFile, ChatMessage, User } from '@/models'
import { logAction } from '@/utils/auditLogger'
import config from '@/config'
import logger from '@/utils/logger'

const controllerLogger = logger.child({ module: 'ai-controller' })

const aiService = AIService.getInstance()

export const chatWithAI = async (req: IAuthRequest, res: Response): Promise<Response> => {
    try {
        const { message, caseId, temporaryFileId } = req.body

        if (!message || !caseId) {
            return res.status(400).json({
                success: false,
                message: 'Both a message and a valid Case ID are required to consult the AI.'
            })
        }

        const currentCase = await Case.findOne({ _id: caseId, userId: req.user?._id })
        if (!currentCase) {
             controllerLogger.warn({ caseId, userId: req.user?._id }, 'AI Chat: Case not found or unauthorized access')
             return res.status(404).json({ success: false, message: 'This case could not be found, or you do not have permission to access it.' })
        }

        const limits = (config.planLimits as any)[req.user!.plan] || config.planLimits.basic;
        if ((currentCase.totalTokensConsumed || 0) >= limits.maxTokens) {
            return res.status(403).json({
                success: false,
                message: `This case has reached its AI processing limit (${limits.maxTokens} tokens). Please upgrade your plan to continue analysis in this workspace.`
            });
        }

        let filesContext = 'No files uploaded yet.'
        const filesToInclude = []

        let tempFile = null
        if (temporaryFileId) {
            tempFile = await CaseFile.findOne({ _id: temporaryFileId, userId: req.user?._id })
            if (tempFile) filesToInclude.push(tempFile)
        } else {
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

        const recentHistory = await ChatMessage.find({ caseId })
            .sort({ timestamp: -1 })
            .limit(30)
            .select('sender content')

        const history = recentHistory.reverse().map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content
        }))

        const aiRes = await aiService.generateResponse(message, caseContext, req.user?._id?.toString(), history)

        const summaryKeywords = /resum|summar|analyz|analiz|explay|detall|expand|key takeaway|puntos clave|commit to repository/i;
        const isSummaryRequest = summaryKeywords.test(message) || summaryKeywords.test(aiRes.response);
        
        const hasAnyFiles = await CaseFile.countDocuments({ caseId }) > 0;
        const shouldSuggestSaving = hasAnyFiles && isSummaryRequest && aiRes.response.length > 300;
        
        let relatedType = tempFile?.type || (filesToInclude.length > 0 ? filesToInclude[0].type : 'text/markdown');

        if (shouldSuggestSaving && !relatedType.includes('pdf') && !relatedType.includes('word')) {
            relatedType = 'application/pdf';
        }

        try {
            const userTimestamp = new Date()
            const aiTimestamp = new Date(userTimestamp.getTime() + 500)

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
        }

        try {
            const tokensProcessed = aiRes.tokens || (message.length / 4);
            const hoursToInc = Math.max(0.1, Math.round((tokensProcessed / 10000) * 10) / 10);
            
            await Promise.all([
                User.findByIdAndUpdate(req.user?._id, {
                    $inc: { 
                        hoursSavedByAI: hoursToInc,
                        hoursSavedToday: hoursToInc,
                        totalTokensConsumed: Math.round(tokensProcessed)
                    }
                }),
                Case.findByIdAndUpdate(currentCase._id, {
                    $inc: {
                        totalTokensConsumed: Math.round(tokensProcessed)
                    }
                })
            ])
        } catch (userErr) {
            controllerLogger.error({ err: userErr, userId: req.user?._id }, 'Failed to update user/case hours and tokens')
        }

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

        const currentCase = await Case.findById(file.caseId);
        if (currentCase) {
             const limits = (config.planLimits as any)[req.user!.plan] || config.planLimits.basic;
             if ((currentCase.totalTokensConsumed || 0) >= limits.maxTokens) {
                 return res.status(403).json({
                     success: false,
                     message: `This case has reached its AI processing limit (${limits.maxTokens} tokens). Please upgrade your plan to continue analysis in this workspace.`
                 });
             }
        }

        const content = file.extractedText || `Filename: ${file.name}. (No text could be extracted from this file for analysis).`
        const analysis = await aiService.analyzeDocument(content, req.user?._id?.toString())

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
                    tokens: Math.ceil(content.length / 4) + 500,
                    responseTime: 0,
                    suggestsSaving: false,
                    relatedFileType: file.type
                }
            })
        } catch (dbErr) {
            controllerLogger.error({ err: dbErr, fileId }, 'Failed to persist analysis chat messages')
        }

        try {
            const charCount = content.length;
            const estimatedTokens = charCount / 4;
            const hoursToInc = Math.max(0.5, Math.round((estimatedTokens / 10000) * 10) / 10);

            await Promise.all([
                User.findByIdAndUpdate(req.user?._id, {
                    $inc: { 
                        hoursSavedByAI: hoursToInc,
                        hoursSavedToday: hoursToInc,
                        totalTokensConsumed: Math.round(estimatedTokens)
                    }
                }),
                Case.findByIdAndUpdate(file.caseId, {
                    $inc: {
                        totalTokensConsumed: Math.round(estimatedTokens)
                    }
                })
            ])
        } catch (userErr) {
            controllerLogger.error({ err: userErr, userId: req.user?._id }, 'Failed to update user/case hours/tokens during analysis')
        }

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

        const limits = (config.planLimits as any)[req.user!.plan] || config.planLimits.basic;
        if ((currentCase.totalTokensConsumed || 0) >= limits.maxTokens) {
            return res.status(403).json({
                success: false,
                message: `This case has reached its AI processing limit (${limits.maxTokens} tokens). Please upgrade your plan to continue analysis in this workspace.`
            });
        }

        const files = await CaseFile.find({ caseId })

        const context = `Case Name: ${currentCase.name}\nClient: ${currentCase.client || 'N/A'}\nPractice Area: ${currentCase.practiceArea || 'General'}\nNumber of files: ${files.length}\nFiles: ${files.map(f => f.name).join(', ')}`

        const prompt = "Please provide a high-level executive summary of this case based on the provided metadata. Highlight potential legal challenges and suggest next steps."

        const aiRes = await aiService.generateResponse(prompt, context, req.user?._id?.toString())

        try {
            const tokensProcessed = aiRes.tokens || (prompt.length + context.length) / 4
            const hoursToInc = Math.max(0.2, Math.round((tokensProcessed / 10000) * 10) / 10)
            
            await Promise.all([
                User.findByIdAndUpdate(req.user?._id, {
                    $inc: { 
                        hoursSavedByAI: hoursToInc,
                        hoursSavedToday: hoursToInc,
                        totalTokensConsumed: Math.round(tokensProcessed)
                    }
                }),
                Case.findByIdAndUpdate(currentCase._id, {
                    $inc: {
                        totalTokensConsumed: Math.round(tokensProcessed)
                    }
                })
            ])
        } catch (userErr) {
            controllerLogger.error({ err: userErr, userId: req.user?._id }, 'Failed to update user/case hours/tokens for case summary')
        }

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

export const globalAudit = async (req: IAuthRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.user?._id

        const cases = await Case.find({ userId, status: 'active' })
        
        if (cases.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    strategicInsights: [],
                    identifiedPatterns: [],
                    riskVectors: [],
                    isEmpty: true
                }
            })
        }

        const files = await CaseFile.find({ userId, isTemporary: false })
            .select('name extractedText caseId')
            .limit(15)
            .sort({ createdAt: -1 })

        const caseSummaries = cases.map(c => `[CASE: ${c.name}] Area: ${c.practiceArea || 'General'}. Description: ${c.description || 'N/A'}`).join('\n')
        const fileContext = files.map(f => {
            const fileName = f.name
            const content = f.extractedText ? f.extractedText.substring(0, 400) : 'No text content'
            const caseInstance = cases.find(c => c._id.toString() === f.caseId.toString())
            return `[UNIT: ${fileName} in Case ${caseInstance?.name || 'Unknown'}] ${content}...`
        }).join('\n')
        
        const globalContext = `GLOBAL INTELLIGENCE AUDIT REQUEST\n\nACTIVE CASES SUMMARY:\n${caseSummaries}\n\nDOCUMENT REPOSITORY SNIPPETS:\n${fileContext}`

        const auditResults = await aiService.globalAudit(globalContext, userId?.toString())

        try {
            const estimatedTokens = globalContext.length / 4 + 2000 // Audit usually uses deep context
            const hoursToInc = Math.max(1, Math.round((estimatedTokens / 10000) * 10) / 10)
            
            await User.findByIdAndUpdate(userId, {
                $inc: { 
                    hoursSavedByAI: hoursToInc,
                    hoursSavedToday: hoursToInc,
                    totalTokensConsumed: Math.round(estimatedTokens)
                }
            })
        } catch (userErr) {
            controllerLogger.error({ err: userErr, userId }, 'Failed to update user hours/tokens for global audit')
        }

        return res.status(200).json({
            success: true,
            data: {
                ...auditResults,
                isEmpty: false
            }
        })
    } catch (error: any) {
        controllerLogger.error({ err: error }, 'Global Audit Controller Error')
        return res.status(500).json({
            success: false,
            message: 'An error occurred during the Deep Audit. Please try again later.'
        })
    }
}
