export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  participantIds: string[];
  createdAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  authorId: string;
  content: string;
}

export interface CreateConversationRequest {
  title: string;
  participantIds: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'friend_request' | 'system';
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}
