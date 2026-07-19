import { Types } from 'mongoose';
import { ConversationModel } from '../../../models/conversation.model';
import { MessageModel } from '../../../models/message.model';

const PARTICIPANT_PROJECTION = 'name email avatar';

export class ConversationsRepository {

  // ── List all conversations for a user, enriched with lastMessage + unreadCount
  public async listForUser(userId: string) {
    const conversations = await ConversationModel
      .find({ participants: userId })
      .populate('participants', PARTICIPANT_PROJECTION)
      .sort({ updatedAt: -1 })
      .lean();

    // Enrich each conversation with lastMessage and unreadCount in parallel
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const [lastMessage, unreadCount] = await Promise.all([
          MessageModel.findOne({ conversationId: conv._id })
            .sort({ createdAt: -1 })
            .select('content senderId createdAt')
            .lean(),
          MessageModel.countDocuments({
            conversationId: conv._id,
            readBy: { $ne: new Types.ObjectId(userId) },
            senderId: { $ne: new Types.ObjectId(userId) },
          }),
        ]);
        return { ...conv, lastMessage: lastMessage ?? null, unreadCount };
      }),
    );

    return enriched;
  }

  // ── Get a single conversation by ID
  public async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return ConversationModel
      .findById(id)
      .populate('participants', PARTICIPANT_PROJECTION)
      .populate('createdBy', PARTICIPANT_PROJECTION)
      .lean();
  }

  // ── Find an existing DM between exactly two users
  public async findDirect(userAId: string, userBId: string) {
    return ConversationModel.findOne({
      isGroup: false,
      participants: {
        $all: [new Types.ObjectId(userAId), new Types.ObjectId(userBId)],
        $size: 2,
      },
    })
      .populate('participants', PARTICIPANT_PROJECTION)
      .lean();
  }

  // ── Create a new conversation
  public async create(input: {
    participantIds: string[];
    name?: string;
    description?: string;
    avatar?: string;
    createdBy: string;
    isGroup: boolean;
  }) {
    const conversation = await ConversationModel.create({
      participants: input.participantIds,
      name: input.name,
      description: input.description,
      avatar: input.avatar,
      createdBy: input.createdBy,
      isGroup: input.isGroup,
    });

    return ConversationModel
      .findById(conversation._id)
      .populate('participants', PARTICIPANT_PROJECTION)
      .lean();
  }

  // ── Update name / description / avatar (group only)
  public async update(
    id: string,
    patch: { name?: string; description?: string; avatar?: string },
  ) {
    if (!Types.ObjectId.isValid(id)) return null;
    return ConversationModel.findByIdAndUpdate(id, { $set: patch }, { new: true })
      .populate('participants', PARTICIPANT_PROJECTION)
      .lean();
  }

  // ── Delete conversation
  public async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return ConversationModel.findByIdAndDelete(id).lean();
  }

  // ── Add a participant
  public async addParticipant(conversationId: string, userId: string) {
    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(userId)) return null;
    return ConversationModel.findByIdAndUpdate(
      conversationId,
      { $addToSet: { participants: new Types.ObjectId(userId) } },
      { new: true },
    )
      .populate('participants', PARTICIPANT_PROJECTION)
      .lean();
  }

  // ── Remove a participant
  public async removeParticipant(conversationId: string, userId: string) {
    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(userId)) return null;
    return ConversationModel.findByIdAndUpdate(
      conversationId,
      { $pull: { participants: new Types.ObjectId(userId) } },
      { new: true },
    )
      .populate('participants', PARTICIPANT_PROJECTION)
      .lean();
  }

  // ── Check if a user is a participant of a conversation
  public async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(userId)) return false;
    const doc = await ConversationModel.findOne({
      _id: new Types.ObjectId(conversationId),
      participants: new Types.ObjectId(userId),
    }).lean();
    return !!doc;
  }
}
