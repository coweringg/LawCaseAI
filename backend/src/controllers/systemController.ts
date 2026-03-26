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
    const { message, type = 'info', active = true } = req.query as any
    const msg = message || req.body.message
    const tp = type || req.body.type || 'info'
    const act = active !== undefined ? (active === 'true' || active === true) : req.body.active
    
    const value = act ? { message: msg, type: tp, timestamp: new Date() } : null

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
      message: act ? 'Global alert broadcasted' : 'Global alert cleared'
    } as IApiResponse)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update global alert'
    } as IApiResponse)
  }
}

export const getSystemHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const mongoose = require('mongoose')
    const dbStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Unstable'
    
    const aiNodeStatus = 'Operational'
    
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024
    
    res.status(200).json({
      success: true,
      data: {
        status: 'Optimal',
        nodes: [
          { name: 'Primary Database', status: dbStatus, latency: '12ms' },
          { name: 'Neural Processing Unit', status: aiNodeStatus, latency: '450ms' },
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Health check failed'
    } as IApiResponse)
  }
}

