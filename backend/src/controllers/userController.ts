import { Request, Response } from 'express'
import { User } from '../models'
import { IApiResponse, INotificationSettings, IAuthRequest } from '../types'

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        lawFirm: user.lawFirm,
        role: user.role,
        plan: user.plan,
        planLimit: user.planLimit,
        currentCases: user.currentCases,
        status: user.status,
        emailNotifications: user.emailNotifications,
        caseUpdates: user.caseUpdates,
        aiResponses: user.aiResponses,
        marketingEmails: user.marketingEmails,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve profile'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }
    
    const { name, lawFirm, email } = req.body

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email address is already in use'
        } as IApiResponse)
        return
      }
    }

    const updateData: { name?: string; lawFirm?: string; email?: string } = { name, lawFirm }
    if (email) {
      updateData.email = email.toLowerCase()
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as IApiResponse)
      return
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        lawFirm: updatedUser.lawFirm,
        role: updatedUser.role,
        plan: updatedUser.plan,
        planLimit: updatedUser.planLimit,
        currentCases: updatedUser.currentCases,
        status: updatedUser.status,
        emailNotifications: updatedUser.emailNotifications,
        caseUpdates: updatedUser.caseUpdates,
        aiResponses: updatedUser.aiResponses,
        marketingEmails: updatedUser.marketingEmails,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }
    
    const { currentPassword, newPassword } = req.body

    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password')
    if (!userWithPassword) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as IApiResponse)
      return
    }

    // Check current password
    const isMatch = await userWithPassword.comparePassword(currentPassword)
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      } as IApiResponse)
      return
    }

    // Update password
    userWithPassword.password = newPassword
    await userWithPassword.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const updateNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }
    
    const notifications: INotificationSettings = req.body

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        emailNotifications: notifications.emailNotifications,
        caseUpdates: notifications.caseUpdates,
        aiResponses: notifications.aiResponses,
        marketingEmails: notifications.marketingEmails
      },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as IApiResponse)
      return
    }

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        emailNotifications: updatedUser.emailNotifications,
        caseUpdates: updatedUser.caseUpdates,
        aiResponses: updatedUser.aiResponses,
        marketingEmails: updatedUser.marketingEmails
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update notification preferences'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const getBillingInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }

    const billingInfo = {
      plan: user.plan,
      planLimit: user.planLimit,
      currentCases: user.currentCases,
      remainingCases: Math.max(0, user.planLimit - user.currentCases),
      planUsagePercentage: Math.round((user.currentCases / user.planLimit) * 100),
      isAtPlanLimit: user.currentCases >= user.planLimit
    }

    res.status(200).json({
      success: true,
      message: 'Billing info retrieved successfully',
      data: billingInfo
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve billing info'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}
