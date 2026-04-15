import { Request, Response } from 'express'
import SupportRequest from '../models/SupportRequest'
import { SupportRequestType, IApiResponse } from '../types'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'

export const submitPublicTicket = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const { name, email, lawFirm, subject, description } = req.body

    if (!name || !email || !subject || !description) {
        throw new AppError('Name, email, subject, and description are required', 400)
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

    res.status(201).json({
        success: true,
        message: 'Support ticket submitted successfully',
        data: { ticketId: ticket._id }
    } as IApiResponse)
})
