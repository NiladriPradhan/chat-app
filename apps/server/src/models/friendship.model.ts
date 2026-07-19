import { Schema, model, Document, Types } from 'mongoose';

export interface IFriendship extends Document {
  userId: Types.ObjectId;
  friendId: Types.ObjectId;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt?: Date;
}

const FriendshipSchema = new Schema<IFriendship>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    friendId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' },
  },
  { timestamps: true },
);

FriendshipSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const FriendshipModel = model<IFriendship>('Friendship', FriendshipSchema);
