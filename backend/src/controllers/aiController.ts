import { Response } from 'express'
import { IAuthRequest } from '../types'
import AIService from '@/utils/aiService'
import { Case, CaseFile, ChatMessage, User } from '@/models'
import { getRelevantKnowledgeContext } from '../utils/knowledgeBaseUtils'
import { logAction } from '@/utils/auditLogger'
import config from '@/config'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

const aiService = AIService.getInstance()

export const chatWithAI = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { message, caseId, temporaryFileId } = req.body

    if (!message || !caseId) {
        throw new AppError('Both a message and a valid Case ID are required to consult the AI.', 400)
    }

    const currentCase = await Case.findOne({ _id: caseId, userId: req.user?._id })
    if (!currentCase) {
        throw new AppError('This case could not be found, or you do not have permission to access it.', 404)
    }

    const limits = (config.planLimits as any)[req.user!.plan] || config.planLimits.basic;
    if ((currentCase.totalTokensConsumed || 0) >= limits.maxTokens) {
        throw new AppError(`This case has reached its AI processing limit (${limits.maxTokens} tokens). Please upgrade your plan to continue analysis in this workspace.`, 403)
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
                return `--- Document: ${f.name} ---\n[SYSTEM NOTE: No selectable text was found in this document. It is likely a scanned image or encrypted.]`;
            }
            return `--- Document: ${f.name} ---\n${text}`;
        }).join('\n\n')
    }

    const knowledgeContext = await getRelevantKnowledgeContext(req.user!._id!.toString(), message)
    
    const caseContext = `Case Name: ${currentCase.name}\nPractice Area: ${currentCase.practiceArea || 'General'}\nDescription: ${currentCase.description || 'N/A'}\n\nDocument Context:\n${filesContext}\n\n${knowledgeContext}`

    const recentHistory = await ChatMessage.find({ caseId })
        .sort({ timestamp: -1 })
        .limit(30)
        .select('sender content')

    const history = recentHistory.reverse().map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
    }))

    const aiRes = await aiService.generateResponse(message, caseContext, req.user?._id?.toString(), history)

    const summaryKeywords = /resum|summar|analyz|analiz|explay|detall|expand|key takeaway|puntos clave/i;
    const isSummaryRequest = summaryKeywords.test(message) || summaryKeywords.test(aiRes.response);
    
    const hasAnyFiles = await CaseFile.countDocuments({ caseId }) > 0;
    const shouldSuggestSaving = hasAnyFiles && isSummaryRequest && aiRes.response.length > 300;
    
    let relatedType = tempFile?.type || (filesToInclude.length > 0 ? filesToInclude[0].type : 'text/markdown');

    if (shouldSuggestSaving && !relatedType.includes('pdf') && !relatedType.includes('word')) {
        relatedType = 'application/pdf';
    }

    // Persist messages in background
    const userTimestamp = new Date()
    const aiTimestamp = new Date(userTimestamp.getTime() + 500)
    ChatMessage.create([
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
    ]).catch(() => {});

    // Update tokens/hours in background
    const tokensProcessed = aiRes.tokens || (message.length / 4);
    const hoursToInc = Math.max(0.1, Math.round((tokensProcessed / 10000) * 10) / 10);
    
    Promise.all([
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
    ]).catch(() => {});

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

    res.status(200).json({
        success: true,
        data: {
            ...aiRes,
            suggestsSaving: shouldSuggestSaving,
            relatedFileType: relatedType
        }
    })
})

