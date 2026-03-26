import { Request, Response } from 'express'
import KnowledgeDocument from '../models/KnowledgeDocument'
import Organization from '../models/Organization'
import User from '../models/User'
import { saveFileToStorage, deleteFromStorage } from '../utils/fileUpload'
import { extractTextFromPDF, extractTextFromPlainText, cleanExtractedText } from '../utils/pdfUtils'

export const getKnowledgeDocuments = async (req: Request, res: Response) => {
    try {
        const { category, assignedTo, search } = req.query
        const query: any = {}

        if (category) query.category = category
        if (assignedTo) query.assignedTo = assignedTo
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ]
        }

        const documents = await KnowledgeDocument.find(query)
            .sort({ uploadDate: -1 })
            .populate('uploadedBy', 'name email')

        return res.json({ success: true, data: documents })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve knowledge base documents' })
    }
}

export const getUserLibrary = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId || (req as any).user.id
        const user = await User.findById(userId)
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        const { category, search } = req.query
        const query: any = {
            $or: [
                { assignedTo: 'all' }
            ]
        }

        if (user.organizationId) {
            query.$or.push({ assignedTo: user.organizationId })
        }

        if (category) query.category = category
        if (search) {
            query.$or.push({ name: { $regex: search, $options: 'i' } })
            query.$or.push({ category: { $regex: search, $options: 'i' } })
        }

        const documents = await KnowledgeDocument.find(query)
            .sort({ uploadDate: -1 })
            .select('-fileKey -extractedText')

        return res.json({ success: true, data: documents })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to access legal library' })
    }
}

export const uploadKnowledgeDocument = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No document file provided' })
        }

        const { name, category, assignedTo } = req.body
        const userId = (req as any).user.id
        const fileKey = `knowledge-base/${Date.now()}-${req.file.originalname}`
        const fileUrl = await saveFileToStorage(req.file, fileKey)

        let extractedText = ''
        if (req.file.mimetype === 'application/pdf') {
            extractedText = await extractTextFromPDF(req.file.buffer)
        } else if (req.file.mimetype === 'text/plain') {
            extractedText = extractTextFromPlainText(req.file.buffer)
        }
        extractedText = cleanExtractedText(extractedText)

        const newDoc = await KnowledgeDocument.create({
            name,
            category,
            assignedTo: assignedTo || 'all',
            fileUrl,
            fileKey,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            uploadedBy: userId,
            extractedText
        })

        return res.status(201).json({ success: true, data: newDoc })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to execute document uplink' })
    }
}

export const deleteKnowledgeDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const document = await KnowledgeDocument.findById(id)

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' })
        }

        await deleteFromStorage(document.fileKey)
        await KnowledgeDocument.findByIdAndDelete(id)

        return res.json({ success: true, message: 'Document permanently purged from knowledge vault' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to delete knowledge document' })
    }
}

export const incrementDocumentAccess = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await KnowledgeDocument.findByIdAndUpdate(id, { $inc: { accessCount: 1 } })
        return res.json({ success: true })
    } catch (error) {
        return res.status(500).json({ success: false })
    }
}
