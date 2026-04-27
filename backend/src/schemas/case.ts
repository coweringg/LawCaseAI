import { z } from 'zod'
import { mongoIdSchema } from './common'

export const createCaseSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Case name is required')
    .max(200, 'Case name cannot exceed 200 characters'),
  client: z.string()
    .trim()
    .min(1, 'Client name is required')
    .max(200, 'Client name cannot exceed 200 characters'),
  description: z.string()
    .trim()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  practiceArea: z.string()
    .trim()
    .max(100, 'Practice area cannot exceed 100 characters')
    .optional(),
  status: z.enum(['active', 'pending', 'discovery'])
    .optional(),
  complexity: z.enum(['1', '2', '3'])
    .optional(),
  keyDates: z.array(z.object({
    title: z.string(),
    date: z.string(),
    type: z.string().optional(),
    hasTime: z.boolean().optional(),
    time: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    isoDate: z.string().optional()
  })).optional()
})

export const updateCaseSchema = z.object({
  name: z.string()
    .trim()
    .max(200, 'Case name cannot exceed 200 characters')
    .optional(),
  client: z.string()
    .trim()
    .max(200, 'Client name cannot exceed 200 characters')
    .optional(),
  description: z.string()
    .trim()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  practiceArea: z.string()
    .trim()
    .max(100, 'Practice area cannot exceed 100 characters')
    .optional(),
  status: z.enum(['active', 'closed', 'archived', 'pending', 'discovery'])
    .optional(),
  complexity: z.enum(['1', '2', '3'])
    .optional()
})

export const caseParamsSchema = z.object({
  id: mongoIdSchema
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>
