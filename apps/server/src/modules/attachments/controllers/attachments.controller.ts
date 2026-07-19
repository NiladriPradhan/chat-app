import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/response';
import { AttachmentsService } from '../services/attachments.service';

export class AttachmentsController {
  constructor(private readonly attachmentsService = new AttachmentsService()) {}

  public listAttachmentsByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const result = await this.attachmentsService.listAttachmentsByUser(userId);
      sendSuccess(res, 200, result, 'Attachments retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public listAttachmentsByConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversationId = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
      const result = await this.attachmentsService.listAttachmentsByConversation(conversationId);
      sendSuccess(res, 200, result, 'Attachments retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const file = (req as any).file;
      if (!file) throw new Error('No file provided');

      const fileUrl = `/uploads/${file.filename}`;
      const result = await this.attachmentsService.createAttachment({
        uploadedBy: userId,
        fileName: file.originalname,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        conversationId: req.body.conversationId || '',
      });

      sendSuccess(res, 201, result, 'Attachment uploaded successfully');
    } catch (error) {
      next(error);
    }
  };

  public getAttachmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const attachmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.attachmentsService.getAttachmentById(attachmentId);
      sendSuccess(res, 200, result, 'Attachment retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public deleteAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const attachmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.attachmentsService.deleteAttachment(attachmentId);
      sendSuccess(res, 200, result, 'Attachment deleted');
    } catch (error) {
      next(error);
    }
  };
}

export default new AttachmentsController();
