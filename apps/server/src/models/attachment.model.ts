import { Schema, model, Document, Types } from 'mongoose';

export interface IAttachment extends Document {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: Types.ObjectId;
  messageId?: Types.ObjectId;
  conversationId: Types.ObjectId;
  createdAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  },
  { timestamps: true },
);

export const AttachmentModel = model<IAttachment>('Attachment', AttachmentSchema);
