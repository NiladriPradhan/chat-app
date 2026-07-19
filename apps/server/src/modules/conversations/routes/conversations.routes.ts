import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { requireAuth } from '../../../middleware/auth';
import conversationsController from '../controllers/conversations.controller';
import messagesRouter from '../../messages/routes/messages.routes';
import {
  validateCreateDirect,
  validateCreateGroup,
  validateUpdateConversation,
  validateAddParticipant,
  validateRemoveParticipant,
} from '../validators/conversation.validator';

const router = Router();

// All conversation routes require authentication
router.use(requireAuth);

// ── Conversation CRUD ────────────────────────────────────────────────────────

// GET  /api/conversations          - List all conversations for current user
router.get(
  '/',
  asyncHandler(conversationsController.listConversations),
);

// POST /api/conversations/direct   - Create or return a direct (1-to-1) conversation
router.post(
  '/direct',
  validateCreateDirect,
  asyncHandler(conversationsController.createDirect),
);

// POST /api/conversations/group    - Create a new group conversation
router.post(
  '/group',
  validateCreateGroup,
  asyncHandler(conversationsController.createGroup),
);

// GET  /api/conversations/:id      - Get a single conversation by ID
router.get(
  '/:id',
  asyncHandler(conversationsController.getConversation),
);

// PATCH /api/conversations/:id     - Update a group conversation's meta
router.patch(
  '/:id',
  validateUpdateConversation,
  asyncHandler(conversationsController.updateConversation),
);

// DELETE /api/conversations/:id    - Delete a conversation (creator only)
router.delete(
  '/:id',
  asyncHandler(conversationsController.deleteConversation),
);

// ── Participant management ────────────────────────────────────────────────────

// POST   /api/conversations/:id/participants  - Add a participant to a group
router.post(
  '/:id/participants',
  validateAddParticipant,
  asyncHandler(conversationsController.addParticipant),
);

// DELETE /api/conversations/:id/participants  - Remove a participant from a group
router.delete(
  '/:id/participants',
  validateRemoveParticipant,
  asyncHandler(conversationsController.removeParticipant),
);

// ── Nested messages routes ────────────────────────────────────────────────────
// GET  /api/conversations/:conversationId/messages
// POST /api/conversations/:conversationId/messages
router.use('/:conversationId/messages', messagesRouter);

export default router;
