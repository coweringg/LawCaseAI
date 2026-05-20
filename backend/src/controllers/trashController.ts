import { Response } from 'express'
import { Case, CaseFile, User } from '../models'
import { IApiResponse, IAuthRequest } from '../types'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { deleteFromStorage } from '../utils/fileUpload'

const trashFilter = { deletedAt: { $ne: null } }

const tryDeleteFromStorage = async (key?: string): Promise<void> => {
  if (!key) return
  try {
    await deleteFromStorage(key)
  } catch {
  }
}

export const getCaseTrashItems = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
  const userId = req.user?._id
  const { caseId } = req.params
  if (!userId) throw new AppError('Unauthorized', 401)

  const caseDoc = await Case.findOne({ _id: caseId, userId, deletedAt: null })
  if (!caseDoc) throw new AppError('Case not found', 404)

  const deletedFiles = await CaseFile.find({ userId, caseId, ...trashFilter }).sort({ deletedAt: -1 })

  res.status(200).json({
    success: true,
    message: 'Case trash retrieved successfully',
    data: { files: deletedFiles }
  } as IApiResponse)
})

export const restoreItem = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
  const userId = req.user?._id
  const { type, id } = req.params
  if (!userId) throw new AppError('Unauthorized', 401)

  if (type === 'file') {
    const file = await CaseFile.findOne({ _id: id, userId, ...trashFilter })
    if (!file) throw new AppError('Item not found in trash', 404)

    const caseDoc = await Case.findOne({ _id: file.caseId, userId, deletedAt: null })
    if (!caseDoc) throw new AppError('The parent case no longer exists, so this file cannot be restored.', 400)

    file.deletedAt = null
    await file.save()

    if (!file.isTemporary) {
      await Case.updateOne({ _id: file.caseId }, { $inc: { fileCount: 1, totalStorageUsed: file.size } })
      await User.findByIdAndUpdate(userId, { $inc: { totalStorageUsed: file.size } })
    }

    res.status(200).json({ success: true, message: 'File restored successfully' } as IApiResponse)
    return
  }

  throw new AppError('Only files can be restored from trash', 400)
})

export const permanentDelete = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
  const userId = req.user?._id
  const { type, id } = req.params
  if (!userId) throw new AppError('Unauthorized', 401)

  if (type === 'file') {
    const file = await CaseFile.findOne({ _id: id, userId, ...trashFilter })
    if (!file) throw new AppError('Item not found in trash', 404)

    await tryDeleteFromStorage(file.key)
    await CaseFile.deleteOne({ _id: id, userId })

    res.status(200).json({ success: true, message: 'File permanently deleted' } as IApiResponse)
    return
  }

  throw new AppError('Only files can be permanently deleted from trash', 400)
})
