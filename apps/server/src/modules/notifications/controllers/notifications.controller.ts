import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/response';
import { NotificationsService } from '../services/notifications.service';

/**
 * Handles HTTP requests for notifications.
 */
export class NotificationsController {
  constructor(private readonly notificationsService = new NotificationsService()) {}

  /**
   * Retrieve notifications for a user.
   */
  public listNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const result = await this.notificationsService.listNotifications(userId);
      sendSuccess(res, 200, result, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a notification for a user.
   */
  public createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const result = await this.notificationsService.createNotification(userId, req.body);
      sendSuccess(res, 201, result, 'Notification created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark a notification as read.
   */
  public markNotificationAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notificationId = Array.isArray(req.params.notificationId) ? req.params.notificationId[0] : req.params.notificationId;
      const result = await this.notificationsService.markNotificationAsRead(notificationId);
      sendSuccess(res, 200, result, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  };
}

export default new NotificationsController();
