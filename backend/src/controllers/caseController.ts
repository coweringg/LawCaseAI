import { Request, Response } from 'express'
import { Case, User } from '../models'
import { IApiResponse, CaseStatus, IAuthRequest } from '../types'

export const createCase = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { name, client, description, practiceArea, court, complexity } = req.body
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    // Check plan limit
    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' } as IApiResponse)
      return
    }

    if (user.currentCases >= user.planLimit) {
      res.status(403).json({
        success: false,
        message: 'Case limit reached. Please upgrade your plan.'
      } as IApiResponse)
      return
    }

    const newCase = new Case({
      name,
      client,
      description,
      practiceArea,
      court,
      complexity,
      status: CaseStatus.ACTIVE,
      userId
    })

    await newCase.save()

    // Update user's current case count
    user.currentCases += 1
    await user.save()

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create case'
    res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
  }
}

export const getCases = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const cases = await Case.find({ userId }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: cases
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cases'
    res.status(500).json({ success: false, message: errorMessage } as IApiResponse)
  }
}

export const getCaseStats = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' } as IApiResponse)
      return
    }

    const stats = await Case.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const formattedStats = {
      total: 0,
      active: 0,
      closed: 0,
      archived: 0
    }

    stats.forEach((stat: { _id: string; count: number }) => {
      formattedStats.total += stat.count
      if (stat._id === 'active') formattedStats.active = stat.count
      if (stat._id === 'closed') formattedStats.closed = stat.count
      if (stat._id === 'archived') formattedStats.archived = stat.count
    })

    res.status(200).json({
      success: true,
      data: formattedStats
    } as IApiResponse)
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' } as IApiResponse)
  }
}
