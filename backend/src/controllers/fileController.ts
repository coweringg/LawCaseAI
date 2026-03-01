import { Response } from 'express'
import { Case, User, CaseFile } from '../models'
import { IApiResponse, IAuthRequest } from '../types'
import { saveFileToStorage, deleteFromStorage, generateFileKey } from '../utils/fileUpload'
import { logAction } from '../utils/auditLogger'
import { extractTextFromPDF, extractTextFromPlainText, cleanExtractedText } from '../utils/pdfUtils'
import config from '../config'
import PDFDocument from 'pdfkit'
import { Document, Packer, Paragraph, TextRun } from 'docx'

export const uploadFile = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { caseId } = req.body
        const isTemporary = req.body.isTemporary === 'true' || req.body.isTemporary === true
        const file = req.file
        const userId = req.user?._id

        if (!userId || !file || !caseId) {
            res.status(400).json({ success: false, message: 'Unable to upload file. Please ensure you have selected a valid file and case.' } as IApiResponse)
            return
        }

        // Verify case and user plan limits
        const lawyerCase = await Case.findOne({ _id: caseId, userId })
        if (!lawyerCase) {
            res.status(404).json({ success: false, message: 'The specified case could not be found for file association.' } as IApiResponse)
            return
        }

        const user = req.user || await User.findById(userId)
        const plan = user?.plan || 'none'
        const limits = (config.planLimits as any)[plan] || config.planLimits.basic

        // Check document count limit only if not temporary
        if (!isTemporary && lawyerCase.fileCount >= limits.maxFilesPerCase) {
            res.status(403).json({ 
                success: false, 
                message: `Plan Limit Reached: Your current plan allows a maximum of ${limits.maxFilesPerCase} documents per case.` 
            } as IApiResponse)
            return
        }

        // Check file size limit
        if (file.size > limits.maxFileSize) {
            res.status(403).json({ 
                success: false, 
                message: `File too large: The maximum file size for your plan is ${Math.round(limits.maxFileSize / 1024 / 1024)}MB.` 
            } as IApiResponse)
            return
        }

        // Check total storage limit
        if (!isTemporary && user && (user.totalStorageUsed || 0) + file.size > limits.maxTotalStorage) {
            res.status(403).json({ 
                success: false, 
                message: `Storage Limit Reached: Your total storage usage would exceed the ${Math.round(limits.maxTotalStorage / 1024 / 1024)}MB allowed by your plan.` 
            } as IApiResponse)
            return
        }

        const key = generateFileKey(userId.toString(), caseId, file.originalname)
        const url = await saveFileToStorage(file, key)

        // Extract text if it's a PDF or Plain Text
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
            // Update case file count
            lawyerCase.fileCount += 1
            await lawyerCase.save()

            // Update user total storage usage
            await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: file.size } })
        }

        // Log the action only if not temporary
        if (!isTemporary) {
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
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload file'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}

export const getCaseFiles = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { caseId } = req.params
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
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
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Failed to fetch files' } as IApiResponse)
    }
}

export const deleteFile = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { fileId } = req.params
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const file = await CaseFile.findOne({ _id: fileId, userId })
        if (!file) {
            res.status(404).json({ success: false, message: 'File not found' } as IApiResponse)
            return
        }

        // Delete from storage
        await deleteFromStorage(file.key)

        // Delete from DB
        await CaseFile.deleteOne({ _id: fileId })

        // Update case file count only if it wasn't temporary
        if (!file.isTemporary) {
            await Case.updateOne({ _id: file.caseId }, { $inc: { fileCount: -1 } })
            // Update user total storage usage
            await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: -file.size } })
        }

        // Log the action
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
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Failed to delete file' } as IApiResponse)
    }
}

export const deleteMultipleFiles = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { fileIds } = req.body
        const userId = req.user?._id

        if (!userId || !Array.isArray(fileIds) || fileIds.length === 0) {
            res.status(400).json({ success: false, message: 'Invalid or empty file collection' } as IApiResponse)
            return
        }

        const files = await CaseFile.find({ _id: { $in: fileIds }, userId })
        if (files.length === 0) {
            res.status(404).json({ success: false, message: 'No valid units found for purging' } as IApiResponse)
            return
        }

        const caseIds = [...new Set(files.map(f => f.caseId.toString()))]

        // Delete from storage
        for (const file of files) {
            await deleteFromStorage(file.key)
        }

        // Delete from DB
        await CaseFile.deleteMany({ _id: { $in: fileIds }, userId })

        // Update case file counts and user total storage
        for (const cId of caseIds) {
            const caseFiles = files.filter(f => f.caseId.toString() === cId && !f.isTemporary)
            const count = caseFiles.length
            const totalSize = caseFiles.reduce((sum, f) => sum + f.size, 0)

            if (count > 0) {
                await Case.updateOne({ _id: cId }, { $inc: { fileCount: -count } })
                await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: -totalSize } })
            }
        }

        // Log the action
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
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Failed to execute bulk purge' } as IApiResponse)
    }
}

