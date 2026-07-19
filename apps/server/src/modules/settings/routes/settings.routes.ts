import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import settingsController from '../controllers/settings.controller';

const router = Router();

router.get('/:userId', asyncHandler(settingsController.getSettings));
router.patch('/:userId', asyncHandler(settingsController.updateSettings));

export default router;
