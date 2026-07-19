import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/response';
import { AdminService } from '../services/admin.service';

/**
 * Handles HTTP requests for admin operations.
 */
export class AdminController {
  constructor(private readonly adminService = new AdminService()) {}

  /**
   * Retrieve system statistics.
   */
  public getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.getStats();
      sendSuccess(res, 200, result, 'Admin stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieve all users for admin management.
   */
  public listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.listUsers();
      sendSuccess(res, 200, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a user by ID.
   */
  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.adminService.deleteUser(userId);
      sendSuccess(res, 200, result, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieve all conversations for admin management.
   */
  public listConversations = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.adminService.listConversations();
      sendSuccess(res, 200, result, 'Conversations retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a conversation by ID.
   */
  public deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.adminService.deleteConversation(conversationId);
      sendSuccess(res, 200, result, 'Conversation deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminController();
