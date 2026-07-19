import { api } from '@/lib/api';

export const getProfile = (userId: string) =>
  api.get(`/users/${userId}`).then((r) => r.data);

export const updateProfile = (userId: string, data: { name?: string; email?: string }) =>
  api.patch(`/users/${userId}`, data).then((r) => r.data);
