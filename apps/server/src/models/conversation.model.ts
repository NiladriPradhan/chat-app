import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  name?: string;
  description?: string;
  isGroup?: boolean;
  avatar?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    name: { type: String },
    description: { type: String },
    isGroup: { type: Boolean, default: false },
    avatar: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const ConversationModel = model<IConversation>('Conversation', ConversationSchema);
