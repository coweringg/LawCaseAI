import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { SystemSetting, User } from '../models'
import { UserRole, IJWTPayload } from '../types'
import config from '../config'

/**
 * Maintenance Mode Middleware
 * Checks if the system is in maintenance mode.
 * Allows access if:
 * 1. Maintenance mode is OFF
 * 2. User is authenticated AND is an ADMIN
 * 3. Route is explicitly whitelisted (e.g. login, health check)
 */
export const checkMaintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Whitelist public routes that should always be accessible
    const whitelist = [
      '/api/auth/login', 
      '/api/auth/logout',
      '/api/admin/login',
      '/api/system/status',         // Public endpoint for frontend maintenance polling
      '/api/admin/system/status',   // Admin endpoint (kept for backward compat)
    ]
    
    if (whitelist.some(path => req.path.startsWith(path))) {
      return next()
    }

    const maintenanceSetting = await SystemSetting.findOne({ key: 'maintenanceMode' })
    const isMaintenanceActive = maintenanceSetting?.value === true

    if (!isMaintenanceActive) {
      return next()
    }

    // If maintenance is active, we must identify if the requester is an ADMIN.
    // Since this runs before global auth, we manually check the token.
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.auth_token

    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload
            const user = await User.findById(decoded.userId).select('role')
            
            if (user && user.role === UserRole.ADMIN) {
                return next()
            }
        } catch (err) {
            // Token invalid or user not found, fall through to block
        }
    }

    return res.status(503).json({
      success: false,
      message: 'System is currently under maintenance. Please try again later.',
      maintenance: true
    })

  } catch (error) {
    console.error('Maintenance check failed:', error)
    next() // Fail open to avoid blocking valid traffic on DB error
  }
}
