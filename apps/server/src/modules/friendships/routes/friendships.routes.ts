import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import friendshipsController from '../controllers/friendships.controller';

const router = Router();

router.get('/:userId', asyncHandler(friendshipsController.listFriendships));
router.post('/request', asyncHandler(friendshipsController.createFriendRequest));

export default router;
