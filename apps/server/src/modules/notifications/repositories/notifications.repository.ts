import { Types } from 'mongoose';
import { NotificationModel } from '../../../models/notification.model';
import { UserModel } from '../../../models/user.model';

export class NotificationsRepository {
  public async listByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return [];
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');
    return NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  public async create(userId: string, input: { type: 'message' | 'friend_request' | 'friend_accepted' | 'typing' | 'system'; title: string; message: string; relatedUserId?: string; relatedConversationId?: string }) {
    if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const notification = await NotificationModel.create({
      userId,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedUserId: input.relatedUserId,
      relatedConversationId: input.relatedConversationId,
      isRead: false,
    });

    return notification.toObject();
  }

  public async markAsRead(notificationId: string) {
    if (!Types.ObjectId.isValid(notificationId)) return null;
    return NotificationModel.findByIdAndUpdate(notificationId, { isRead: true }, { new: true }).lean();
  }

  public async markAllAsRead(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return false;
    const result = await NotificationModel.updateMany({ userId }, { isRead: true });
    return result.modifiedCount > 0;
  }

  public async delete(notificationId: string) {
    if (!Types.ObjectId.isValid(notificationId)) return false;
    const result = await NotificationModel.findByIdAndDelete(notificationId);
    return !!result;
  }
}

