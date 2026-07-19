import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/response';
import { ConversationsService } from '../services/conversations.service';

// Express route params can be string | string[] — normalise to string
const param = (p: string | string[]): string => (Array.isArray(p) ? p[0] : p);

export class ConversationsController {
  constructor(
    private readonly service = new ConversationsService(),
  ) {}

  // GET /api/conversations
  public listConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const result = await this.service.listConversations(userId);
      sendSuccess(res, 200, result, 'Conversations retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/conversations/direct
  public createDirect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const result = await this.service.createDirectConversation(userId, req.body);
      sendSuccess(res, result.isNew ? 201 : 200, { conversation: result.conversation },
        result.isNew ? 'Conversation created' : 'Existing conversation returned');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/conversations/group
  public createGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const result = await this.service.createGroupConversation(userId, req.body);
      sendSuccess(res, 201, result, 'Group conversation created');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/conversations/:id
  public getConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = param(req.params.id);
      const result = await this.service.getConversation(id, userId);
      sendSuccess(res, 200, result, 'Conversation retrieved');
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/conversations/:id
  public updateConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = param(req.params.id);
      const result = await this.service.updateConversation(id, userId, req.body);
      sendSuccess(res, 200, result, 'Conversation updated');
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/conversations/:id
  public deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = param(req.params.id);
      const result = await this.service.deleteConversation(id, userId);
      sendSuccess(res, 200, result, 'Conversation deleted');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/conversations/:id/participants
  public addParticipant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = param(req.params.id);
      const { userId: targetUserId } = req.body;
      const result = await this.service.addParticipant(id, userId, targetUserId);
      sendSuccess(res, 200, result, 'Participant added');
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/conversations/:id/participants
  public removeParticipant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const id = param(req.params.id);
      const { userId: targetUserId } = req.body;
      const result = await this.service.removeParticipant(id, userId, targetUserId);
      sendSuccess(res, 200, result, 'Participant removed');
    } catch (error) {
      next(error);
    }
  };
}

export default new ConversationsController();

