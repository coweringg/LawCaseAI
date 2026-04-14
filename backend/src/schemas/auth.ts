import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string()
    .email('Please provide a valid email address')
    .transform(v => v.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  lawFirm: z.string()
    .trim()
    .min(1, 'Law firm name is required')
    .max(200, 'Law firm name cannot exceed 200 characters'),
  firmCode: z.string().trim().optional()
})

export const registerAdminSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string()
    .email('Please provide a valid email address')
    .transform(v => v.toLowerCase().trim()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  lawFirm: z.string().trim().min(1, 'Law firm name is required')
})

export const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address')
    .transform(v => v.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required')
})

export const savedLoginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address')
    .transform(v => v.toLowerCase().trim())
})

export type RegisterInput = z.infer<typeof registerSchema>
export type RegisterAdminInput = z.infer<typeof registerAdminSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SavedLoginInput = z.infer<typeof savedLoginSchema>
