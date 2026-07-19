import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/response';
import { AuthService } from '../services/auth.service';

/**
 * Handles HTTP requests for authentication flows.
 */
export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  /**
   * Register a new user account.
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      sendSuccess(res, 201, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Authenticate an existing user.
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      sendSuccess(res, 200, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Fetch the current user profile.
   */
  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userIdFromReq = (req as any).userId || undefined;
      const raw = req.query.userId;
      const userIdQuery = typeof raw === 'string' ? raw : Array.isArray(raw) ? String(raw[0]) : undefined;
      const userId = userIdFromReq || userIdQuery || '';
      const result = await this.authService.getMe(userId);
      sendSuccess(res, 200, result, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
