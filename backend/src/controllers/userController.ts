import { Response } from 'express'
import { User } from '../models'
import { IApiResponse, INotificationSettings, IAuthRequest } from '../types'

export const getProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
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
    console.error('[UserController] getProfile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    } as IApiResponse)
  }
}

export const updateProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
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
    console.error('[UserController] updateProfile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    } as IApiResponse)
  }
}

export const changePassword = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
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
    console.error('[UserController] changePassword error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    } as IApiResponse)
  }
}

export const updateNotifications = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
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
    console.error('[UserController] updateNotifications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    } as IApiResponse)
  }
}

export const getBillingInfo = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
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
      isAtPlanLimit: user.currentCases >= user.planLimit,
      paymentMethods: user.paymentMethods || [],
      defaultPaymentMethodId: user.defaultPaymentMethodId || (user.paymentMethods.length > 0 ? user.paymentMethods[0].id : null)
    }

    res.status(200).json({
      success: true,
      message: 'Billing info retrieved successfully',
      data: billingInfo
    } as IApiResponse)
  } catch (error: unknown) {
    console.error('[UserController] getBillingInfo error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve billing info'
    } as IApiResponse)
  }
}

export const submitSupportRequest = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }

    const { type, subject, description } = req.body

    if (!type || !subject || !description) {
      res.status(400).json({
        success: false,
        message: 'Please provide support type, subject and description'
      } as IApiResponse)
      return
    }

    // TODO: Integrate with a real support system (email, Zendesk, etc.)
    console.info(`[SUPPORT] User: ${user.email}, Type: ${type}, Subject: ${subject}`)

    res.status(200).json({
      success: true,
      message: 'Support request submitted successfully. Our team will contact you soon.'
    } as IApiResponse)
  } catch (error: unknown) {
    console.error('[UserController] submitSupportRequest error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit support request'
    } as IApiResponse)
  }
}

export const addPaymentMethod = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' } as IApiResponse)
      return
    }

    const { brand, last4, expiryMonth, expiryYear } = req.body
    const newId = `pm_${Math.random().toString(36).substr(2, 9)}`

    const newPaymentMethod = {
      id: newId,
      brand,
      last4,
      expiryMonth,
      expiryYear
    }

    user.paymentMethods.push(newPaymentMethod)

    // Set as default if it's the first card
    if (user.paymentMethods.length === 1) {
      user.defaultPaymentMethodId = newId
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Payment method added successfully',
      data: {
        paymentMethods: user.paymentMethods,
        defaultPaymentMethodId: user.defaultPaymentMethodId
      }
    } as IApiResponse)
  } catch (error: unknown) {
    console.error('[UserController] addPaymentMethod error:', error)
    res.status(500).json({ success: false, message: 'Failed to add payment method' } as IApiResponse)
  }
}

export const removePaymentMethod = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' } as IApiResponse)
      return
    }

    const { id } = req.params

    user.paymentMethods = user.paymentMethods.filter(pm => pm.id !== id)

    // Handle default ID reassignment
    if (user.defaultPaymentMethodId === id) {
      user.defaultPaymentMethodId = user.paymentMethods.length > 0 ? user.paymentMethods[0].id : undefined
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Payment method removed successfully',
      data: {
        paymentMethods: user.paymentMethods,
        defaultPaymentMethodId: user.defaultPaymentMethodId
      }
    } as IApiResponse)
  } catch (error: unknown) {
    console.error('[UserController] removePaymentMethod error:', error)
    res.status(500).json({ success: false, message: 'Failed to remove payment method' } as IApiResponse)
  }
}

export const setDefaultPaymentMethod = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' } as IApiResponse)
      return
    }

    const { id } = req.params

    const exists = user.paymentMethods.some(pm => pm.id === id)
    if (!exists) {
      res.status(404).json({ success: false, message: 'Payment method not found' } as IApiResponse)
      return
    }

    user.defaultPaymentMethodId = id
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Default payment method updated successfully',
      data: {
        defaultPaymentMethodId: user.defaultPaymentMethodId
      }
    } as IApiResponse)
  } catch (error: unknown) {
    console.error('[UserController] setDefaultPaymentMethod error:', error)
    res.status(500).json({ success: false, message: 'Failed to set default payment method' } as IApiResponse)
  }
}
