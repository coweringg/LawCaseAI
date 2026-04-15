import { Request, Response } from 'express'
import KnowledgeDocument from '../models/KnowledgeDocument'
import User from '../models/User'
import { saveFileToStorage, deleteFromStorage } from '../utils/fileUpload'
import { extractTextFromPDF, extractTextFromPlainText, cleanExtractedText } from '../utils/pdfUtils'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const getKnowledgeDocuments = catchAsync(async (req: Request, res: Response) => {
    const { category, assignedTo, search, page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const query: any = {}

    if (category) query.category = category
    if (assignedTo) query.assignedTo = assignedTo
    if (search) {
        query.$or = [{ name: { $regex: search, $options: 'i' } }, { category: { $regex: search, $options: 'i' } }]
    }

    const [documents, total] = await Promise.all([
        KnowledgeDocument.find(query).sort({ uploadDate: -1 }).skip(skip).limit(Number(limit)).populate('uploadedBy', 'name email'),
        KnowledgeDocument.countDocuments(query)
    ])

    res.status(200).json({ 
        success: true, 
        data: { documents, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } 
    })
})

export const getUserLibrary = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId || (req as any).user.id
    const user = await User.findById(userId)
    if (!user) throw new AppError('User not found', 404)

    const { category, search } = req.query
    const query: any = { $or: [{ assignedTo: 'all' }] }

    if (user.organizationId) {
        query.$or.push({ assignedTo: user.organizationId })
    }

    if (category) query.category = category
    if (search) {
        query.$or.push({ name: { $regex: search, $options: 'i' } })
        query.$or.push({ category: { $regex: search, $options: 'i' } })
    }

    const documents = await KnowledgeDocument.find(query).sort({ uploadDate: -1 }).select('-fileKey -extractedText')
    res.status(200).json({ success: true, data: documents })
})

export const uploadKnowledgeDocument = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) throw new AppError('No document file provided', 400)

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
        name, category, assignedTo: assignedTo || 'all', fileUrl, fileKey, fileSize: req.file.size, fileType: req.file.mimetype, uploadedBy: userId, extractedText
    })

    res.status(201).json({ success: true, data: newDoc })
})

export const deleteKnowledgeDocument = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const document = await KnowledgeDocument.findById(id)
    if (!document) throw new AppError('Document not found', 404)

    await deleteFromStorage(document.fileKey)
    await KnowledgeDocument.findByIdAndDelete(id)

    res.status(200).json({ success: true, message: 'Document permanently purged' })
})

export const incrementDocumentAccess = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    await KnowledgeDocument.findByIdAndUpdate(id, { $inc: { accessCount: 1 } })
    res.status(200).json({ success: true })
})
