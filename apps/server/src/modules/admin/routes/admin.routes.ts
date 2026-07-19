import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import adminController from '../controllers/admin.controller';

const router = Router();

router.get('/stats', asyncHandler(adminController.getStats));
router.get('/users', asyncHandler(adminController.listUsers));
router.delete('/users/:id', asyncHandler(adminController.deleteUser));
router.get('/conversations', asyncHandler(adminController.listConversations));
router.delete('/conversations/:id', asyncHandler(adminController.deleteConversation));

export default router;
