import { z } from 'zod'
import { mongoIdSchema } from './common'

export const uploadFileSchema = z.object({
  caseId: mongoIdSchema,
  isTemporary: z.union([z.boolean(), z.string()]).optional()
})

export const commitFileSchema = z.object({
  fileId: mongoIdSchema,
  newFileName: z.string().trim().optional()
})

export const renameFileSchema = z.object({
  name: z.string().trim().min(1, 'File name is required')
})

export const bulkDeleteFileSchema = z.object({
  fileIds: z.array(mongoIdSchema).min(1, 'At least one file ID is required')
})

export const createFromTextSchema = z.object({
  caseId: mongoIdSchema,
  name: z.string().trim().min(1, 'File name is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.string().optional()
})
