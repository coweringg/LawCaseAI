import { Response } from 'express'
import { User, SupportRequest } from '../models'
import { IApiResponse, INotificationSettings, IAuthRequest, SupportRequestStatus, UserPlan } from '../types'
import { logAction } from '../utils/auditLogger'
import logger from '../utils/logger'
import config from '../config'

const controllerLogger = logger.child({ module: 'user-controller' })

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
        organizationId: user.organizationId,
        isOrgAdmin: user.isOrgAdmin,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        totalTokensConsumed: user.totalTokensConsumed,
        totalStorageUsed: user.totalStorageUsed,
        maxTokens: (config.planLimits as any)[user.plan]?.maxTokens || 0,
        maxTotalStorage: (config.planLimits as any)[user.plan]?.maxTotalStorage || 0,
        billingInterval: user.billingInterval || 'monthly'
      }
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'getProfile error')
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

    const beforeState = {
      name: user.name,
      email: user.email,
      lawFirm: user.lawFirm
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

    await logAction({
      adminId: updatedUser._id,
      adminName: updatedUser.name,
      targetId: updatedUser._id,
      targetName: updatedUser.name,
      targetType: 'user',
      category: updatedUser.role === 'admin' ? 'admin' : 'platform',
      action: 'PROFILE_UPDATE',
      before: beforeState,
      after: { name: updatedUser.name, email: updatedUser.email, lawFirm: updatedUser.lawFirm },
      description: updatedUser.role === 'admin' ? `Admin ${updatedUser.email} updated their profile` : `User ${updatedUser.email} updated their profile`
    })

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
        organizationId: updatedUser.organizationId,
        isOrgAdmin: updatedUser.isOrgAdmin,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
        totalTokensConsumed: updatedUser.totalTokensConsumed,
        totalStorageUsed: updatedUser.totalStorageUsed,
        maxTokens: (config.planLimits as any)[updatedUser.plan]?.maxTokens || 0,
        maxTotalStorage: (config.planLimits as any)[updatedUser.plan]?.maxTotalStorage || 0
      }
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'updateProfile error')
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

    const userWithPassword = await User.findById(user._id).select('+password')
    if (!userWithPassword) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as IApiResponse)
      return
    }

    const isMatch = await userWithPassword.comparePassword(currentPassword)
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      } as IApiResponse)
      return
    }

    userWithPassword.password = newPassword
    await userWithPassword.save()

    await logAction({
      adminId: userWithPassword._id,
      adminName: userWithPassword.name,
      targetId: userWithPassword._id,
      targetName: userWithPassword.name,
      targetType: 'user',
      category: userWithPassword.role === 'admin' ? 'admin' : 'platform',
      action: 'PASSWORD_CHANGE',
      description: userWithPassword.role === 'admin' ? `Admin ${userWithPassword.email} updated their account security passcode` : `User ${userWithPassword.email} updated their account security passcode`
    })

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'changePassword error')
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

    await logAction({
      adminId: updatedUser._id,
      adminName: updatedUser.name,
      targetId: updatedUser._id,
      targetName: updatedUser.name,
      targetType: 'user',
      category: 'platform',
      action: 'NOTIFICATION_CHANGE',
      description: `User ${updatedUser.email} updated notification preferences`
    })

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
    controllerLogger.error({ err: error }, 'updateNotifications error')
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
      planUsagePercentage: user.planLimit > 0 ? Math.round((user.currentCases / user.planLimit) * 100) : 0,
      isAtPlanLimit: user.currentCases >= user.planLimit,
      paymentMethods: user.paymentMethods || [],
      defaultPaymentMethodId: user.defaultPaymentMethodId || (user.paymentMethods.length > 0 ? user.paymentMethods[0].id : null),
      interval: user.billingInterval || 'monthly',
      totalTokensConsumed: user.totalTokensConsumed,
      maxTokens: (config.planLimits as any)[user.plan]?.maxTokens || 0,
      totalStorageUsed: user.totalStorageUsed,
      maxTotalStorage: (config.planLimits as any)[user.plan]?.maxTotalStorage || 0
    }

    res.status(200).json({
      success: true,
      message: 'Billing info retrieved successfully',
      data: billingInfo
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'getBillingInfo error')
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

    const supportRequest = new SupportRequest({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      type,
      subject,
      description,
      status: SupportRequestStatus.PENDING
    })

    await supportRequest.save()

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: supportRequest._id,
      targetName: subject,
      targetType: 'support',
      category: 'platform',
      action: 'SUPPORT_REQUEST_SUBMITTED',
      description: `User ${user.email} submitted a support request: ${subject}`
    })

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully. Our team will contact you soon.',
      data: supportRequest
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'submitSupportRequest error')
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

    if (user.paymentMethods.length === 1) {
      user.defaultPaymentMethodId = newId
    }

    await user.save()

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: 'platform',
      action: 'PAYMENT_METHOD_ADD',
      description: `User ${user.email} added a new payment method (*${last4})`
    })

    res.status(200).json({
      success: true,
      message: 'Payment method added successfully',
      data: {
        paymentMethods: user.paymentMethods,
        defaultPaymentMethodId: user.defaultPaymentMethodId
      }
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'addPaymentMethod error')
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

    if (user.defaultPaymentMethodId === id) {
      user.defaultPaymentMethodId = user.paymentMethods.length > 0 ? user.paymentMethods[0].id : undefined
    }

    await user.save()

    await logAction({
      adminId: user._id,
      adminName: user.name,
      targetId: user._id,
      targetName: user.name,
      targetType: 'user',
      category: 'platform',
      action: 'PAYMENT_METHOD_REMOVE',
      description: `User ${user.email} removed a payment method`
    })

    res.status(200).json({
      success: true,
      message: 'Payment method removed successfully',
      data: {
        paymentMethods: user.paymentMethods,
        defaultPaymentMethodId: user.defaultPaymentMethodId
      }
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'removePaymentMethod error')
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
    controllerLogger.error({ err: error }, 'setDefaultPaymentMethod error')
    res.status(500).json({ success: false, message: 'Failed to set default payment method' } as IApiResponse)
  }
}

export const activateTrial = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' } as IApiResponse)
      return
    }

    if (user.isTrialUsed) {
      res.status(400).json({ 
        success: false, 
        message: 'Trial has already been used on this account. Please subscribe to a plan to continue.' 
      } as IApiResponse)
      return
    }

    if (user.plan !== UserPlan.NONE) {
      res.status(400).json({ 
        success: false, 
        message: 'A trial cannot be activated while an active plan is in place.' 
      } as IApiResponse)
      return
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        plan: UserPlan.TRIAL,
        trialStartedAt: new Date(),
        isTrialUsed: true,
        planLimit: (config.planLimits as any).trial.maxCases
      },
      { new: true }
    )

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    await logAction({
      adminId: updatedUser._id,
      adminName: updatedUser.name,
      targetId: updatedUser._id,
      targetName: updatedUser.name,
      targetType: 'user',
      category: 'platform',
      action: 'TRIAL_ACTIVATED',
      description: `User ${updatedUser.email} activated their 24h free trial`
    })

    res.status(200).json({
      success: true,
      message: '24-hour Free Evaluation activated successfully',
      data: {
        plan: updatedUser.plan,
        trialStartedAt: updatedUser.trialStartedAt,
        isTrialUsed: updatedUser.isTrialUsed
      }
    } as IApiResponse)
  } catch (error: unknown) {
    controllerLogger.error({ err: error }, 'activateTrial error')
    res.status(500).json({ success: false, message: 'Failed to activate trial' } as IApiResponse)
  }
}
