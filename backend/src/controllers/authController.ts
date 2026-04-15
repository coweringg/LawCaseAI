import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { User } from '../models'
import { IApiResponse, IUserRegistration, IUserLogin, UserRole, UserPlan } from '../types'
import config from '../config'
import { logAction } from '../utils/auditLogger'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import crypto from 'crypto'

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, lawFirm, firmCode }: IUserRegistration = req.body

    const existingUser = await User.findOne({ email, status: { $ne: 'deleted' } })
    if (existingUser) {
      throw new AppError('An account with this email already exists. Please try logging in instead.', 400)
    }

    let organizationId = null
    let plan = UserPlan.NONE
    let effectiveLawFirm = lawFirm
    let orgPeriodEnd: Date | undefined = undefined
    let seatIncrementedOrgId: Types.ObjectId | null = null

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
          throw new AppError('The firm code provided is invalid.', 400)
        }
        
        if (checkOrg.usedSeats >= checkOrg.totalSeats) {
          throw new AppError('Firm seat limit reached.', 400)
        }

        throw new AppError('The organization is currently inactive.', 400)
      }

      seatIncrementedOrgId = org._id
      organizationId = org._id
      plan = UserPlan.ENTERPRISE
      effectiveLawFirm = org.name
      orgPeriodEnd = org.currentPeriodEnd
    }

    const now = new Date()
    const nextMonth = orgPeriodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    let user
    try {
      user = new User({
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
    } catch (userSaveError) {
      if (seatIncrementedOrgId) {
        const { default: Organization } = await import('../models/Organization')
        await Organization.findOneAndUpdate(
          { _id: seatIncrementedOrgId, usedSeats: { $gt: 0 } },
          { $inc: { usedSeats: -1 } }
        )
      }
      throw userSaveError
    }

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
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    let savedTokens: Record<string, string> = {}
    if (req.cookies?.saved_tokens) {
      try {
        savedTokens = JSON.parse(req.cookies.saved_tokens)
      } catch (e) {}
    }
    savedTokens[user.email] = user.savedLoginToken as string
    res.cookie('saved_tokens', JSON.stringify(savedTokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000
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
        token
      }
    } as IApiResponse)
})

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email, password }: IUserLogin = req.body

    const user = await User.findByEmail(email)
    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    if (user.status !== 'active') {
      let message = 'Account is not active'
      
      if (user.status === 'disabled') {
        message = 'Your account has been disabled. Please contact support for more information.'
      } else if (user.status === 'deleted') {
        message = 'Your account has been deleted. Please contact support for more information.'
      }

      throw new AppError(message, 401)
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401)
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
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    let savedTokens: Record<string, string> = {}
    if (req.cookies?.saved_tokens) {
      try {
        savedTokens = JSON.parse(req.cookies.saved_tokens)
      } catch (e) {}
    }
    savedTokens[user.email] = user.savedLoginToken as string
    res.cookie('saved_tokens', JSON.stringify(savedTokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000
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
        token
      }
    } as IApiResponse)
})

export const loginWithSavedToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body

    let savedTokens: Record<string, string> = {}
    if (req.cookies?.saved_tokens) {
      try {
        savedTokens = JSON.parse(req.cookies.saved_tokens)
      } catch (e) {}
    }
    const savedLoginToken = savedTokens[email]

    if (!email || !savedLoginToken) {
      throw new AppError('Email and active saved session are required', 400)
    }

    const user = await User.findOne({ email }).select('+password +savedLoginToken')
    if (!user) {
      throw new AppError('Invalid credential token', 401)
    }

    if (user.status !== 'active') {
      throw new AppError('Account is not active', 401)
    }

    if (!user.savedLoginToken || user.savedLoginToken !== savedLoginToken) {
      throw new AppError('Saved login token has expired or is invalid', 401)
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
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    savedTokens[user.email] = newSavedLoginToken as string
    res.cookie('saved_tokens', JSON.stringify(savedTokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000
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
        token
      }
    } as IApiResponse)
})

export const refreshToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const user = (req as { user?: unknown }).user as { generateAuthToken: () => string }

    const token = user.generateAuthToken()

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token }
    } as IApiResponse)
})

export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user
    if (user) {
      await User.findByIdAndUpdate(user._id, { $unset: { lastActivity: 1 } })
    }

    res.clearCookie('auth_token')

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    } as IApiResponse)
})

export const registerAdmin = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const adminKey = req.header('X-Admin-Key')

    if (!adminKey || adminKey !== config.adminCreationKey) {
      throw new AppError('Access denied. Invalid administrative key.', 403)
    }

    const { name, email, password, lawFirm }: IUserRegistration = req.body

    const existingUser = await User.findOne({ email, status: { $ne: 'deleted' } })
    if (existingUser) {
      throw new AppError('An account with this email already exists. Please try logging in instead.', 400)
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
})
