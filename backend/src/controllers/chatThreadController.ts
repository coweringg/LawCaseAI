import { Response } from 'express'
import { ChatThread, ChatMessage } from '../models'
import { IAuthRequest, IApiResponse } from '../types'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const getThreads = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    let threads = await ChatThread.find({ caseId, userId }).sort({ isDefault: -1, createdAt: 1 })

    if (threads.length === 0) {
        const defaultThread = await ChatThread.create({
            title: 'General',
            caseId,
            userId,
            isDefault: true
        })
        threads = [defaultThread]
    }

    const threadsWithMeta = await Promise.all(threads.map(async (thread) => {
        const threadObj = thread.toObject()
        const lastMessage = await ChatMessage.findOne({ threadId: thread._id })
            .sort({ timestamp: -1 })
            .select('content sender timestamp')
            .lean()
        const messageCount = await ChatMessage.countDocuments({ threadId: thread._id })
        return { ...threadObj, lastMessage, messageCount }
    }))

    res.status(200).json({
        success: true,
        data: threadsWithMeta
    } as IApiResponse)
})

export const createThread = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params
    const { title } = req.body
    const userId = req.user?._id

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    if (!title || !title.trim()) {
        throw new AppError('Thread title is required', 400)
    }

    const thread = await ChatThread.create({
        title: title.trim(),
        caseId,
        userId,
        isDefault: false
    })

    res.status(201).json({
        success: true,
        data: { ...thread.toObject(), lastMessage: null, messageCount: 0 }
    } as IApiResponse)
})

export const renameThread = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { threadId } = req.params
    const { title } = req.body
    const userId = req.user?._id

    if (!title || !title.trim()) {
        throw new AppError('Thread title is required', 400)
    }

    const thread = await ChatThread.findOneAndUpdate(
        { _id: threadId, userId },
        { title: title.trim() },
        { new: true }
    )

    if (!thread) {
        throw new AppError('Thread not found', 404)
    }

    res.status(200).json({
        success: true,
        data: thread
    } as IApiResponse)
})

export const deleteThread = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { threadId } = req.params
    const userId = req.user?._id

    const thread = await ChatThread.findOne({ _id: threadId, userId })

    if (!thread) {
        throw new AppError('Thread not found', 404)
    }

    if (thread.isDefault) {
        throw new AppError('Cannot delete the default thread', 400)
    }

    await ChatMessage.deleteMany({ threadId: thread._id })

    await ChatThread.findByIdAndDelete(thread._id)

    res.status(200).json({
        success: true,
        message: 'Thread and its messages deleted successfully'
    } as IApiResponse)
})

export const getThreadMessages = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { threadId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const thread = await ChatThread.findOne({ _id: threadId, userId })
    if (!thread) {
        throw new AppError('Thread not found', 404)
    }

    const messages = await ChatMessage.find({ threadId: thread._id })
        .sort({ timestamp: 1 })

    res.status(200).json({
        success: true,
        data: messages
    } as IApiResponse)
})
