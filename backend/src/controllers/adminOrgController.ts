import { Request, Response } from 'express'
import { Organization, User, Transaction } from '../models'
import { IApiResponse, UserRole } from '../types'
import mongoose from 'mongoose'

export const getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const match: Record<string, any> = {}
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { firmCode: { $regex: search, $options: 'i' } }
      ]
    }

    if (status !== 'all') {
      const now = new Date()
      if (status === 'active') {
        match.isActive = true
        match.currentPeriodEnd = { $gte: now }
      } else if (status === 'expired') {
        match.currentPeriodEnd = { $lt: now }
      } else if (status === 'expiring') {
        const soon = new Date()
        soon.setDate(soon.getDate() + 7)
        match.currentPeriodEnd = { $gte: now, $lt: soon }
      }
    }

    const organizations = await Organization.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'adminId',
          foreignField: '_id',
          as: 'adminInfo'
        }
      },
      {
        $unwind: {
          path: '$adminInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: 1,
          totalSeats: 1,
          usedSeats: 1,
          firmCode: 1,
          isActive: 1,
          currentPeriodEnd: 1,
          createdAt: 1,
          'adminInfo.email': 1,
          'adminInfo.plan': 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) }
    ])

    const total = await Organization.countDocuments(match)

    res.status(200).json({
      success: true,
      message: 'Organizations retrieved successfully',
      data: {
        organizations,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch organizations'
    } as IApiResponse)
  }
}

export const getOrganizationDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid organization ID' } as IApiResponse)
      return
    }

    const org = await Organization.findById(id).lean()
    if (!org) {
      res.status(404).json({ success: false, message: 'Organization not found' } as IApiResponse)
      return
    }

    const admin = await User.findById(org.adminId).select('name email plan createdAt').lean()
    const members = await User.find({ organizationId: id }).select('name email role createdAt').lean()
    
    const transactions = await Transaction.find({ userId: org.adminId })
      .sort({ date: -1 })
      .limit(5)
      .lean()

    res.status(200).json({
      success: true,
      data: {
        ...org,
        admin,
        members,
        transactions
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch organization details'
    } as IApiResponse)
  }
}

export const toggleOrganizationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const org = await Organization.findByIdAndUpdate(id, { isActive }, { new: true })
    if (!org) {
       res.status(404).json({ success: false, message: 'Organization not found' } as IApiResponse)
       return
    }

    res.status(200).json({
      success: true,
      message: `Organization ${isActive ? 'activated' : 'deactivated'} successfully`
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update organization status'
    } as IApiResponse)
  }
}

export const extendOrganizationPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { months = 1 } = req.body

    const org = await Organization.findById(id)
    if (!org) {
       res.status(404).json({ success: false, message: 'Organization not found' } as IApiResponse)
       return
    }

    const currentEnd = org.currentPeriodEnd ? new Date(org.currentPeriodEnd) : new Date()
    const newEnd = new Date(currentEnd.setMonth(currentEnd.getMonth() + months))

    org.currentPeriodEnd = newEnd
    await org.save()

    await User.findByIdAndUpdate(org.adminId, { currentPeriodEnd: newEnd })

    res.status(200).json({
      success: true,
      message: `Plan extended until ${newEnd.toLocaleDateString()}`,
      data: { currentPeriodEnd: newEnd }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to extend plan'
    } as IApiResponse)
  }
}
