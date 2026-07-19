// ── DTOs (Data Transfer Objects) for the Conversation module ─────────────────

export interface CreateDirectConversationDto {
  participantId: string; // the other user's ID
}

export interface CreateGroupConversationDto {
  participantIds: string[];
  name: string;
  description?: string;
  avatar?: string;
}

export interface UpdateConversationDto {
  name?: string;
  description?: string;
  avatar?: string;
}

export interface AddParticipantDto {
  userId: string;
}

export interface RemoveParticipantDto {
  userId: string;
}

// ── Response Shape ────────────────────────────────────────────────────────────

export interface ParticipantDto {
  _id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface ConversationDto {
  _id: string;
  participants: ParticipantDto[];
  name?: string;
  description?: string;
  isGroup: boolean;
  avatar?: string;
  createdBy: string;
  lastMessage?: {
    _id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
