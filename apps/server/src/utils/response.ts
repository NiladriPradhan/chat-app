import { Response } from 'express';

export function sendSuccess(res: Response, statusCode = 200, data: unknown, message = 'Success') {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}
