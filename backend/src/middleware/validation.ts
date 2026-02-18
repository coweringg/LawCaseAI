import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { IApiResponse } from '../types'

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error: any) => ({
        field: error.type === 'field' ? (error.path || 'unknown') : 'unknown',
        message: error.msg || 'Validation error',
        value: error.value
      })
    )

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: formattedErrors
    } as IApiResponse)
    return
  }

  next()
}

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Check for malformed JSON
  if (req.is('application/json') && req.body && typeof req.body !== 'object') {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    } as IApiResponse)
    return
  }

  // Check for empty request body
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      success: false,
      message: 'Request body cannot be empty'
    } as IApiResponse)
    return
  }

  next()
}

/**
 * Basic input sanitization middleware.
 * Note: express-mongo-sanitize is applied at the app level in server.ts
 * for comprehensive NoSQL injection protection. This middleware handles
 * basic string trimming for request body fields.
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim()
      }
    })
  }

  next()
}
