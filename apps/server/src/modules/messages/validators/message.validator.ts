import { Request, Response, NextFunction } from 'express';

function err(res: Response, msg: string) {
  res.status(422).json({ success: false, message: msg });
}

// POST /:conversationId/messages
export function validateSendMessage(req: Request, res: Response, next: NextFunction) {
  const { content, attachments } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return err(res, 'content is required and must be a non-empty string');
  }

  if (attachments !== undefined) {
    if (!Array.isArray(attachments)) {
      return err(res, 'attachments must be an array');
    }
    for (const att of attachments) {
      if (!att.url || !att.type || !att.fileName) {
        return err(res, 'Each attachment must have url, type, and fileName');
      }
    }
  }

  next();
}

// PATCH /:conversationId/messages/:messageId
export function validateEditMessage(req: Request, res: Response, next: NextFunction) {
  const { content } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return err(res, 'content is required and must be a non-empty string');
  }

  next();
}

// GET /:conversationId/messages — query param validation
export function validateGetMessages(req: Request, res: Response, next: NextFunction) {
  const { page, limit, before } = req.query;

  if (page !== undefined && (isNaN(Number(page)) || Number(page) < 1)) {
    return err(res, 'page must be a positive integer');
  }
  if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return err(res, 'limit must be between 1 and 100');
  }
  if (before !== undefined && isNaN(Date.parse(before as string))) {
    return err(res, 'before must be a valid ISO date string');
  }

  next();
}
