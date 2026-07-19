import { Types } from 'mongoose';
import { MessageModel } from '../../../models/message.model';
import { ConversationModel } from '../../../models/conversation.model';
import { GetMessagesQuery } from '../dtos/message.dto';

const SENDER_PROJECTION = 'name email avatar';

export class MessagesRepository {

  // ── Paginated list ────────────────────────────────────────────────────────
  public async listPaginated(conversationId: string, query: GetMessagesQuery) {
    if (!Types.ObjectId.isValid(conversationId)) return { messages: [], total: 0 };

    const page  = Math.max(1, Number(query.page  ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 50)));
    const skip  = (page - 1) * limit;

    const filter: Record<string, any> = { conversationId: new Types.ObjectId(conversationId) };

    // Cursor-based: return messages with createdAt < `before`
    if (query.before) {
      filter.createdAt = { $lt: new Date(query.before) };
    }

    const [messages, total] = await Promise.all([
      MessageModel.find(filter)
        .populate('senderId', SENDER_PROJECTION)
        .sort({ createdAt: -1 }) // newest first — client reverses for display
        .skip(skip)
        .limit(limit)
        .lean(),
      MessageModel.countDocuments(filter),
    ]);

    return { messages: messages.reverse(), total }; // oldest→newest order for the client
  }

  // ── Get single message ────────────────────────────────────────────────────
  public async getById(messageId: string) {
    if (!Types.ObjectId.isValid(messageId)) return null;
    return MessageModel.findById(messageId)
      .populate('senderId', SENDER_PROJECTION)
      .lean();
  }

  // ── Create ────────────────────────────────────────────────────────────────
  public async create(
    conversationId: string,
    input: { senderId: string; content: string; attachments?: any[] },
  ) {
    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(input.senderId)) {
      throw new Error('Invalid IDs');
    }

    const exists = await ConversationModel.findById(conversationId).lean();
    if (!exists) {
      const e: any = new Error('Conversation not found');
      e.status = 404;
      throw e;
    }

    const message = await MessageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(input.senderId),
      content: (input.content || '').trim(),
      attachments: input.attachments ?? [],
      readBy: [new Types.ObjectId(input.senderId)], // sender has already "read" own message
    });

    // Touch conversation's updatedAt so list sorts correctly
    await ConversationModel.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    return MessageModel.findById(message._id)
      .populate('senderId', SENDER_PROJECTION)
      .lean();
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  public async edit(messageId: string, content: string) {
    if (!Types.ObjectId.isValid(messageId)) return null;
    return MessageModel.findByIdAndUpdate(
      messageId,
      { content: content.trim(), isEdited: true, editedAt: new Date() },
      { new: true },
    )
      .populate('senderId', SENDER_PROJECTION)
      .lean();
  }

  // ── Soft Delete ───────────────────────────────────────────────────────────
  public async delete(messageId: string) {
    if (!Types.ObjectId.isValid(messageId)) return null;
    return MessageModel.findByIdAndUpdate(
      messageId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        content: '',
        attachments: [],
      },
      { new: true },
    ).lean();
  }

  // ── Mark single message as read ───────────────────────────────────────────
  public async markOneAsRead(messageId: string, userId: string) {
    if (!Types.ObjectId.isValid(messageId) || !Types.ObjectId.isValid(userId)) return null;
    return MessageModel.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: new Types.ObjectId(userId) } },
      { new: true },
    )
      .populate('senderId', SENDER_PROJECTION)
      .lean();
  }

  // ── Mark all unread messages in a conversation as read (bulk) ─────────────
  public async markAllAsRead(conversationId: string, userId: string, upToMessageId?: string) {
    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(userId)) return 0;

    const filter: Record<string, any> = {
      conversationId: new Types.ObjectId(conversationId),
      readBy: { $ne: new Types.ObjectId(userId) },
      senderId: { $ne: new Types.ObjectId(userId) }, // don't mark your own messages
    };

    // Optionally limit to messages up to a given message
    if (upToMessageId && Types.ObjectId.isValid(upToMessageId)) {
      const upTo = await MessageModel.findById(upToMessageId).select('createdAt').lean();
      if (upTo) filter.createdAt = { $lte: upTo.createdAt };
    }

    const result = await MessageModel.updateMany(
      filter,
      { $addToSet: { readBy: new Types.ObjectId(userId) } },
    );

    return result.modifiedCount;
  }

  // ── Check sender ownership ────────────────────────────────────────────────
  public async isSender(messageId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(messageId) || !Types.ObjectId.isValid(userId)) return false;
    const msg = await MessageModel.findById(messageId).select('senderId').lean();
    return !!msg && msg.senderId.toString() === userId;
  }
}
