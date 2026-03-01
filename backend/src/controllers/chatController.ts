import { Response } from 'express'
import { ChatMessage } from '../models'
import { IAuthRequest, IApiResponse } from '../types'
import logger from '../utils/logger'

const chatLogger = logger.child({ module: 'chat-controller' })

/**
 * @desc    Get chat history for a case
 * @route   GET /api/chat/case/:caseId
 * @access  Private
 */
export const getChatHistory = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { caseId } = req.params
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const messages = await ChatMessage.find({ 
            caseId, 
            userId 
        }).sort({ timestamp: 1 })

        res.status(200).json({
            success: true,
            data: messages
        } as IApiResponse)
    } catch (error: unknown) {
        chatLogger.error({ err: error, caseId: req.params.caseId }, 'Error fetching chat history')
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch chat history' 
        } as IApiResponse)
    }
}

/**
 * @desc    Clear chat history for a case
 * @route   DELETE /api/chat/case/:caseId
 * @access  Private
 */
export const clearChatHistory = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { caseId } = req.params
        const userId = req.user?._id

        await ChatMessage.deleteMany({ caseId, userId })

        res.status(200).json({
            success: true,
            message: 'Chat history cleared'
        } as IApiResponse)
    } catch (error: unknown) {
        chatLogger.error({ err: error, caseId: req.params.caseId }, 'Error clearing chat history')
        res.status(500).json({ success: false, message: 'Failed to clear chat history' } as IApiResponse)
    }
}
