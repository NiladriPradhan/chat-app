import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/response';
import { MessagesService } from '../services/messages.service';

const param = (p: string | string[]): string => (Array.isArray(p) ? p[0] : p);

export class MessagesController {
  constructor(private readonly service = new MessagesService()) {}

  // GET /api/conversations/:conversationId/messages?page=1&limit=50&before=<ISO>
  public listMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversationId = param(req.params.conversationId);
      const userId = req.userId!;
      const { page, limit, before } = req.query;

      const result = await this.service.getMessages(conversationId, userId, {
        page:   page  ? Number(page)  : undefined,
        limit:  limit ? Number(limit) : undefined,
        before: before as string | undefined,
      });

      sendSuccess(res, 200, result, 'Messages retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/conversations/:conversationId/messages
  public sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversationId = param(req.params.conversationId);
      const userId = req.userId!;
      const result = await this.service.sendMessage(conversationId, userId, req.body);
      sendSuccess(res, 201, result, 'Message sent');
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/conversations/:conversationId/messages/:messageId
  public editMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const messageId = param(req.params.messageId);
      const userId = req.userId!;
      const result = await this.service.editMessage(messageId, userId, req.body);
      sendSuccess(res, 200, result, 'Message updated');
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/conversations/:conversationId/messages/:messageId
  public deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const messageId = param(req.params.messageId);
      const userId = req.userId!;
      const result = await this.service.deleteMessage(messageId, userId);
      sendSuccess(res, 200, result, 'Message deleted');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/conversations/:conversationId/messages/:messageId/read
  public markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const messageId = param(req.params.messageId);
      const userId = req.userId!;
      const result = await this.service.markMessageAsRead(messageId, userId);
      sendSuccess(res, 200, result, 'Message marked as read');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/conversations/:conversationId/messages/read-all
  public markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversationId = param(req.params.conversationId);
      const userId = req.userId!;
      const result = await this.service.markAllAsRead(conversationId, userId, req.body);
      sendSuccess(res, 200, result, 'Messages marked as read');
    } catch (error) {
      next(error);
    }
  };
}

export default new MessagesController();
