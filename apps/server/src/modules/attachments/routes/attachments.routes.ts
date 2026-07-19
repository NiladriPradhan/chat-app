import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { requireAuth } from '../../../middleware/auth';
import { upload } from '../../../utils/upload';
import attachmentsController from '../controllers/attachments.controller';

const router = Router();

router.use(requireAuth);

router.get('/user/:userId', asyncHandler(attachmentsController.listAttachmentsByUser));
router.get('/conversation/:conversationId', asyncHandler(attachmentsController.listAttachmentsByConversation));
router.post('/upload', upload.single('file'), asyncHandler(attachmentsController.uploadAttachment));
router.get('/:id', asyncHandler(attachmentsController.getAttachmentById));
router.delete('/:id', asyncHandler(attachmentsController.deleteAttachment));

export default router;
