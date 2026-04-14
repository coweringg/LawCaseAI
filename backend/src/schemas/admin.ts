import { z } from 'zod'
import { mongoIdSchema } from './common'

export const adminUserParamsSchema = z.object({
  id: mongoIdSchema
})

export const adminUpdateUserSchema = z.object({
  name: z.string()
    .trim()
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  email: z.string()
    .email('Invalid email')
    .transform(v => v.toLowerCase().trim())
    .optional(),
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'disabled', 'suspended']).optional(),
  lawFirm: z.string()
    .trim()
    .max(200, 'Law firm name cannot exceed 200 characters')
    .optional(),
  plan: z.enum(['none', 'basic', 'professional', 'elite', 'enterprise']).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional()
})

export const adminUpdateStatusSchema = z.object({
  status: z.enum(['active', 'disabled', 'suspended'], {
    message: 'Invalid status'
  })
})

export const adminUpdatePlanSchema = z.object({
  plan: z.enum(['none', 'basic', 'professional', 'elite', 'enterprise'], {
    message: 'Invalid plan'
  })
})

export const maintenanceSchema = z.object({
  active: z.boolean({ message: 'Active must be a boolean' }),
  message: z.string()
    .trim()
    .max(500, 'Message cannot exceed 500 characters')
    .optional()
})

export const globalAlertSchema = z.object({
  message: z.string()
    .trim()
    .max(500, 'Alert message cannot exceed 500 characters')
    .optional(),
  type: z.enum(['info', 'warning', 'error', 'success'], {
    message: 'Invalid alert type'
  }).optional()
})

export const updateOrgCodeSchema = z.object({
  firmCode: z.string()
    .trim()
    .min(3, 'Firm code must be 3-20 characters')
    .max(20, 'Firm code must be 3-20 characters')
})

export const updateSupportStatusSchema = z.object({
  status: z.enum(['pending', 'resolved'], {
    message: 'Invalid status'
  })
})

export const toggleOrgStatusSchema = z.object({
  isActive: z.boolean({ message: 'isActive must be a boolean' })
})

export const extendOrgPlanSchema = z.object({
  months: z.number().int().min(1, 'Months must be at least 1').optional()
})
