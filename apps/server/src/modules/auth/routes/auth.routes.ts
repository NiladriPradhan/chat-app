import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import authController from '../controllers/auth.controller';
import { requireAuth } from '../../../middleware/auth';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', requireAuth, asyncHandler(authController.getMe));

export default router;
