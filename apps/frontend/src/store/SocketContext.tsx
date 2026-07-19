import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

export type IncomingMessage = {
  _id: string;
  conversationId: string;
  sender: { _id: string; name: string; avatar?: string };
  content: string;
  attachments: any[];
  readBy: string[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TypingEvent = {
  conversationId: string;
  userId: string;
  userName: string;
};

export type MessageSeenEvent = {
  messageId: string;
  conversationId: string;
  seenBy: string;
  seenAt: string;
};

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: string[];
  // Helpers
  joinConversation:  (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage:       (conversationId: string, content: string, attachments?: any[]) => void;
  startTyping:       (conversationId: string) => void;
  stopTyping:        (conversationId: string) => void;
  markSeen:          (messageId: string, conversationId: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUserIds: [],
  joinConversation:  () => {},
  leaveConversation: () => {},
  sendMessage:       () => {},
  startTyping:       () => {},
  stopTyping:        () => {},
  markSeen:          () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [socket, setSocket]           = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !token) {
      socket?.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUserIds([]);
      return;
    }

    const socketUrl = (import.meta.env.VITE_API_URL as string)?.replace('/api', '') || 'http://localhost:4000';

    const newSocket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      // Pass JWT in handshake so the server middleware can authenticate
      auth: { token },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] connection error:', err.message);
      setIsConnected(false);
    });

    // Track who's online
    newSocket.on('online_users', (data: { onlineUserIds: string[] }) => {
      setOnlineUserIds(data.onlineUserIds);
    });

    newSocket.on('user_offline', (data: { userId: string }) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== data.userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

  // ── Typed emit helpers ────────────────────────────────────────────────────

  const joinConversation = useCallback((conversationId: string) => {
    socket?.emit('join_conversation', conversationId);
  }, [socket]);

  const leaveConversation = useCallback((conversationId: string) => {
    socket?.emit('leave_conversation', conversationId);
  }, [socket]);

  const sendMessage = useCallback((
    conversationId: string,
    content: string,
    attachments: any[] = [],
  ) => {
    socket?.emit('send_message', { conversationId, content, attachments });
  }, [socket]);

  const startTyping = useCallback((conversationId: string) => {
    socket?.emit('typing_start', { conversationId });
  }, [socket]);

  const stopTyping = useCallback((conversationId: string) => {
    socket?.emit('typing_stop', { conversationId });
  }, [socket]);

  const markSeen = useCallback((messageId: string, conversationId: string) => {
    socket?.emit('message_seen', { messageId, conversationId });
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUserIds,
        joinConversation,
        leaveConversation,
        sendMessage,
        startTyping,
        stopTyping,
        markSeen,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
