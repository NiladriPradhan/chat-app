import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: 'message' | 'friend_request' | 'friend_accepted' | 'typing' | 'system';
  title: string;
  message: string;
  relatedUserId?: Types.ObjectId;
  relatedConversationId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['message', 'friend_request', 'friend_accepted', 'typing', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    relatedConversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const NotificationModel = model<INotification>('Notification', NotificationSchema);
