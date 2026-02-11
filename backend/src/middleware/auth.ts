import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models'
import { IAuthRequest, IJWTPayload, UserRole, UserStatus } from '../types'
import config from '../config'

export const authenticate = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
      return
    }

    const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload
    
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      })
      return
    }

    if (user.status !== UserStatus.ACTIVE) {
      res.status(401).json({
        success: false,
        message: 'Account is not active.'
      })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    })
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      })
      return
    }

    next()
  }
}

export const checkPlanLimit = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied.'
      })
      return
    }

    const user = await User.findById(req.user._id)
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found.'
      })
      return
    }

    if (user.currentCases >= user.planLimit) {
      res.status(403).json({
        success: false,
        message: 'Plan limit reached. Please upgrade your plan to create more cases.',
        data: {
          current: user.currentCases,
          limit: user.planLimit,
          plan: user.plan
        }
      })
      return
    }

    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while checking plan limit.'
    })
  }
}

export const optionalAuth = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      next()
      return
    }

    const decoded = jwt.verify(token, config.jwt.secret) as IJWTPayload
    const user = await User.findById(decoded.userId)
    
    if (user && user.status === UserStatus.ACTIVE) {
      req.user = user
    }
    
    next()
  } catch (error) {
    // Continue without authentication for optional routes
    next()
  }
}
