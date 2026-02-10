import { Request, Response } from 'express'
import { User } from '../models'
import CaseModel from '../models/Case'
import { IApiResponse, ICaseUpdate } from '../types'

export const getCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user
    const { status, search, page = 1, limit = 10 } = req.query

    // Build query
    const query: any = { userId: user._id }
    
    if (status) {
      query.status = status
    }

    if (search) {
      query.$text = { $search: search as string }
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Get cases
    const cases = await CaseModel.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)

    // Get total count
    const total = await CaseModel.countDocuments(query)

    res.status(200).json({
      success: true,
      message: 'Cases retrieved successfully',
      data: {
        cases: cases.map(case_ => ({
          id: case_._id,
          name: case_.name,
          client: case_.client,
          description: case_.description,
          status: case_.status,
          fileCount: case_.fileCount,
          createdAt: case_.createdAt,
          updatedAt: case_.updatedAt
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve cases'
    } as IApiResponse)
  }
}

export const createCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user
    const { name, client, description } = req.body

    // Check plan limit
    if (user.currentCases >= user.planLimit) {
      res.status(403).json({
        success: false,
        message: 'Plan limit reached. Please upgrade your plan to create more cases.',
        data: {
          current: user.currentCases,
          limit: user.planLimit,
          plan: user.plan
        }
      } as IApiResponse)
      return
    }

    // Create case
    const case_ = new CaseModel({
      name,
      client,
      description,
      userId: user._id,
      status: 'active',
      fileCount: 0
    })

    await case_.save()

    // Update user's case count
    await User.findByIdAndUpdate(user._id, { $inc: { currentCases: 1 } })

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: {
        id: case_._id,
        name: case_.name,
        client: case_.client,
        description: case_.description,
        status: case_.status,
        fileCount: case_.fileCount,
        createdAt: case_.createdAt,
        updatedAt: case_.updatedAt
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create case'
    } as IApiResponse)
  }
}

export const getCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user
    const { id } = req.params

    const case_ = await Case.findOne({ _id: id, userId: user._id })

    if (!case_) {
      res.status(404).json({
        success: false,
        message: 'Case not found'
      } as IApiResponse)
      return
    }

    res.status(200).json({
      success: true,
      message: 'Case retrieved successfully',
      data: {
        id: case_._id,
        name: case_.name,
        client: case_.client,
        description: case_.description,
        status: case_.status,
        fileCount: case_.fileCount,
        createdAt: case_.createdAt,
        updatedAt: case_.updatedAt
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve case'
    } as IApiResponse)
  }
}

export const updateCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user
    const { id } = req.params
    const updates: ICaseUpdate = req.body

    const case_ = await Case.findOne({ _id: id, userId: user._id })

    if (!case_) {
      res.status(404).json({
        success: false,
        message: 'Case not found'
      } as IApiResponse)
      return
    }

    // Update case
    const updatedCase = await CaseModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: {
        id: updatedCase!._id,
        name: updatedCase!.name,
        client: updatedCase!.client,
        description: updatedCase!.description,
        status: updatedCase!.status,
        fileCount: updatedCase!.fileCount,
        createdAt: updatedCase!.createdAt,
        updatedAt: updatedCase!.updatedAt
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update case'
    } as IApiResponse)
  }
}

export const deleteCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user
    const { id } = req.params

    const case_ = await Case.findOne({ _id: id, userId: user._id })

    if (!case_) {
      res.status(404).json({
        success: false,
        message: 'Case not found'
      } as IApiResponse)
      return
    }

    // Delete case (this will trigger the pre-remove middleware to update user's case count)
    await CaseModel.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully'
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete case'
    } as IApiResponse)
  }
}

export const getCaseStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user

    const stats = await CaseModel.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } }
        }
      }
    ])

    const result = stats[0] || { total: 0, active: 0, closed: 0, archived: 0 }

    res.status(200).json({
      success: true,
      message: 'Case stats retrieved successfully',
      data: result
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve case stats'
    } as IApiResponse)
  }
}
