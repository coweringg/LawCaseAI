import { Request, Response } from 'express'
import SupportRequest from '../models/SupportRequest'
import { SupportRequestType, IApiResponse } from '../types'

export const submitPublicTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, lawFirm, subject, description } = req.body

    if (!name || !email || !subject || !description) {
      const resp: IApiResponse = {
        success: false,
        message: 'Name, email, subject, and description are required',
      }
      res.status(400).json(resp)
      return
    }

    const ticket = new SupportRequest({
      userName: name,
      userEmail: email,
      lawFirm: lawFirm || 'Not provided',
      subject,
      description,
      type: SupportRequestType.LOGIN_ISSUE
    })

    await ticket.save()

    const resp: IApiResponse = {
      success: true,
      message: 'Support ticket submitted successfully',
      data: { ticketId: ticket._id }
    }
    
    res.status(201).json(resp)
  } catch (error) {
    console.error('Error submitting public ticket:', error)
    const resp: IApiResponse = {
      success: false,
      message: 'Failed to submit support ticket',
    }
    res.status(500).json(resp)
  }
}
