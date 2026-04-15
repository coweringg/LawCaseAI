import { Response } from 'express'
import { User, SupportRequest, Case, Organization } from '../models'
import { IApiResponse, INotificationSettings, IAuthRequest, SupportRequestStatus, UserPlan } from '../types'
import { logAction } from '../utils/auditLogger'
import config from '../config'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const getProfile = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
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
        isTrialUsed: user.isTrialUsed,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        currentPeriodEnd: user.currentPeriodEnd,
        totalTokensConsumed: user.totalTokensConsumed,
        totalStorageUsed: user.totalStorageUsed,
        maxTokens: (config.planLimits as any)[user.plan]?.maxTokens || 0,
        maxTotalStorage: (config.planLimits as any)[user.plan]?.maxTotalStorage || 0,
        billingInterval: user.billingInterval || 'monthly',
        expiredPremium: user.expiredPremium,
        expiredTrial: user.expiredTrial
      }
    } as IApiResponse)
})

export const updateProfile = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
    }

    const { name, lawFirm, email } = req.body

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw new AppError('Email address is already in use', 400)
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
      throw new AppError('User not found', 404)
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
})

export const changePassword = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
    }

    const { currentPassword, newPassword } = req.body

    const userWithPassword = await User.findById(user._id).select('+password')
    if (!userWithPassword) {
      throw new AppError('User not found', 404)
    }

    const isMatch = await userWithPassword.comparePassword(currentPassword)
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400)
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
})

export const updateNotifications = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
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
      throw new AppError('User not found', 404)
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
})

export const getBillingInfo = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
    }

    const activeCaseCount = await Case.countDocuments({ userId: user._id, status: 'active' })

    const billingInfo = {
      plan: user.plan,
      planLimit: user.planLimit,
      currentCases: activeCaseCount,
      remainingCases: Math.max(0, user.planLimit - activeCaseCount),
      planUsagePercentage: user.planLimit > 0 ? Math.round((activeCaseCount / user.planLimit) * 100) : 0,
      isAtPlanLimit: activeCaseCount >= user.planLimit,
      paymentMethods: user.paymentMethods || [],
      defaultPaymentMethodId: user.defaultPaymentMethodId || (user.paymentMethods.length > 0 ? user.paymentMethods[0].id : null),
      interval: user.billingInterval || 'monthly',
      totalTokensConsumed: user.totalTokensConsumed,
      maxTokens: (config.planLimits as any)[user.plan]?.maxTokens || 0,
      totalStorageUsed: user.totalStorageUsed,
      maxTotalStorage: (config.planLimits as any)[user.plan]?.maxTotalStorage || 0,
      organization: user.organizationId ? await Organization.findById(user.organizationId).select('name usedSeats totalSeats isActive currentPeriodEnd') : null
    }

    res.status(200).json({
      success: true,
      message: 'Billing info retrieved successfully',
      data: billingInfo
    } as IApiResponse)
})

export const submitSupportRequest = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
    }

    const { type, subject, description } = req.body

    if (!type || !subject || !description) {
      throw new AppError('Please provide support type, subject and description', 400)
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
})

export const addPaymentMethod = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
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
})

export const removePaymentMethod = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
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
})

export const setDefaultPaymentMethod = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
    }

    const { id } = req.params

    const exists = user.paymentMethods.some(pm => pm.id === id)
    if (!exists) {
      throw new AppError('Payment method not found', 404)
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
})

export const activateTrial = catchAsync(async (req: IAuthRequest, res: Response): Promise<void> => {
    const user = req.user
    if (!user) {
      throw new AppError('User not authenticated', 401)
    }

    if (user.isTrialUsed) {
      throw new AppError('Trial has already been used on this account. Please subscribe to a plan to continue.', 400)
    }

    if (user.plan !== UserPlan.NONE) {
      throw new AppError('A trial cannot be activated while an active plan is in place.', 400)
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
      throw new AppError('User not found', 404)
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
})
