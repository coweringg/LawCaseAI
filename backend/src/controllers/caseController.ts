import { Request, Response } from 'express'
import { User } from '../models'
import CaseModel from '../models/Case'
import { IApiResponse, ICaseUpdate, IAuthRequest, CaseStatus } from '../types'

export const getCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }
    
    const { status, search, page = 1, limit = 10 } = req.query

    // Build query
    const query: { userId: string; status?: CaseStatus; $text?: { $search: string } } = { userId: user._id.toString() }
    
    if (status) {
      query.status = status as CaseStatus
    }

    if (search) {
      query.$text = { $search: search as string }
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    // Get cases
    const cases = await CaseModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await CaseModel.countDocuments(query)

    // Check if user can create more cases
    let canCreateMore = true
    if (user.currentCases >= user.planLimit) {
      canCreateMore = false
    }

    res.status(200).json({
      success: true,
      message: 'Cases retrieved successfully',
      data: {
        cases: cases.map((case_: { _id: any; name: string; client: string; description: string; status: string; fileCount: number; createdAt: Date; updatedAt: Date }) => ({
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
          current: Number(page),
          pageSize: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        limits: {
          current: user.currentCases,
          limit: user.planLimit,
          plan: user.plan,
          canCreateMore
        }
      }
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve cases'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const createCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }
    
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

    // Create CaseModel
    const case_ = new CaseModel({
      name,
      client,
      description,
      userId: user._id,
      status: 'active',
      fileCount: 0
    })

    await case_.save()

    // Update user's CaseModel count
    await User.findByIdAndUpdate(user._id, { $inc: { currentCases: 1 } })

    res.status(201).json({
      success: true,
      message: 'CaseModel created successfully',
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create CaseModel'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const getCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }
    
    const { id } = req.params

    const case_ = await CaseModel.findOne({ _id: id, userId: user._id })

    if (!case_) {
      res.status(404).json({
        success: false,
        message: 'CaseModel not found'
      } as IApiResponse)
      return
    }

    res.status(200).json({
      success: true,
      message: 'CaseModel retrieved successfully',
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve CaseModel'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const updateCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }
    
    const { id } = req.params
    const updates: ICaseUpdate = req.body

    const case_ = await CaseModel.findOne({ _id: id, userId: user._id })

    if (!case_) {
      res.status(404).json({
        success: false,
        message: 'CaseModel not found'
      } as IApiResponse)
      return
    }

    // Update CaseModel
    const updatedCase = await CaseModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'CaseModel updated successfully',
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update CaseModel'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const deleteCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }
    
    const { id } = req.params

    const case_ = await CaseModel.findOne({ _id: id, userId: user._id })

    if (!case_) {
      res.status(404).json({
        success: false,
        message: 'CaseModel not found'
      } as IApiResponse)
      return
    }

    // Delete CaseModel (this will trigger the pre-remove middleware to update user's CaseModel count)
    await CaseModel.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: 'CaseModel deleted successfully'
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete CaseModel'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}

export const getCaseStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as IAuthRequest).user
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as IApiResponse)
      return
    }

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
      message: 'CaseModel stats retrieved successfully',
      data: result
    } as IApiResponse)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve CaseModel stats'
    res.status(500).json({
      success: false,
      message: errorMessage
    } as IApiResponse)
  }
}
