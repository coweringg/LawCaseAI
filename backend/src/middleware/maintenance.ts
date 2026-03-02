import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { SystemSetting, User } from '../models'
import { UserRole, IJWTPayload } from '../types'
import config from '../config'
import logger from '../utils/logger'

const maintenanceLogger = logger.child({ module: 'maintenance' })

export const checkMaintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const whitelist = [
      '/api/auth/login', 
      '/api/auth/logout',
      '/api/admin/login',
      '/api/system/status',
      '/api/admin/system/status',
    ]
    
    if (whitelist.some(path => req.path.startsWith(path))) {
      return next()
    }

    const maintenanceSetting = await SystemSetting.findOne({ key: 'maintenanceMode' })
    const isMaintenanceActive = maintenanceSetting?.value === true

    if (!isMaintenanceActive) {
      return next()
    }

    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.auth_token

    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload
            const user = await User.findById(decoded.userId).select('role')
            
            if (user && user.role === UserRole.ADMIN) {
                return next()
            }
        } catch {
          // token invalid, treat as non-admin
        }
    }

    return res.status(503).json({
      success: false,
      message: 'System is currently under maintenance. Please try again later.',
      maintenance: true
    })

  } catch (error) {
    maintenanceLogger.error({ err: error }, 'Maintenance check failed')
    next() 
  }
}

