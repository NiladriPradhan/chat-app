import { Types } from 'mongoose';
import { AttachmentModel } from '../../../models/attachment.model';
import { UserModel } from '../../../models/user.model';

export class AttachmentsRepository {
  public async listByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return [];
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');
    return AttachmentModel.find({ uploadedBy: userId }).lean();
  }

  public async listByConversationId(conversationId: string) {
    if (!Types.ObjectId.isValid(conversationId)) return [];
    return AttachmentModel.find({ conversationId }).lean();
  }

  public async create(input: { uploadedBy: string; fileName: string; fileUrl: string; fileType: string; fileSize: number; conversationId: string; messageId?: string }) {
    if (!Types.ObjectId.isValid(input.uploadedBy) || !Types.ObjectId.isValid(input.conversationId)) {
      throw new Error('Invalid IDs');
    }

    const user = await UserModel.findById(input.uploadedBy);
    if (!user) throw new Error('User not found');

    const attachment = await AttachmentModel.create({
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSize: input.fileSize,
      uploadedBy: input.uploadedBy,
      messageId: input.messageId,
      conversationId: input.conversationId,
    });

    return attachment.toObject();
  }

  public async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return AttachmentModel.findById(id).lean();
  }

  public async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await AttachmentModel.findByIdAndDelete(id);
    return !!result;
  }
}

