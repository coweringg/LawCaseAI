import { Request, Response } from 'express'
import { SystemSetting } from '../models'
import { IApiResponse } from '../types'

export const getSystemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const maintenanceModeObj = await SystemSetting.findOne({ key: 'maintenanceMode' })
    const globalAlertObj = await SystemSetting.findOne({ key: 'globalAlert' })

    res.status(200).json({
      success: true,
      data: {
        maintenanceMode: maintenanceModeObj?.value || false,
        globalAlert: globalAlertObj?.value || null
      }
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch system status'
    } as IApiResponse)
  }
}

export const toggleMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active } = req.body
    
    await SystemSetting.findOneAndUpdate(
      { key: 'maintenanceMode' },
      { 
        value: active,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    )

    res.status(200).json({
      success: true,
      message: `Maintenance mode ${active ? 'enabled' : 'disabled'}`
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle maintenance mode'
    } as IApiResponse)
  }
}

export const updateGlobalAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, type = 'info', active = true } = req.body
    
    const value = active ? { message, type, timestamp: new Date() } : null

    await SystemSetting.findOneAndUpdate(
      { key: 'globalAlert' },
      { 
        value,
        lastUpdated: new Date() 
      },
      { upsert: true, new: true }
    )

    res.status(200).json({
      success: true,
      message: active ? 'Global alert broadcasted' : 'Global alert cleared'
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update global alert'
    } as IApiResponse)
  }
}
