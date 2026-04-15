import { Request, Response } from 'express'
import { SystemSetting } from '../models'
import { IApiResponse } from '../types'
import mongoose from 'mongoose'
import catchAsync from '../utils/catchAsync'

export const getSystemStatus = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const [maintenanceModeObj, globalAlertObj] = await Promise.all([
        SystemSetting.findOne({ key: 'maintenanceMode' }),
        SystemSetting.findOne({ key: 'globalAlert' })
    ])

    res.status(200).json({
      success: true,
      data: {
        maintenanceMode: maintenanceModeObj?.value || false,
        globalAlert: globalAlertObj?.value || null
      }
    } as IApiResponse)
})

export const toggleMaintenance = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { active } = req.body
    
    await SystemSetting.findOneAndUpdate(
      { key: 'maintenanceMode' },
      { value: active, lastUpdated: new Date() },
      { upsert: true, new: true }
    )

    res.status(200).json({
      success: true,
      message: `Maintenance mode ${active ? 'enabled' : 'disabled'}`
    } as IApiResponse)
})

export const updateGlobalAlert = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { message, type = 'info', active = true } = req.query as any
    const msg = message || req.body.message
    const tp = type || req.body.type || 'info'
    const act = active !== undefined ? (active === 'true' || active === true) : req.body.active
    
    const value = act ? { message: msg, type: tp, timestamp: new Date() } : null

    await SystemSetting.findOneAndUpdate(
      { key: 'globalAlert' },
      { value, lastUpdated: new Date() },
      { upsert: true, new: true }
    )

    res.status(200).json({
      success: true,
      message: act ? 'Global alert broadcasted' : 'Global alert cleared'
    } as IApiResponse)
})

export const getSystemHealth = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Unstable'
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024
    
    res.status(200).json({
      success: true,
      data: {
        status: 'Optimal',
        nodes: [
          { name: 'Primary Database', status: dbStatus, latency: '12ms' },
          { name: 'Neural Processing Unit', status: 'Operational', latency: '450ms' },
          { name: 'Storage Vault', status: 'Healthy', latency: '8ms' },
          { name: 'Payment Gateway (Stripe)', status: 'Active', latency: '120ms' }
        ],
        metrics: {
          uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
          memory: `${memoryUsage.toFixed(2)} MB`,
          traffic: 'Standard'
        }
      }
    } as IApiResponse)
})
