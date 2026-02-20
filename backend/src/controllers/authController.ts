import { Request, Response } from 'express'
import { User } from '../models'
import { IApiResponse, IUserRegistration, IUserLogin, UserRole, UserPlan } from '../types'
import config from '../config'
import { logAction } from '../utils/auditLogger'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, lawFirm, firmCode }: IUserRegistration = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      } as IApiResponse)
      return
    }

    let organizationId = null
    let plan = UserPlan.NONE
    let effectiveLawFirm = lawFirm

    // If firmCode provided, handle organizational join
    if (firmCode) {
      const { default: Organization } = await import('../models/Organization')
      const org = await Organization.findOne({ firmCode: firmCode.toUpperCase(), isActive: true })
      
      if (!org) {
        res.status(400).json({
          success: false,
          message: 'Invalid or inactive firm code'
        } as IApiResponse)
        return
      }

      if (org.usedSeats >= org.totalSeats) {
        res.status(400).json({
          success: false,
          message: 'No seats available in this organization'
        } as IApiResponse)
        return
      }

      organizationId = org._id
      plan = UserPlan.ELITE // All firm members get Elite
      effectiveLawFirm = org.name

      // Increment used seats
      org.usedSeats += 1
      await org.save()
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      lawFirm: effectiveLawFirm,
      role: 'lawyer',
      plan,
      organizationId
    })

    await user.save()

    // Generate token
    const token = user.generateAuthToken()

    // Log the action
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

    // Set HttpOnly cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
          currentCases: user.currentCases,
          createdAt: user.createdAt,
          isOrgAdmin: user.isOrgAdmin,
          organizationId: user.organizationId
        },
        token
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

    // Find user with password
    const user = await User.findByEmail(email)
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as IApiResponse)
      return
    }

    // Check if user is active
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

    // Compare password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      } as IApiResponse)
      return
    }

    // Generate token
    const token = user.generateAuthToken()

    // Update login timestamps
    user.lastLogin = new Date()
    user.lastActivity = new Date()
    await user.save()

    // Log the action
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

    // Set HttpOnly cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
          organizationId: user.organizationId
        },
        token
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

    // Generate new token
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
      // Clear activity status immediately on logout
      await User.findByIdAndUpdate(user._id, { $unset: { lastActivity: 1 } })
    }

    // Clear HttpOnly cookie
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

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      } as IApiResponse)
      return
    }

    // Create new admin user
    const user = new User({
      name,
      email,
      password,
      lawFirm,
      role: UserRole.ADMIN,
      plan: 'enterprise' // Admins get enterprise plan by default
    })

    await user.save()

    // Log the action (as admin creation)
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
