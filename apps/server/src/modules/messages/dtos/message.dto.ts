// ── DTOs for the Message module ───────────────────────────────────────────────

export interface SendMessageDto {
  content?: string;
  attachments?: AttachmentDto[];
}

export interface EditMessageDto {
  content: string;
}

export interface AttachmentDto {
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export interface MarkReadDto {
  /** Mark all messages in the conversation as read up to (and including) this messageId */
  upToMessageId?: string;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface GetMessagesQuery {
  page?: number;
  limit?: number;
  /** cursor-based: return messages older than this ISO timestamp */
  before?: string;
}

// ── Response shapes ───────────────────────────────────────────────────────────

export interface SenderDto {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface MessageDto {
  _id: string;
  conversationId: string;
  sender: SenderDto;
  content: string;
  attachments: AttachmentDto[];
  readBy: string[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedMessagesDto {
  messages: MessageDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
