import { Response } from 'express'
import { ChatMessage } from '../models'
import { IAuthRequest, IApiResponse } from '../types'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const getChatHistory = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const messages = await ChatMessage.find({ 
        caseId, 
        userId 
    }).sort({ timestamp: 1 })

    res.status(200).json({
        success: true,
        data: messages
    } as IApiResponse)
})

export const clearChatHistory = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params
    const userId = req.user?._id

    await ChatMessage.deleteMany({ caseId, userId })

    res.status(200).json({
        success: true,
        message: 'Chat history cleared'
    } as IApiResponse)
})
