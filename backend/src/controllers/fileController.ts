import { Response } from 'express'
import { Case, CaseFile } from '../models'
import { IApiResponse, IAuthRequest } from '../types'
import { uploadToR2, generateFileKey } from '../utils/fileUpload'
import { logAction } from '../utils/auditLogger'

export const uploadFile = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { caseId } = req.body
        const file = req.file
        const userId = req.user?._id

        if (!userId || !file || !caseId) {
            res.status(400).json({ success: false, message: 'Missing required fields' } as IApiResponse)
            return
        }

        // Verify case ownership
        const lawyerCase = await Case.findOne({ _id: caseId, userId })
        if (!lawyerCase) {
            res.status(404).json({ success: false, message: 'Case not found' } as IApiResponse)
            return
        }

        const key = generateFileKey(userId.toString(), caseId, file.originalname)
        const url = await uploadToR2(file, key)

        const newCaseFile = new CaseFile({
            name: file.originalname,
            originalName: file.originalname,
            size: file.size,
            type: file.mimetype,
            url,
            key,
            caseId,
            userId
        })

        await newCaseFile.save()

        // Update case file count
        lawyerCase.fileCount += 1
        await lawyerCase.save()

        // Log the action
        await logAction({
            adminId: userId,
            adminName: lawyerCase.name, // We use the case name or user name but mostly name for logs
            targetId: newCaseFile._id,
            targetName: newCaseFile.name,
            targetType: 'case', // Files are associated with cases
            category: 'platform',
            action: 'FILE_UPLOADED',
            after: { fileName: file.originalname, caseName: lawyerCase.name },
            description: `User uploaded file "${file.originalname}" to case "${lawyerCase.name}"`
        })

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

        const files = await CaseFile.find({ caseId, userId }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            data: files
        } as IApiResponse)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Failed to fetch files' } as IApiResponse)
    }
}
