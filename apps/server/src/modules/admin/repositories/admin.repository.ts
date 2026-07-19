import { attachments, conversations, friendships, messages, notifications, settings, users } from '../../../utils/inMemoryStore';

/**
 * Handles admin data access using the in-memory store.
 */
export class AdminRepository {
  public async getStats() {
    return {
      totalUsers: users.length,
      totalConversations: conversations.length,
      totalMessages: messages.length,
      totalFriendships: friendships.length,
      totalNotifications: notifications.length,
      totalAttachments: attachments.length,
      totalSettings: settings.length,
    };
  }

  public async listUsers() {
    return users.map((user) => ({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }));
  }

  public async deleteUser(id: string) {
    const index = users.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    const [deleted] = users.splice(index, 1);
    return deleted;
  }

  public async listConversations() {
    return conversations;
  }

  public async deleteConversation(id: string) {
    const index = conversations.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Conversation not found');
    }

    const [deleted] = conversations.splice(index, 1);
    return deleted;
  }
}

