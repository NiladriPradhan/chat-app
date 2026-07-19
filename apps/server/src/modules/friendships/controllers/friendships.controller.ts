import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/response';
import { FriendshipsService } from '../services/friendships.service';

/**
 * Handles HTTP requests for friendships.
 */
export class FriendshipsController {
  constructor(private readonly friendshipsService = new FriendshipsService()) {}

  /**
   * Retrieve a user's friendships.
   */
  public listFriendships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const result = await this.friendshipsService.listFriendships(userId);
      sendSuccess(res, 200, result, 'Friendships retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new friend request.
   */
  public createFriendRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.friendshipsService.createFriendRequest(req.body);
      sendSuccess(res, 201, result, 'Friend request created successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default new FriendshipsController();