export const renameFile = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { fileId } = req.params
        const { name } = req.body
        const userId = req.user?._id

        if (!userId || !name) {
            res.status(400).json({ success: false, message: 'File ID and new name are required' } as IApiResponse)
            return
        }

        const file = await CaseFile.findOne({ _id: fileId, userId })
        if (!file) {
            res.status(404).json({ success: false, message: 'File not found' } as IApiResponse)
            return
        }

        const oldName = file.name
        file.name = name
        await file.save()

        // Log the action
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
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Failed to rename file' } as IApiResponse)
    }
}

export const toggleStarFile = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { fileId } = req.params
        const userId = req.user?._id

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
            return
        }

        const file = await CaseFile.findOne({ _id: fileId, userId })
        if (!file) {
            res.status(404).json({ success: false, message: 'File not found' } as IApiResponse)
            return
        }

        file.isStarred = !file.isStarred
        await file.save()

        res.status(200).json({
            success: true,
            message: file.isStarred ? 'File starred' : 'File unstarred',
            data: file
        } as IApiResponse)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Failed to toggle star status' } as IApiResponse)
    }
}

export const commitFile = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { fileId, newFileName } = req.body
        const userId = req.user?._id

        if (!userId || !fileId) {
            res.status(400).json({ success: false, message: 'File ID is required to commit.' } as IApiResponse)
            return
        }

        const file = await CaseFile.findOne({ _id: fileId, userId })
        if (!file) {
            res.status(404).json({ success: false, message: 'File not found' } as IApiResponse)
            return
        }

        if (!file.isTemporary) {
            res.status(400).json({ success: false, message: 'File is already saved to documents.' } as IApiResponse)
            return
        }

        const lawyerCase = await Case.findOne({ _id: file.caseId, userId })
        if (!lawyerCase) {
             res.status(404).json({ success: false, message: 'Associated case not found.' } as IApiResponse)
             return
        }

        const user = req.user || await User.findById(userId)
        const plan = user?.plan || 'none'
        const limits = (config.planLimits as any)[plan] || config.planLimits.basic

        if (lawyerCase.fileCount >= limits.maxFilesPerCase) {
             res.status(403).json({ 
                 success: false, 
                 message: `Plan Limit Reached: Your current plan allows a maximum of ${limits.maxFilesPerCase} documents per case.` 
             } as IApiResponse)
             return
        }

        if (newFileName && typeof newFileName === 'string' && newFileName.trim() !== '') {
            file.name = newFileName.trim()
        }

        file.isTemporary = false
        await file.save()

        lawyerCase.fileCount += 1
        await lawyerCase.save()

        // Update user total storage usage when committing a temporary file
        await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: file.size } })

        // Log the action
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
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Failed to save file.' } as IApiResponse)
    }
}

/**
 * Clean AI content from technical markers and reminders
 */
const cleanAIContent = (text: string): string => {
    return text
        // Remove proactive reminders about saving or committing
        .replace(/\*\*Proactive Reminder:\*\*[\s\S]*?(?=\n\n|$)/gi, '')
        .replace(/\*Note: As an AI legal assistant, I provide general information[\s\S]*?(?=\n\n|$)/gi, '')
        // Remove markdown artifacts if they are too prominent (optional, keeping basic ones for structure)
        .replace(/\*\*\*[\s\S]*?(?=\n\n|$)/gi, '')
        .trim();
};

