import { Response } from 'express'
import { Case, User, CaseFile } from '../models'
import { IApiResponse, IAuthRequest } from '../types'
import { saveFileToStorage, deleteFromStorage, generateFileKey } from '../utils/fileUpload'
import { logAction } from '../utils/auditLogger'
import { extractTextFromPDF, extractTextFromPlainText, cleanExtractedText } from '../utils/pdfUtils'
import config from '../config'
import PDFDocument from 'pdfkit'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const uploadFile = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.body
    const isTemporary = req.body.isTemporary === 'true' || req.body.isTemporary === true
    const file = req.file
    const userId = req.user?._id

    if (!userId || !file || !caseId) {
        throw new AppError('Unable to upload file. Please ensure you have selected a valid file and case.', 400)
    }

    const lawyerCase = await Case.findOne({ _id: caseId, userId })
    if (!lawyerCase) {
        throw new AppError('The specified case could not be found for file association.', 404)
    }

    const user = req.user || await User.findById(userId)
    const plan = user?.plan || 'none'
    const limits = (config.planLimits as any)[plan] || config.planLimits.basic

    if (!isTemporary && lawyerCase.fileCount >= limits.maxFilesPerCase) {
        throw new AppError(`You have reached the maximum document limit per case for your current plan (${limits.maxFilesPerCase} units).`, 403)
    }

    if (file.size > limits.maxFileSize) {
        throw new AppError(`The file exceeds the maximum size allowed for your plan (${Math.round(limits.maxFileSize / 1024 / 1024)}MB).`, 403)
    }

    if (!isTemporary && user && (lawyerCase.totalStorageUsed || 0) + file.size > limits.maxTotalStorage) {
        throw new AppError(`This case has reached its total storage capacity (${Math.round(limits.maxTotalStorage / 1024 / 1024)}MB).`, 403)
    }

    const key = generateFileKey(userId.toString(), caseId, file.originalname)
    const url = await saveFileToStorage(file, key)

    let extractedText = ''
    if (file.mimetype === 'application/pdf') {
        const rawText = await extractTextFromPDF(file.buffer)
        extractedText = cleanExtractedText(rawText)
    } else if (file.mimetype === 'text/plain') {
        const rawText = extractTextFromPlainText(file.buffer)
        extractedText = cleanExtractedText(rawText)
    }

    const newCaseFile = new CaseFile({
        name: file.originalname,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype,
        url,
        key,
        caseId,
        userId,
        extractedText,
        isTemporary
    })

    await newCaseFile.save()

    if (!isTemporary) {
        await Case.findByIdAndUpdate(caseId, { $inc: { fileCount: 1, totalStorageUsed: file.size } })
        await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: file.size } })

        await logAction({
            adminId: userId,
            adminName: lawyerCase.name, 
            targetId: newCaseFile._id,
            targetName: newCaseFile.name,
            targetType: 'case',
            category: 'platform',
            action: 'FILE_UPLOADED',
            after: { fileName: file.originalname, caseName: lawyerCase.name },
            description: `User uploaded file "${file.originalname}" to case "${lawyerCase.name}"`
        })
    }

    res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: newCaseFile
    } as IApiResponse)
})

export const getCaseFiles = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { caseId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const files = await CaseFile.find({ 
        caseId, 
        userId, 
        $or: [{ isTemporary: false }, { isTemporary: { $exists: false } }] 
    }).sort({ createdAt: -1 })

    res.status(200).json({
        success: true,
        data: files
    } as IApiResponse)
})

export const deleteFile = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { fileId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const file = await CaseFile.findOne({ _id: fileId, userId })
    if (!file) {
        throw new AppError('File not found', 404)
    }

    await deleteFromStorage(file.key)
    await CaseFile.deleteOne({ _id: fileId })

    if (!file.isTemporary) {
        await Case.updateOne({ _id: file.caseId }, { $inc: { fileCount: -1, totalStorageUsed: -file.size } })
        await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: -file.size } })
    }

    await logAction({
        adminId: userId,
        adminName: 'System', 
        targetId: file._id,
        targetName: file.name,
        targetType: 'case',
        category: 'platform',
        action: 'FILE_DELETED',
        description: `User deleted file "${file.name}"`
    })

    res.status(200).json({
        success: true,
        message: 'File deleted successfully'
    } as IApiResponse)
})

