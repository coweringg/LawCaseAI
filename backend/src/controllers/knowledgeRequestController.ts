import { Request, Response } from 'express'
import KnowledgeRequest from '../models/KnowledgeRequest'
import User from '../models/User'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const createKnowledgeRequest = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId || (req as any).user.id
    const user = await User.findById(userId)
    if (!user) throw new AppError('User not found', 404)

    const { description, category } = req.body
    if (!description || !category) throw new AppError('Incomplete information', 400)

    const request = new KnowledgeRequest({
        userId,
        organizationId: user.organizationId,
        description,
        category,
        status: 'pending'
    })

    await request.save()
    res.status(201).json({ success: true, message: 'Request uplinked successfully' })
})

export const getAdminKnowledgeRequests = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const [requests, total, pendingCount] = await Promise.all([
        KnowledgeRequest.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('userId', 'name email').populate('organizationId', 'name'),
        KnowledgeRequest.countDocuments(),
        KnowledgeRequest.countDocuments({ status: 'pending' })
    ])

    res.status(200).json({ 
        success: true, 
        data: { requests, total, pendingCount, page: Number(page), pages: Math.ceil(total / Number(limit)) } 
    })
})

export const updateKnowledgeRequestStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const { status } = req.body
    await KnowledgeRequest.findByIdAndUpdate(id, { status })
    res.status(200).json({ success: true, message: 'Status updated' })
})

export const deleteKnowledgeRequest = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    await KnowledgeRequest.findByIdAndDelete(id)
    res.status(200).json({ success: true, message: 'Request record purged' })
})

export const bulkResolveKnowledgeRequests = catchAsync(async (req: Request, res: Response) => {
    await KnowledgeRequest.updateMany({ status: 'pending' }, { status: 'resolved' })
    res.status(200).json({ success: true, message: 'All pending requests resolved' })
})

export const clearAllKnowledgeRequests = catchAsync(async (req: Request, res: Response) => {
    await KnowledgeRequest.deleteMany({})
    res.status(200).json({ success: true, message: 'All requests cleared' })
})