export const createFileFromText = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { caseId, name, content, type } = req.body
        const userId = req.user?._id

        if (!userId || !caseId || !name || !content) {
            res.status(400).json({ success: false, message: 'Case ID, name, and content are required.' } as IApiResponse)
            return
        }

        const lawyerCase = await Case.findOne({ _id: caseId, userId })
        if (!lawyerCase) {
            res.status(404).json({ success: false, message: 'Case not found.' } as IApiResponse)
            return
        }

        const user = req.user || await User.findById(userId)
        const plan = user?.plan || 'none'
        const limits = (config.planLimits as any)[plan] || config.planLimits.basic

        if (lawyerCase.fileCount >= limits.maxFilesPerCase) {
            res.status(403).json({ 
                success: false, 
                message: `Plan Limit Reached: Your current plan allows a maximum of ${limits.maxFilesPerCase} documents per case.` 
            } as IApiResponse)
            return
        }

        let finalBuffer: Buffer
        let finalMimeType: string
        let fileName: string

        if (type === 'application/pdf') {
            finalMimeType = 'application/pdf'
            fileName = name.endsWith('.pdf') ? name : `${name}.pdf`
            
            const cleanContent = cleanAIContent(content)
            
            // Generate PDF using pdfkit
            const doc = new PDFDocument({ margin: 50 })
            const chunks: Buffer[] = []
            doc.on('data', (chunk) => chunks.push(chunk))
            
            // Professional Header
            doc.fillColor('#2563eb')
               .fontSize(22)
               .text('LAWCASE AI', { align: 'left' })
            
            doc.fillColor('#64748b')
               .fontSize(8)
               .text('NEURAL ANALYSIS UNIT • CONFIDENTIAL', { align: 'right' })
               .moveDown(2)
            
            doc.strokeColor('#e2e8f0')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke()
               .moveDown(2)

            // Document Title
            doc.fillColor('#1e293b')
               .fontSize(16)
               .font('Helvetica-Bold')
               .text(name.replace('.pdf', ''), { align: 'left' })
               .moveDown(1)
            
            // Content
            doc.fillColor('#334155')
               .fontSize(11)
               .font('Helvetica')
               .lineGap(4)
               .text(cleanContent, {
                   align: 'justify',
                   indent: 0,
                   paragraphGap: 10
               })
            
            doc.end()
            
            await new Promise((resolve) => doc.on('end', resolve))
            finalBuffer = Buffer.concat(chunks)
        } else if (type?.includes('word')) {
            finalMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            fileName = name.endsWith('.docx') ? name : `${name}.docx`
            
            // Generate DOCX using docx lib
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [new TextRun({ text: name, bold: true, size: 32, color: '2563eb' })],
                            spacing: { after: 400 }
                        }),
                        ...cleanAIContent(content).split('\n').map((line: string) => {
                            if (!line.trim()) return new Paragraph({ spacing: { after: 200 } });
                            
                            const isHeading = line.startsWith('###') || line.startsWith('##');
                            const cleanLine = line.replace(/^#+\s/, '');
                            
                            return new Paragraph({
                                children: [new TextRun({ 
                                    text: cleanLine, 
                                    bold: isHeading, 
                                    size: isHeading ? 28 : 22 
                                })],
                                spacing: { after: 200 }
                            });
                        })
                    ],
                }],
            })
            finalBuffer = await Packer.toBuffer(doc)
        } else {
            // Default to markdown/text
            finalMimeType = 'text/markdown'
            fileName = name.endsWith('.md') || name.endsWith('.txt') ? name : `${name}.md`
            finalBuffer = Buffer.from(content)
        }

        const key = generateFileKey(userId.toString(), caseId, fileName)
        
        // Mock Multer file object for the storage utility
        const mockFile = {
            buffer: finalBuffer,
            originalname: fileName,
            mimetype: finalMimeType,
            size: finalBuffer.length
        } as Express.Multer.File

        const url = await saveFileToStorage(mockFile, key)

        const newCaseFile = new CaseFile({
            name: fileName,
            originalName: fileName,
            size: finalBuffer.length,
            type: finalMimeType,
            url,
            key,
            caseId,
            userId,
            extractedText: content,
            isTemporary: false
        })

        await newCaseFile.save()

        lawyerCase.fileCount += 1
        await lawyerCase.save()

        // Update user total storage usage
        await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: finalBuffer.length } })

        // Log the action
        await logAction({
            adminId: userId,
            adminName: lawyerCase.name,
            targetId: newCaseFile._id,
            targetName: newCaseFile.name,
            targetType: 'case',
            category: 'platform',
            action: 'FILE_UPLOADED',
            after: { fileName: newCaseFile.name, caseName: lawyerCase.name },
            description: `User saved AI analysis summary as "${newCaseFile.name}" (${finalMimeType})`
        })

        res.status(201).json({
            success: true,
            message: `Summary saved as ${fileName} successfully.`,
            data: newCaseFile
        } as IApiResponse)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create file from text'
        res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
    }
}