export const deleteMultipleFiles = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { fileIds } = req.body
    const userId = req.user?._id

    if (!userId || !Array.isArray(fileIds) || fileIds.length === 0) {
        throw new AppError('Invalid or empty file collection', 400)
    }

    const files = await CaseFile.find({ _id: { $in: fileIds }, userId })
    if (files.length === 0) {
        throw new AppError('No valid units found for purging', 404)
    }

    const caseIds = [...new Set(files.map(f => f.caseId.toString()))]

    for (const file of files) {
        await deleteFromStorage(file.key)
    }

    await CaseFile.deleteMany({ _id: { $in: fileIds }, userId })

    for (const cId of caseIds) {
        const caseFiles = files.filter(f => f.caseId.toString() === cId && !f.isTemporary)
        const count = caseFiles.length
        const totalSize = caseFiles.reduce((sum, f) => sum + f.size, 0)

        if (count > 0) {
            await Case.updateOne({ _id: cId }, { $inc: { fileCount: -count, totalStorageUsed: -totalSize } })
            await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: -totalSize } })
        }
    }

    await logAction({
        adminId: userId,
        adminName: 'System',
        targetName: 'Multiple Units',
        targetType: 'case',
        category: 'platform',
        action: 'BULK_FILE_DELETED',
        description: `User performed bulk purge of ${files.length} units`
    })

    res.status(200).json({
        success: true,
        message: `${files.length} units successfully purged from repository`
    } as IApiResponse)
})

export const renameFile = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { fileId } = req.params
    const { name } = req.body
    const userId = req.user?._id

    if (!userId || !name) {
        throw new AppError('File ID and new name are required', 400)
    }

    const file = await CaseFile.findOne({ _id: fileId, userId })
    if (!file) {
        throw new AppError('File not found', 404)
    }

    const oldName = file.name
    file.name = name
    await file.save()

    await logAction({
        adminId: userId,
        adminName: 'System',
        targetId: file._id,
        targetName: name,
        targetType: 'case',
        category: 'platform',
        action: 'FILE_RENAMED',
        description: `User renamed file from "${oldName}" to "${name}"`
    })

    res.status(200).json({
        success: true,
        message: 'File renamed successfully',
        data: file
    } as IApiResponse)
})

export const toggleStarFile = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { fileId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }

    const file = await CaseFile.findOne({ _id: fileId, userId })
    if (!file) {
        throw new AppError('File not found', 404)
    }

    file.isStarred = !file.isStarred
    await file.save()

    res.status(200).json({
        success: true,
        message: file.isStarred ? 'File starred' : 'File unstarred',
        data: file
    } as IApiResponse)
})

export const commitFile = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { fileId, newFileName } = req.body
    const userId = req.user?._id

    if (!userId || !fileId) {
        throw new AppError('File ID is required to commit.', 400)
    }

    const file = await CaseFile.findOne({ _id: fileId, userId })
    if (!file) {
        throw new AppError('File not found', 404)
    }

    if (!file.isTemporary) {
        throw new AppError('File is already saved to documents.', 400)
    }

    const lawyerCase = await Case.findOne({ _id: file.caseId, userId })
    if (!lawyerCase) {
         throw new AppError('Associated case not found.', 404)
    }

    const user = req.user || await User.findById(userId)
    const plan = user?.plan || 'none'
    const limits = (config.planLimits as any)[plan] || config.planLimits.basic

    if (lawyerCase.fileCount >= limits.maxFilesPerCase) {
         throw new AppError(`You have reached the maximum document limit per case for your plan (${limits.maxFilesPerCase} units).`, 403)
    }

    if ((lawyerCase.totalStorageUsed || 0) + file.size > limits.maxTotalStorage) {
         throw new AppError(`This case has reached its total storage capacity (${Math.round(limits.maxTotalStorage / 1024 / 1024)}MB).`, 403)
    }

    if (newFileName && typeof newFileName === 'string' && newFileName.trim() !== '') {
        file.name = newFileName.trim()
    }

    file.isTemporary = false
    await file.save()

    await Case.findByIdAndUpdate(file.caseId, { $inc: { fileCount: 1, totalStorageUsed: file.size } })
    await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: file.size } })

    await logAction({
        adminId: userId,
        adminName: lawyerCase.name,
        targetId: file._id,
        targetName: file.name,
        targetType: 'case',
        category: 'platform',
        action: 'FILE_UPLOADED',
        after: { fileName: file.originalName, caseName: lawyerCase.name },
        description: `User saved temporary file "${file.originalName}" to case documents.`
    })

    res.status(200).json({
        success: true,
        message: 'File saved to documents successfully.',
        data: file
    } as IApiResponse)
})

