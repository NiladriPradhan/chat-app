import { ConversationsRepository } from '../repositories/conversations.repository';
import {
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  UpdateConversationDto,
} from '../dtos/conversation.dto';

export class ConversationsService {
  constructor(
    private readonly repo = new ConversationsRepository(),
  ) {}

  // ── GET /conversations ────────────────────────────────────────────────────
  public async listConversations(userId: string) {
    const conversations = await this.repo.listForUser(userId);
    return { conversations };
  }

  // ── POST /conversations/direct ────────────────────────────────────────────
  public async createDirectConversation(
    requesterId: string,
    dto: CreateDirectConversationDto,
  ) {
    const { participantId } = dto;

    if (participantId === requesterId) {
      const err: any = new Error('You cannot start a conversation with yourself');
      err.status = 422;
      throw err;
    }

    // Prevent duplicate DMs
    const existing = await this.repo.findDirect(requesterId, participantId);
    if (existing) {
      return { conversation: existing, isNew: false };
    }

    const conversation = await this.repo.create({
      participantIds: [requesterId, participantId],
      createdBy: requesterId,
      isGroup: false,
    });

    return { conversation, isNew: true };
  }

  // ── POST /conversations/group ─────────────────────────────────────────────
  public async createGroupConversation(
    requesterId: string,
    dto: CreateGroupConversationDto,
  ) {
    const uniqueIds = Array.from(new Set([requesterId, ...dto.participantIds]));

    if (uniqueIds.length < 3) {
      const err: any = new Error('A group conversation requires at least 3 participants (including yourself)');
      err.status = 422;
      throw err;
    }

    const conversation = await this.repo.create({
      participantIds: uniqueIds,
      name: dto.name.trim(),
      description: dto.description?.trim(),
      avatar: dto.avatar,
      createdBy: requesterId,
      isGroup: true,
    });

    return { conversation };
  }

  // ── GET /conversations/:id ────────────────────────────────────────────────
  public async getConversation(conversationId: string, requesterId: string) {
    const conversation = await this.repo.getById(conversationId);
    if (!conversation) {
      const err: any = new Error('Conversation not found');
      err.status = 404;
      throw err;
    }

    const isMember = await this.repo.isParticipant(conversationId, requesterId);
    if (!isMember) {
      const err: any = new Error('You are not a member of this conversation');
      err.status = 403;
      throw err;
    }

    return { conversation };
  }

  // ── PATCH /conversations/:id ──────────────────────────────────────────────
  public async updateConversation(
    conversationId: string,
    requesterId: string,
    dto: UpdateConversationDto,
  ) {
    const conversation = await this.repo.getById(conversationId);
    if (!conversation) {
      const err: any = new Error('Conversation not found');
      err.status = 404;
      throw err;
    }

    if (!conversation.isGroup) {
      const err: any = new Error('Only group conversations can be updated');
      err.status = 422;
      throw err;
    }

    const isMember = await this.repo.isParticipant(conversationId, requesterId);
    if (!isMember) {
      const err: any = new Error('You are not a member of this conversation');
      err.status = 403;
      throw err;
    }

    const updated = await this.repo.update(conversationId, {
      name: dto.name?.trim(),
      description: dto.description?.trim(),
      avatar: dto.avatar,
    });

    return { conversation: updated };
  }

  // ── DELETE /conversations/:id ─────────────────────────────────────────────
  public async deleteConversation(conversationId: string, requesterId: string) {
    const conversation = await this.repo.getById(conversationId);
    if (!conversation) {
      const err: any = new Error('Conversation not found');
      err.status = 404;
      throw err;
    }

    // Only the conversation creator can delete it
    const createdById = (conversation.createdBy as any)?._id?.toString()
      ?? conversation.createdBy?.toString();

    if (createdById !== requesterId) {
      const err: any = new Error('Only the conversation creator can delete it');
      err.status = 403;
      throw err;
    }

    await this.repo.delete(conversationId);
    return { success: true };
  }

  // ── POST /conversations/:id/participants ──────────────────────────────────
  public async addParticipant(
    conversationId: string,
    requesterId: string,
    userId: string,
  ) {
    const conversation = await this.repo.getById(conversationId);
    if (!conversation) {
      const err: any = new Error('Conversation not found');
      err.status = 404;
      throw err;
    }

    if (!conversation.isGroup) {
      const err: any = new Error('Cannot add participants to a direct conversation');
      err.status = 422;
      throw err;
    }

    const isMember = await this.repo.isParticipant(conversationId, requesterId);
    if (!isMember) {
      const err: any = new Error('You are not a member of this conversation');
      err.status = 403;
      throw err;
    }

    const updated = await this.repo.addParticipant(conversationId, userId);
    return { conversation: updated };
  }

  // ── DELETE /conversations/:id/participants ────────────────────────────────
  public async removeParticipant(
    conversationId: string,
    requesterId: string,
    userId: string,
  ) {
    const conversation = await this.repo.getById(conversationId);
    if (!conversation) {
      const err: any = new Error('Conversation not found');
      err.status = 404;
      throw err;
    }

    if (!conversation.isGroup) {
      const err: any = new Error('Cannot remove participants from a direct conversation');
      err.status = 422;
      throw err;
    }

    const isMember = await this.repo.isParticipant(conversationId, requesterId);
    if (!isMember) {
      const err: any = new Error('You are not a member of this conversation');
      err.status = 403;
      throw err;
    }

    const updated = await this.repo.removeParticipant(conversationId, userId);
    return { conversation: updated };
  }
}
