import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { requireAuth } from '../../../middleware/auth';
import messagesController from '../controllers/messages.controller';
import {
  validateSendMessage,
  validateEditMessage,
  validateGetMessages,
} from '../validators/message.validator';

// mergeParams: true so we can access :conversationId from the parent router
const router = Router({ mergeParams: true });

// All message routes require authentication
router.use(requireAuth);

// ── Bulk read (must be before /:messageId to avoid route conflict) ────────────
// POST /api/conversations/:conversationId/messages/read-all
router.post('/read-all', asyncHandler(messagesController.markAllAsRead));

// ── Message CRUD ──────────────────────────────────────────────────────────────

// GET  /api/conversations/:conversationId/messages?page=&limit=&before=
router.get(
  '/',
  validateGetMessages,
  asyncHandler(messagesController.listMessages),
);

// POST /api/conversations/:conversationId/messages
router.post(
  '/',
  validateSendMessage,
  asyncHandler(messagesController.sendMessage),
);

// PATCH /api/conversations/:conversationId/messages/:messageId
router.patch(
  '/:messageId',
  validateEditMessage,
  asyncHandler(messagesController.editMessage),
);

// DELETE /api/conversations/:conversationId/messages/:messageId
router.delete(
  '/:messageId',
  asyncHandler(messagesController.deleteMessage),
);

// POST /api/conversations/:conversationId/messages/:messageId/read
router.post(
  '/:messageId/read',
  asyncHandler(messagesController.markAsRead),
);

export default router;
