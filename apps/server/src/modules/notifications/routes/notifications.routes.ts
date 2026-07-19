import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import notificationsController from '../controllers/notifications.controller';

const router = Router();

router.get('/:userId', asyncHandler(notificationsController.listNotifications));
router.post('/:userId', asyncHandler(notificationsController.createNotification));
router.patch('/:notificationId/read', asyncHandler(notificationsController.markNotificationAsRead));

export default router;
