import { Request, Response, NextFunction } from 'express';

const LOG_LEVELS = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG',
};

function formatLog(level: string, message: string, meta?: unknown) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

export const logger = {
  info: (message: string, meta?: unknown) => console.log(formatLog(LOG_LEVELS.info, message, meta)),
  warn: (message: string, meta?: unknown) => console.warn(formatLog(LOG_LEVELS.warn, message, meta)),
  error: (message: string, meta?: unknown) => console.error(formatLog(LOG_LEVELS.error, message, meta)),
  debug: (message: string, meta?: unknown) => {
    if (process.env.DEBUG_MODE === 'true') {
      console.debug(formatLog(LOG_LEVELS.debug, message, meta));
    }
  },
};

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const start = Date.now();
  const originalJson = _res.json;

  _res.json = function jsonHandler(body: unknown) {
    const duration = Date.now() - start;
    const statusCode = _res.statusCode;
    logger.info(`${req.method} ${req.path}`, {
      statusCode,
      duration: `${duration}ms`,
      userId: (req.query.userId || req.body?.userId) as string | undefined,
    });
    return originalJson.call(this, body);
  };

  next();
}

export function errorHandler(err: Error | any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  logger.error('Request error', { message, path: _req.path, status });
  
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
