import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/response';
import { SettingsService } from '../services/settings.service';

/**
 * Handles HTTP requests for settings.
 */
export class SettingsController {
  constructor(private readonly settingsService = new SettingsService()) {}

  /**
   * Retrieve settings for a user.
   */
  public getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const result = await this.settingsService.getSettings(userId);
      sendSuccess(res, 200, result, 'Settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update settings for a user.
   */
  public updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const result = await this.settingsService.updateSettings(userId, req.body);
      sendSuccess(res, 200, result, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default new SettingsController();
