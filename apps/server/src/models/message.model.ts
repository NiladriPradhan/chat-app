import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  attachments?: { fileUrl: string; fileType: string; fileName: string }[];
  readBy?: Types.ObjectId[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    attachments: [
      {
        fileUrl: { type: String },
        fileType: { type: String },
        fileName: { type: String },
      },
    ],
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

export const MessageModel = model<IMessage>('Message', MessageSchema);
