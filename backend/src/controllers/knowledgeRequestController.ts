import { Request, Response } from 'express'
import KnowledgeRequest from '../models/KnowledgeRequest'
import User from '../models/User'

export const createKnowledgeRequest = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId || (req as any).user.id
        const user = await User.findById(userId)
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const { description, category } = req.body
        if (!description || !category) {
            return res.status(400).json({ success: false, message: 'Incomplete information' })
        }

        const request = new KnowledgeRequest({
            userId,
            organizationId: user.organizationId,
            description,
            category,
            status: 'pending'
        })

        await request.save()
        return res.status(201).json({ success: true, message: 'Request uplinked successfully' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to process document request' })
    }
}

export const getAdminKnowledgeRequests = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const skip = (Number(page) - 1) * Number(limit)

        const [requests, total, pendingCount] = await Promise.all([
            KnowledgeRequest.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('userId', 'name email')
                .populate('organizationId', 'name'),
            KnowledgeRequest.countDocuments(),
            KnowledgeRequest.countDocuments({ status: 'pending' })
        ])

        return res.json({ 
            success: true, 
            data: {
                requests,
                total,
                pendingCount,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            } 
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve documentation requests' })
    }
}

export const updateKnowledgeRequestStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { status } = req.body
        
        await KnowledgeRequest.findByIdAndUpdate(id, { status })
        return res.json({ success: true, message: 'Vault status updated' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Status modification failed' })
    }
}

export const deleteKnowledgeRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await KnowledgeRequest.findByIdAndDelete(id)
        return res.json({ success: true, message: 'Request record purged' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Record elimination failed' })
    }
}

export const bulkResolveKnowledgeRequests = async (req: Request, res: Response) => {
    try {
        await KnowledgeRequest.updateMany({ status: 'pending' }, { status: 'resolved' })
        return res.json({ success: true, message: 'Global repository cleared' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Bulk update unsuccessful' })
    }
}

export const clearAllKnowledgeRequests = async (req: Request, res: Response) => {
    try {
        await KnowledgeRequest.deleteMany({})
        return res.json({ success: true, message: 'Vault requests emptied' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to clear system requests' })
    }
}
