import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'
import { IApiResponse } from '../types'

type ValidationTarget = 'body' | 'params' | 'query'

interface ValidateOptions {
  body?: z.ZodType
  params?: z.ZodType
  query?: z.ZodType
}

function formatZodError(error: ZodError) {
  return error.issues.map(issue => ({
    field: issue.path.join('.') || 'unknown',
    message: issue.message,
    value: undefined
  }))
}

export function validateZod(schemas: ValidateOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const targets: { schema: z.ZodType; target: ValidationTarget }[] = []

    if (schemas.body) targets.push({ schema: schemas.body, target: 'body' })
    if (schemas.params) targets.push({ schema: schemas.params, target: 'params' })
    if (schemas.query) targets.push({ schema: schemas.query, target: 'query' })

    const allErrors: { field: string; message: string; value?: unknown }[] = []

    for (const { schema, target } of targets) {
      const result = schema.safeParse(req[target])
      if (!result.success) {
        allErrors.push(...formatZodError(result.error))
      } else {
        req[target] = result.data
      }
    }

    if (allErrors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: allErrors
      } as IApiResponse)
      return
    }

    next()
  }
}
