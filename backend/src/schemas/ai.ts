import { z } from 'zod'
import { mongoIdSchema } from './common'

export const chatSchema = z.object({
  message: z.string()
    .trim()
    .min(1, 'Message is required')
    .max(5000, 'Message cannot exceed 5000 characters'),
  caseId: mongoIdSchema.optional(),
  temporaryFileId: mongoIdSchema.optional()
})

export const analyzeParamsSchema = z.object({
  fileId: mongoIdSchema
})

export const summaryParamsSchema = z.object({
  caseId: mongoIdSchema
})

export type ChatInput = z.infer<typeof chatSchema>
