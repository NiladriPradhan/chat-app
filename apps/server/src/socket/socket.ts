import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { config } from '../config/config';
import { MessageModel } from '../models/message.model';
import { ConversationModel } from '../models/conversation.model';
import { UserModel } from '../models/user.model';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthenticatedSocket extends Socket {
  userId: string;
  userName: string;
}

interface SendMessagePayload {
  conversationId: string;
  content: string;
  attachments?: { fileUrl: string; fileType: string; fileName: string }[];
}

interface TypingPayload {
  conversationId: string;
}

interface MessageSeenPayload {
  messageId: string;
  conversationId: string;
}

// ── Online users registry: userId → Set of socketIds ─────────────────────────

const onlineUsers = new Map<string, Set<string>>();

function addOnlineUser(userId: string, socketId: string) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId)!.add(socketId);
}

function removeOnlineUser(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true; // went fully offline
  }
  return false;
}

function isOnline(userId: string): boolean {
  return onlineUsers.has(userId) && onlineUsers.get(userId)!.size > 0;
}

export function getOnlineUserIds(): string[] {
  return Array.from(onlineUsers.keys());
}

// ── JWT socket middleware ─────────────────────────────────────────────────────

function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('Authentication token is required'));
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as { sub: string };
    (socket as AuthenticatedSocket).userId = payload.sub;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Verify the socket user is a participant in the conversation */
async function assertParticipant(userId: string, conversationId: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(conversationId)) return false;
  const convo = await ConversationModel.findOne({
    _id: conversationId,
    participants: new Types.ObjectId(userId),
  }).lean();
  return !!convo;
}

/** Room name for a conversation */
const convoRoom = (id: string) => `conversation:${id}`;

/** Room name for a user's personal channel */
const userRoom = (id: string) => `user:${id}`;

// ── Main initialiser ──────────────────────────────────────────────────────────

