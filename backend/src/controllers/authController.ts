import { Request, Response } from 'express'
import { User } from '../models'
import { IApiResponse, IUserRegistration, IUserLogin } from '../types'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
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

    // Create new user
    const user = new User({
      name,
      email,
      password,
      lawFirm,
      role: 'lawyer',
      plan: 'basic'
    })

    await user.save()

    // Generate token
    const token = user.generateAuthToken()

    // Update last login
    await User.updateLastLogin(user._id)

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
          createdAt: user.createdAt
        },
        token
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
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
      res.status(401).json({
        success: false,
        message: 'Account is not active'
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

    // Update last login
    await User.updateLastLogin(user._id)

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
          lastLogin: user.lastLogin
        },
        token
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    } as IApiResponse)
  }
}

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user

    // Generate new token
    const token = user.generateAuthToken()

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Token refresh failed'
    } as IApiResponse)
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Logout failed'
    } as IApiResponse)
  }
}
