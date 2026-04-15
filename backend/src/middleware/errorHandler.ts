import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import logger from '../utils/logger';

interface MulterError extends Error {
  code: 'LIMIT_FILE_SIZE' | 'LIMIT_FILE_COUNT';
}

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    logger.error(err, 'ERROR 💥');
    res.status(500).json({
      success: false,
      message: 'Something went very wrong!',
    });
  }
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = err;

    if (err.name === 'CastError') {
      error = new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      error = new AppError(`An account with this ${field} already exists.`, 400);
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((el: any) => el.message);
      error = new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
    }

    if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token. Please log in again!', 401);
    }
    if (err.name === 'TokenExpiredError') {
      error = new AppError('Your token has expired! Please log in again.', 401);
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File too large. Maximum size is 10MB', 400);
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      error = new AppError('Too many files. Please check the upload limit.', 400);
    }

    if (!(error instanceof AppError)) {
      error.isOperational = err.isOperational || false;
    }

    sendErrorProd(error as AppError, res);
  }
};
