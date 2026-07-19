import { createId, settings, users } from '../../../utils/inMemoryStore';

/**
 * Handles settings data access using the in-memory store.
 */
export class SettingsRepository {
  public async getByUserId(userId: string) {
    const user = users.find((item) => item.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const current = settings.find((item) => item.userId === userId);
    if (!current) {
      throw new Error('Settings not found');
    }

    return current;
  }

  public async updateOrCreate(userId: string, preferences: Record<string, unknown>) {
    const user = users.find((item) => item.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    let current = settings.find((item) => item.userId === userId);
    if (!current) {
      current = {
        id: createId('setting'),
        userId,
        preferences,
        createdAt: new Date().toISOString(),
      };
      settings.push(current);
      return current;
    }

    current.preferences = { ...current.preferences, ...preferences };
    return current;
  }
}