const cleanAIContent = (text: string): string => {
    return text
        .replace(/\*\*Proactive Reminder:\*\*[\s\S]*?(?=\n\n|$)/gi, '')
        .replace(/\*Note: As an AI legal assistant, I provide general information[\s\S]*?(?=\n\n|$)/gi, '')
        .replace(/\*\*\*[\s\S]*?(?=\n\n|$)/gi, '')
        .trim();
};

export const createFileFromText = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const { caseId, name, content, type } = req.body
    const userId = req.user?._id

    if (!userId || !caseId || !name || !content) {
        throw new AppError('Case ID, name, and content are required.', 400)
    }

    const lawyerCase = await Case.findOne({ _id: caseId, userId })
    if (!lawyerCase) {
        throw new AppError('Case not found.', 404)
    }

    const user = req.user || await User.findById(userId)
    const plan = user?.plan || 'none'
    const limits = (config.planLimits as any)[plan] || config.planLimits.basic

    const estimatedSize = Buffer.byteLength(content, 'utf8')
    if (lawyerCase.fileCount >= limits.maxFilesPerCase) {
        throw new AppError(`Maximum document limit reached (${limits.maxFilesPerCase} units).`, 403)
    }

    if ((lawyerCase.totalStorageUsed || 0) + estimatedSize > limits.maxTotalStorage) {
        throw new AppError('Storage limit reached for this case.', 403)
    }

    let finalBuffer: Buffer
    let finalMimeType: string
    let fileName: string

    if (type === 'application/pdf') {
        finalMimeType = 'application/pdf'
        fileName = name.endsWith('.pdf') ? name : `${name}.pdf`
        const cleanContent = cleanAIContent(content)
        const doc = new PDFDocument({ margin: 50 })
        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        
        doc.fillColor('#2563eb').fontSize(22).text('LAWCASE AI', { align: 'left' })
        doc.fillColor('#64748b').fontSize(8).text('NEURAL ANALYSIS UNIT • CONFIDENTIAL', { align: 'right' }).moveDown(2)
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(2)
        doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold').text(name.replace('.pdf', ''), { align: 'left' }).moveDown(1)
        doc.fillColor('#334155').fontSize(11).font('Helvetica').lineGap(4).text(cleanContent, { align: 'justify', paragraphGap: 10 })
        
        doc.end()
        await new Promise((resolve) => doc.on('end', resolve))
        finalBuffer = Buffer.concat(chunks)
    } else if (type?.includes('word')) {
        finalMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        fileName = name.endsWith('.docx') ? name : `${name}.docx`
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ children: [new TextRun({ text: name, bold: true, size: 32, color: '2563eb' })], spacing: { after: 400 } }),
                    ...cleanAIContent(content).split('\n').map((line: string) => {
                        const isHeading = line.startsWith('###') || line.startsWith('##');
                        return new Paragraph({ children: [new TextRun({ text: line.replace(/^#+\s/, ''), bold: isHeading, size: isHeading ? 28 : 22 })], spacing: { after: 200 } });
                    })
                ],
            }],
        })
        finalBuffer = await Packer.toBuffer(doc)
    } else {
        finalMimeType = 'text/markdown'
        fileName = name.endsWith('.md') ? name : `${name}.md`
        finalBuffer = Buffer.from(content)
    }

    const key = generateFileKey(userId.toString(), caseId, fileName)
    const url = await saveFileToStorage({ buffer: finalBuffer, originalname: fileName, mimetype: finalMimeType } as any, key)

    const newCaseFile = new CaseFile({ name: fileName, originalName: fileName, size: finalBuffer.length, type: finalMimeType, url, key, caseId, userId, extractedText: content, isTemporary: false })
    await newCaseFile.save()

    await Case.findByIdAndUpdate(caseId, { $inc: { fileCount: 1, totalStorageUsed: finalBuffer.length } })
    await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: finalBuffer.length } })

    await logAction({
        adminId: userId, adminName: lawyerCase.name, targetId: newCaseFile._id, targetName: newCaseFile.name, targetType: 'case', category: 'platform', action: 'FILE_UPLOADED', description: `User saved AI analysis as "${newCaseFile.name}"`
    })

    res.status(201).json({ success: true, message: 'File created successfully', data: newCaseFile })
})
