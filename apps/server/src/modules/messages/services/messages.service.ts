import { MessagesRepository } from '../repositories/messages.repository';
import { ConversationsRepository } from '../../conversations/repositories/conversations.repository';
import { SendMessageDto, EditMessageDto, GetMessagesQuery, MarkReadDto } from '../dtos/message.dto';

export class MessagesService {
  constructor(
    private readonly messagesRepo = new MessagesRepository(),
    private readonly convoRepo   = new ConversationsRepository(),
  ) {}

  // ── GET /:conversationId/messages ─────────────────────────────────────────
  public async getMessages(
    conversationId: string,
    requesterId: string,
    query: GetMessagesQuery,
  ) {
    // Guard: requester must be a participant
    const isMember = await this.convoRepo.isParticipant(conversationId, requesterId);
    if (!isMember) {
      const e: any = new Error('You are not a member of this conversation');
      e.status = 403;
      throw e;
    }

    const page  = Math.max(1, Number(query.page  ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 50)));

    const { messages, total } = await this.messagesRepo.listPaginated(conversationId, query);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        hasMore: page * limit < total,
      },
    };
  }

  // ── POST /:conversationId/messages ────────────────────────────────────────
  public async sendMessage(
    conversationId: string,
    requesterId: string,
    dto: SendMessageDto,
  ) {
    const isMember = await this.convoRepo.isParticipant(conversationId, requesterId);
    if (!isMember) {
      const e: any = new Error('You are not a member of this conversation');
      e.status = 403;
      throw e;
    }

    const message = await this.messagesRepo.create(conversationId, {
      senderId: requesterId,
      content: dto.content,
      attachments: dto.attachments,
    });

    return { message };
  }

  // ── PATCH /:conversationId/messages/:messageId ────────────────────────────
  public async editMessage(
    messageId: string,
    requesterId: string,
    dto: EditMessageDto,
  ) {
    const isSender = await this.messagesRepo.isSender(messageId, requesterId);
    if (!isSender) {
      const e: any = new Error('You can only edit your own messages');
      e.status = 403;
      throw e;
    }

    const message = await this.messagesRepo.edit(messageId, dto.content);
    if (!message) {
      const e: any = new Error('Message not found');
      e.status = 404;
      throw e;
    }

    return { message };
  }

  // ── DELETE /:conversationId/messages/:messageId ───────────────────────────
  public async deleteMessage(messageId: string, requesterId: string) {
    const isSender = await this.messagesRepo.isSender(messageId, requesterId);
    if (!isSender) {
      const e: any = new Error('You can only delete your own messages');
      e.status = 403;
      throw e;
    }

    const message = await this.messagesRepo.delete(messageId);
    if (!message) {
      const e: any = new Error('Message not found');
      e.status = 404;
      throw e;
    }

    return { message };
  }

  // ── POST /:conversationId/messages/:messageId/read ────────────────────────
  public async markMessageAsRead(messageId: string, requesterId: string) {
    const message = await this.messagesRepo.markOneAsRead(messageId, requesterId);
    if (!message) {
      const e: any = new Error('Message not found');
      e.status = 404;
      throw e;
    }
    return { message };
  }

  // ── POST /:conversationId/messages/read-all ───────────────────────────────
  public async markAllAsRead(
    conversationId: string,
    requesterId: string,
    dto: MarkReadDto,
  ) {
    const isMember = await this.convoRepo.isParticipant(conversationId, requesterId);
    if (!isMember) {
      const e: any = new Error('You are not a member of this conversation');
      e.status = 403;
      throw e;
    }

    const modifiedCount = await this.messagesRepo.markAllAsRead(
      conversationId,
      requesterId,
      dto.upToMessageId,
    );

    return { markedRead: modifiedCount };
  }
}
