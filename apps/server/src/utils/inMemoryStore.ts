export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  participantIds: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'friend_request' | 'system';
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Setting {
  id: string;
  userId: string;
  preferences: Record<string, unknown>;
  createdAt: string;
}

export interface Attachment {
  id: string;
  userId: string;
  filename: string;
  url: string;
  createdAt: string;
}

const now = () => new Date().toISOString();

export const users: User[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@chat.app',
    password: 'password',
    createdAt: now(),
  },
];

export const conversations: Conversation[] = [
  {
    id: '1',
    title: 'General Chat',
    participantIds: ['1'],
    createdAt: now(),
  },
];

export const messages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    authorId: '1',
    content: 'Welcome to the chat backend!',
    createdAt: now(),
  },
];

export const friendships: Friendship[] = [];
export const notifications: Notification[] = [];
export const settings: Setting[] = [
  {
    id: '1',
    userId: '1',
    preferences: { theme: 'light', notifications: true },
    createdAt: now(),
  },
];
export const attachments: Attachment[] = [];

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