export const analyzeCaseFile = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { fileId } = req.params

    const file = await CaseFile.findOne({ _id: fileId, userId: req.user?._id })
    if (!file) {
        throw new AppError('The requested file could not be found, or you do not have permission to analyze it.', 404)
    }

    const currentCase = await Case.findById(file.caseId);
    if (currentCase) {
         const limits = (config.planLimits as any)[req.user!.plan] || config.planLimits.basic;
         if ((currentCase.totalTokensConsumed || 0) >= limits.maxTokens) {
             throw new AppError(`This case has reached its AI processing limit (${limits.maxTokens} tokens). Please upgrade your plan.`, 403)
         }
    }

    const content = file.extractedText || `Filename: ${file.name}. (No text could be extracted).`
    const analysis = await aiService.analyzeDocument(content, req.user?._id?.toString())

    // Background updates
    ChatMessage.create([
        {
            content: `[AI ANALYSIS REQUEST] Document: ${file.name}`,
            sender: 'user',
            caseId: file.caseId,
            userId: req.user?._id,
            timestamp: new Date()
        },
        {
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
        }
    ]).catch(() => {});

    const estimatedTokens = content.length / 4;
    const hoursToInc = Math.max(0.5, Math.round((estimatedTokens / 10000) * 10) / 10);

    Promise.all([
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
    ]).catch(() => {});

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

    res.status(200).json({
        success: true,
        data: {
            ...analysis,
            fileName: file.name,
            formattedSummary: `### **Document Analysis: ${file.name}**\n\n#### **Summary**\n${analysis.summary}\n\n#### **Key Points**\n${analysis.keyPoints.map((p: string) => `* ${p}`).join('\n')}\n\n#### **Suggested Actions**\n${analysis.suggestedActions.map((a: string) => `* ${a}`).join('\n')}`
        }
    })
})

export const getCaseSummary = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params

    const currentCase = await Case.findOne({ _id: caseId, userId: req.user?._id })
    if (!currentCase) {
        throw new AppError('The requested case summary is unavailable.', 404)
    }

    const limits = (config.planLimits as any)[req.user!.plan] || config.planLimits.basic;
    if ((currentCase.totalTokensConsumed || 0) >= limits.maxTokens) {
        throw new AppError('AI processing limit reached for this case.', 403)
    }

    const files = await CaseFile.find({ caseId })
    const context = `Case Name: ${currentCase.name}\nClient: ${currentCase.client || 'N/A'}\nPractice Area: ${currentCase.practiceArea || 'General'}\nFiles: ${files.map(f => f.name).join(', ')}`
    const prompt = "Please provide a high-level executive summary of this case based on the provided metadata."

    const aiRes = await aiService.generateResponse(prompt, context, req.user?._id?.toString())

    const tokensProcessed = aiRes.tokens || (prompt.length + context.length) / 4
    const hoursToInc = Math.max(0.2, Math.round((tokensProcessed / 10000) * 10) / 10)
    
    Promise.all([
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
    ]).catch(() => {});

    res.status(200).json({
        success: true,
        data: {
            summary: aiRes.response,
            lastUpdated: new Date()
        }
    })
})

export const globalAudit = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?._id

    const cases = await Case.find({ userId, status: 'active' })
    if (cases.length === 0) {
        res.status(200).json({
            success: true,
            data: { strategicInsights: [], identifiedPatterns: [], riskVectors: [], isEmpty: true }
        })
        return
    }

    const files = await CaseFile.find({ userId, isTemporary: false })
        .select('name extractedText caseId')
        .limit(15)
        .sort({ createdAt: -1 })

    const caseSummaries = cases.map(c => `[CASE: ${c.name}] Area: ${c.practiceArea || 'General'}`).join('\n')
    const fileContext = files.map(f => `[UNIT: ${f.name}] ${f.extractedText ? f.extractedText.substring(0, 400) : 'No text content'}`).join('\n')
    const globalContext = `GLOBAL AUDIT\n\nCASES:\n${caseSummaries}\n\nDOCS:\n${fileContext}`

    const auditResults = await aiService.globalAudit(globalContext, userId?.toString())

    const estimatedTokens = globalContext.length / 4 + 2000
    const hoursToInc = Math.max(1, Math.round((estimatedTokens / 10000) * 10) / 10)
    
    User.findByIdAndUpdate(userId, {
        $inc: { 
            hoursSavedByAI: hoursToInc,
            hoursSavedToday: hoursToInc,
            totalTokensConsumed: Math.round(estimatedTokens)
        }
    }).catch(() => {});

    res.status(200).json({
        success: true,
        data: {
            ...auditResults,
            isEmpty: false
        }
    })
})
