import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]:', err);

  let statusCode = err.status || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';

  // Handle Prisma Known Errors (e.g. unique constraint failed)
  if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    if (err.code === 'P2002') {
      message = 'A record with that value already exists.';
    } else {
      message = 'Database operation failed.';
    }
  }

  // Handle Prisma Validation Errors
  if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid data provided.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
