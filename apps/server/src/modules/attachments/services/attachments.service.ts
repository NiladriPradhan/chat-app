import { AttachmentsRepository } from '../repositories/attachments.repository';

interface CreateAttachmentInput {
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  conversationId: string;
  messageId?: string;
}

export class AttachmentsService {
  constructor(private readonly attachmentsRepository = new AttachmentsRepository()) {}

  public async listAttachmentsByUser(userId: string) {
    const attachments = await this.attachmentsRepository.listByUserId(userId);
    return { attachments };
  }

  public async listAttachmentsByConversation(conversationId: string) {
    const attachments = await this.attachmentsRepository.listByConversationId(conversationId);
    return { attachments };
  }

  public async createAttachment(input: CreateAttachmentInput) {
    const attachment = await this.attachmentsRepository.create(input);
    return { attachment };
  }

  public async getAttachmentById(id: string) {
    const attachment = await this.attachmentsRepository.getById(id);
    if (!attachment) throw new Error('Attachment not found');
    return { attachment };
  }

  public async deleteAttachment(id: string) {
    const deleted = await this.attachmentsRepository.delete(id);
    if (!deleted) throw new Error('Attachment not found');
    return { success: true };
  }
}

