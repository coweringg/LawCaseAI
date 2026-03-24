import { Request, Response } from 'express'
import { User } from '../models'
import { IApiResponse, IUserRegistration, IUserLogin, UserRole, UserPlan } from '../types'
import config from '../config'
import { logAction } from '../utils/auditLogger'
import crypto from 'crypto'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, lawFirm, firmCode }: IUserRegistration = req.body

    const existingUser = await User.findOne({ email, status: { $ne: 'deleted' } })
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please try logging in instead.'
      } as IApiResponse)
      return
    }

    let organizationId = null
    let plan = UserPlan.NONE
    let effectiveLawFirm = lawFirm
    let orgPeriodEnd: Date | undefined = undefined

    if (firmCode) {
      const { default: Organization } = await import('../models/Organization')
      
      const org = await Organization.findOneAndUpdate(
        { firmCode: firmCode.toUpperCase(), isActive: true, $expr: { $lt: ['$usedSeats', '$totalSeats'] } },
        { $inc: { usedSeats: 1 } },
        { new: true }
      )
      
      if (!org) {
        const checkOrg = await Organization.findOne({ firmCode: firmCode.toUpperCase() })
        if (!checkOrg) {
          res.status(400).json({
            success: false,
            message: 'The firm code provided is invalid.'
          } as IApiResponse)
          return
        }
        
        if (checkOrg.usedSeats >= checkOrg.totalSeats) {
          res.status(400).json({
            success: false,
            message: 'Firm seat limit reached.'
          } as IApiResponse)
          return
        }

        res.status(400).json({
          success: false,
          message: 'The organization is currently inactive.'
        } as IApiResponse)
        return
      }

      organizationId = org._id
      plan = UserPlan.ENTERPRISE
      effectiveLawFirm = org.name
      orgPeriodEnd = org.currentPeriodEnd
    }

    const now = new Date()
    const nextMonth = orgPeriodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const user = new User({
      name,
      email,
      password,
      lawFirm: effectiveLawFirm,
      role: 'lawyer',
      plan,
      organizationId,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth
    })

    await user.save()

    const token = user.generateAuthToken()
    const savedLoginToken = crypto.randomBytes(32).toString('hex')
    user.savedLoginToken = savedLoginToken
    await user.save()

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: 'platform',
      action: 'CREATE',
      after: { email: user.email, name: user.name, role: user.role, plan: user.plan },
      description: `New user registration: ${user.email}`
    })

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          lawFirm: user.lawFirm,
          role: user.role,
          plan: user.plan,
          planLimit: user.planLimit,
          isOrgAdmin: user.isOrgAdmin,
          organizationId: user.organizationId,
          isTrialUsed: user.isTrialUsed
        },
        token,
        savedLoginToken: user.savedLoginToken
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: IUserLogin = req.body

    const user = await User.findByEmail(email)
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as IApiResponse)
      return
    }

    if (user.status !== 'active') {
      let message = 'Account is not active'
      
      if (user.status === 'disabled') {
        message = 'Your account has been disabled. Please contact support for more information.'
      } else if (user.status === 'deleted') {
        message = 'Your account has been deleted. Please contact support for more information.'
      }

      res.status(401).json({
        success: false,
        message
      } as IApiResponse)
      return
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as IApiResponse)
      return
    }

    const token = user.generateAuthToken()

    const savedLoginToken = crypto.randomBytes(32).toString('hex')
    user.savedLoginToken = savedLoginToken

    user.lastLogin = new Date()
    user.lastActivity = new Date()
    await user.save()

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: user.role === 'admin' ? 'admin' : 'platform',
      action: 'LOGIN',
      after: { lastLogin: new Date(), email: user.email },
      description: user.role === 'admin' ? `Admin login: ${user.email}` : `User login: ${user.email}`
    })

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          lawFirm: user.lawFirm,
          role: user.role,
          plan: user.plan,
          planLimit: user.planLimit,
          currentCases: user.currentCases,
          lastLogin: user.lastLogin,
          isOrgAdmin: user.isOrgAdmin,
          organizationId: user.organizationId,
          expiredPremium: user.expiredPremium,
          expiredTrial: user.expiredTrial
        },
        token,
        savedLoginToken: user.savedLoginToken
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const loginWithSavedToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, savedLoginToken } = req.body

    if (!email || !savedLoginToken) {
      res.status(400).json({
        success: false,
        message: 'Email and token are required'
      } as IApiResponse)
      return
    }

    const user = await User.findOne({ email }).select('+password +savedLoginToken')
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credential token'
      } as IApiResponse)
      return
    }

    if (user.status !== 'active') {
      res.status(401).json({
        success: false,
        message: 'Account is not active'
      } as IApiResponse)
      return
    }

    if (!user.savedLoginToken || user.savedLoginToken !== savedLoginToken) {
      res.status(401).json({
        success: false,
        message: 'Saved login token has expired or is invalid'
      } as IApiResponse)
      return
    }

    const token = user.generateAuthToken()
    
    const newSavedLoginToken = crypto.randomBytes(32).toString('hex')
    user.savedLoginToken = newSavedLoginToken
    user.lastLogin = new Date()
    user.lastActivity = new Date()
    await user.save()

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: user.role === 'admin' ? 'admin' : 'platform',
      action: 'LOGIN',
      after: { lastLogin: new Date(), email: user.email, authMethod: 'saved_token' },
      description: `User login via saved account token: ${user.email}`
    })

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          lawFirm: user.lawFirm,
          role: user.role,
          plan: user.plan,
          planLimit: user.planLimit,
          currentCases: user.currentCases,
          lastLogin: user.lastLogin,
          isOrgAdmin: user.isOrgAdmin,
          organizationId: user.organizationId,
          expiredPremium: user.expiredPremium,
          expiredTrial: user.expiredTrial
        },
        token,
        savedLoginToken: newSavedLoginToken
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as { user?: unknown }).user as { generateAuthToken: () => string }

    const token = user.generateAuthToken()

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token }
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Token refresh failed'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user
    if (user) {
      await User.findByIdAndUpdate(user._id, { $unset: { lastActivity: 1 } })
    }

    res.clearCookie('auth_token')

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Logout failed'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminKey = req.header('X-Admin-Key')

    if (!adminKey || adminKey !== config.adminCreationKey) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Invalid administrative key.'
      } as IApiResponse)
      return
    }

    const { name, email, password, lawFirm }: IUserRegistration = req.body

    const existingUser = await User.findOne({ email, status: { $ne: 'deleted' } })
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please try logging in instead.'
      } as IApiResponse)
      return
    }

    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const user = new User({
      name,
      email,
      password,
      lawFirm,
      role: UserRole.ADMIN,
      plan: 'enterprise',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth
    })

    await user.save()

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: 'admin',
      action: 'CREATE',
      after: { email: user.email, name: user.name, role: user.role },
      description: `New admin user created via secure key: ${user.email}`
    })

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          lawFirm: user.lawFirm,
          role: user.role
        }
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Admin creation failed'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}
