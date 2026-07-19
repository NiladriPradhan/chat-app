import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/response';
import { UserService } from '../services/users.service';

/**
 * Handles HTTP requests for user profiles.
 */
export class UsersController {
  constructor(private readonly userService = new UserService()) {}

  /**
   * Retrieve all users.
   */
  public listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.userService.listUsers();
      sendSuccess(res, 200, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string;
      const excludeId = req.userId; // exclude the requester from results
      const result = await this.userService.searchUsers(query, excludeId);
      sendSuccess(res, 200, result, 'Users found');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieve a single user by ID.
   */
  public getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.userService.getUser(userId);
      sendSuccess(res, 200, result, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing user profile.
   */
  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.userService.updateUser(userId, req.body);
      sendSuccess(res, 200, result, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default new UsersController();
