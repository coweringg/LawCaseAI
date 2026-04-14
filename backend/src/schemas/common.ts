import { z } from 'zod'

export const mongoIdSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  'Invalid ID format'
)

export const mongoIdParamSchema = z.object({
  id: mongoIdSchema
})

export const caseIdParamSchema = z.object({
  caseId: mongoIdSchema
})

export const fileIdParamSchema = z.object({
  fileId: mongoIdSchema
})

export const memberIdParamSchema = z.object({
  memberId: mongoIdSchema
})
