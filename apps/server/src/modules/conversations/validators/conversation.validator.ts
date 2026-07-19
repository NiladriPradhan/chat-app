import { Request, Response, NextFunction } from 'express';

function sendValidationError(res: Response, message: string) {
  res.status(422).json({ success: false, message });
}

// POST /conversations/direct
export function validateCreateDirect(req: Request, res: Response, next: NextFunction) {
  const { participantId } = req.body;

  if (!participantId || typeof participantId !== 'string' || !participantId.trim()) {
    return sendValidationError(res, 'participantId is required');
  }

  next();
}

// POST /conversations/group
export function validateCreateGroup(req: Request, res: Response, next: NextFunction) {
  const { participantIds, name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return sendValidationError(res, 'Group name is required');
  }

  if (!Array.isArray(participantIds) || participantIds.length < 2) {
    return sendValidationError(res, 'Group conversation requires at least 2 participantIds');
  }

  next();
}

// PATCH /conversations/:id
export function validateUpdateConversation(req: Request, res: Response, next: NextFunction) {
  const { name, description, avatar } = req.body;

  const hasUpdate = [name, description, avatar].some((v) => v !== undefined);
  if (!hasUpdate) {
    return sendValidationError(res, 'At least one of name, description, or avatar must be provided');
  }

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return sendValidationError(res, 'name must be a non-empty string');
  }

  next();
}

// POST /conversations/:id/participants
export function validateAddParticipant(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.body;

  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return sendValidationError(res, 'userId is required');
  }

  next();
}

// DELETE /conversations/:id/participants
export function validateRemoveParticipant(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.body;

  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    return sendValidationError(res, 'userId is required');
  }

  next();
}
