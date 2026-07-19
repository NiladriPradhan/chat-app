import { api } from '@/lib/api';

// ── Conversations ─────────────────────────────────────────────────────────────

export const getConversations = () =>
  api.get('/conversations').then((r) => r.data);

export const createDirectConversation = (participantId: string) =>
  api.post('/conversations/direct', { participantId }).then((r) => r.data);

export const createGroupConversation = (data: {
  participantIds: string[];
  name: string;
  description?: string;
}) => api.post('/conversations/group', data).then((r) => r.data);

export const getConversation = (id: string) =>
  api.get(`/conversations/${id}`).then((r) => r.data);

export const updateConversation = (id: string, data: { name?: string; description?: string }) =>
  api.patch(`/conversations/${id}`, data).then((r) => r.data);

export const deleteConversation = (id: string) =>
  api.delete(`/conversations/${id}`).then((r) => r.data);

// ── Messages ──────────────────────────────────────────────────────────────────

export const getMessages = (conversationId: string, params?: { page?: number; limit?: number }) =>
  api
    .get(`/conversations/${conversationId}/messages`, { params })
    .then((r) => r.data);

export const sendMessage = (conversationId: string, data: { content: string; attachments?: any[] }) =>
  api.post(`/conversations/${conversationId}/messages`, data).then((r) => r.data);

export const editMessage = (conversationId: string, messageId: string, content: string) =>
  api.patch(`/conversations/${conversationId}/messages/${messageId}`, { content }).then((r) => r.data);

export const deleteMessage = (conversationId: string, messageId: string) =>
  api.delete(`/conversations/${conversationId}/messages/${messageId}`).then((r) => r.data);

export const markMessageAsRead = (conversationId: string, messageId: string) =>
  api.post(`/conversations/${conversationId}/messages/${messageId}/read`).then((r) => r.data);

export const markAllAsRead = (conversationId: string) =>
  api.post(`/conversations/${conversationId}/messages/read-all`).then((r) => r.data);

// ── Users ─────────────────────────────────────────────────────────────────────

export const searchUsers = (query: string) =>
  api.get(`/users/search?q=${encodeURIComponent(query)}`).then((r) => r.data);

// ── Attachments ───────────────────────────────────────────────────────────────

export const uploadAttachment = (conversationId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('conversationId', conversationId);
  return api.post('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};
