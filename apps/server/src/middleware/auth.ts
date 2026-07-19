import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwt.secret) as { sub: string };
    req.userId = payload.sub;
    return next();
  } catch (err) {
    const e: any = new Error('Invalid or expired token');
    e.status = 401;
    return next(e);
  }
}