export function initializeSocketIO(server: http.Server) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.allowedOrigins,
      credentials: true,
    },
    // Allow larger payloads for file attachments
    maxHttpBufferSize: 5 * 1024 * 1024, // 5 MB
  });

  // Authenticate every socket connection with JWT
  io.use(socketAuthMiddleware);

  io.on('connection', async (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { userId } = socket;

    // ── Resolve display name once ──────────────────────────────────────────
    const userDoc = await UserModel.findById(userId).select('name').lean();
    socket.userName = userDoc?.name ?? 'Unknown';

    // ── Register online presence ───────────────────────────────────────────
    addOnlineUser(userId, socket.id);
    socket.join(userRoom(userId)); // personal notification room

    console.log(`[Socket] ${socket.userName} (${userId}) connected [${socket.id}]`);

    // Notify the user's contacts that they came online.
    // We broadcast to every room the user is in (populated after join_conversation calls).
    io.emit('online_users', { onlineUserIds: getOnlineUserIds() });

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT: join_conversation
    // Client emits this to start receiving messages for a conversation.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('join_conversation', async (conversationId: string) => {
      if (!conversationId) return;

      const allowed = await assertParticipant(userId, conversationId);
      if (!allowed) {
        socket.emit('error', { event: 'join_conversation', message: 'Access denied' });
        return;
      }

      socket.join(convoRoom(conversationId));
      console.log(`[Socket] ${socket.userName} joined conversation ${conversationId}`);

      // ACK back to caller
      socket.emit('joined_conversation', { conversationId });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT: leave_conversation
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('leave_conversation', (conversationId: string) => {
      if (!conversationId) return;
      socket.leave(convoRoom(conversationId));
      socket.emit('left_conversation', { conversationId });
      console.log(`[Socket] ${socket.userName} left conversation ${conversationId}`);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT: send_message
    // Persists to DB then broadcasts receive_message to all room members.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('send_message', async (payload: SendMessagePayload) => {
      const { conversationId, content, attachments = [] } = payload;

      if (!conversationId || (!content?.trim() && attachments.length === 0)) {
        socket.emit('error', { event: 'send_message', message: 'conversationId and either content or attachments are required' });
        return;
      }

      const allowed = await assertParticipant(userId, conversationId);
      if (!allowed) {
        socket.emit('error', { event: 'send_message', message: 'Access denied' });
        return;
      }

      try {
        const message = await MessageModel.create({
          conversationId: new Types.ObjectId(conversationId),
          senderId:        new Types.ObjectId(userId),
          content:         content?.trim() || '',
          attachments,
          readBy:          [new Types.ObjectId(userId)], // sender already read it
        });

        // Touch conversation updatedAt so list re-sorts
        await ConversationModel.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        const populated = await MessageModel.findById(message._id)
          .populate('senderId', 'name email avatar')
          .lean();

        const outgoing = {
          _id:            String(message._id),
          conversationId,
          sender: {
            _id:    userId,
            name:   socket.userName,
            avatar: (populated?.senderId as any)?.avatar ?? null,
          },
          content:     message.content,
          attachments: message.attachments,
          readBy:      [userId],
          isEdited:    false,
          createdAt:   message.createdAt.toISOString(),
          updatedAt:   message.createdAt.toISOString(),
        };

        // Broadcast to everyone in the room INCLUDING the sender
        // (so their own UI gets the server-confirmed version with _id / createdAt)
        io.to(convoRoom(conversationId)).emit('receive_message', outgoing);

        // Also push to participants who are online but haven't joined this room yet
        const conversation = await ConversationModel.findById(conversationId)
          .select('participants')
          .lean();

        if (conversation) {
          for (const participantId of conversation.participants) {
            const pid = participantId.toString();
            if (pid !== userId && isOnline(pid)) {
              io.to(userRoom(pid)).emit('receive_message', outgoing);
            }
          }
        }
      } catch (err) {
        console.error('[Socket] send_message error:', err);
        socket.emit('error', { event: 'send_message', message: 'Failed to send message' });
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT: typing_start
    // Broadcasts to other participants that the user is typing.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('typing_start', (payload: TypingPayload) => {
      const { conversationId } = payload;
      if (!conversationId) return;

      // Broadcast to others in the conversation room (not back to sender)
      socket.to(convoRoom(conversationId)).emit('typing_start', {
        conversationId,
        userId,
        userName: socket.userName,
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT: typing_stop
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('typing_stop', (payload: TypingPayload) => {
      const { conversationId } = payload;
      if (!conversationId) return;

      socket.to(convoRoom(conversationId)).emit('typing_stop', {
        conversationId,
        userId,
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT: message_seen
    // Marks a message as read in DB and notifies the conversation room.
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('message_seen', async (payload: MessageSeenPayload) => {
      const { messageId, conversationId } = payload;

      if (!messageId || !conversationId) return;
      if (!Types.ObjectId.isValid(messageId)) return;

      try {
        await MessageModel.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: new Types.ObjectId(userId) },
        });

        // Notify all participants (including sender) so they can update read-receipts in UI
        io.to(convoRoom(conversationId)).emit('message_seen', {
          messageId,
          conversationId,
          seenBy: userId,
          seenAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[Socket] message_seen error:', err);
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT: get_online_users  (client can request the current list at any time)
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('get_online_users', () => {
      socket.emit('online_users', { onlineUserIds: getOnlineUserIds() });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT: disconnect
    // ─────────────────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      const wentFullyOffline = removeOnlineUser(userId, socket.id);

      if (wentFullyOffline) {
        // Broadcast updated online list to everyone
        io.emit('online_users', { onlineUserIds: getOnlineUserIds() });
        io.emit('user_offline', { userId });
        console.log(`[Socket] ${socket.userName} (${userId}) went offline — reason: ${reason}`);
      } else {
        console.log(`[Socket] ${socket.userName} (${userId}) closed one tab [${socket.id}]`);
      }
    });
  });

  return io;
}
