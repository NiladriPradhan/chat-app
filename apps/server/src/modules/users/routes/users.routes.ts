import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { requireAuth } from '../../../middleware/auth';
import usersController from '../controllers/users.controller';

const router = Router();

router.use(requireAuth);

router.get('/search', asyncHandler(usersController.searchUsers));
router.get('/', asyncHandler(usersController.listUsers));
router.get('/:id', asyncHandler(usersController.getUser));
router.patch('/:id', asyncHandler(usersController.updateUser));

export default router;
