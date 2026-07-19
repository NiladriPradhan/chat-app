import { NotificationsRepository } from '../repositories/notifications.repository';

interface CreateNotificationInput {
  type: 'message' | 'friend_request' | 'friend_accepted' | 'typing' | 'system';
  title: string;
  message: string;
  relatedUserId?: string;
  relatedConversationId?: string;
}

/**
 * Contains the notification business rules.
 */
export class NotificationsService {
  constructor(private readonly notificationsRepository = new NotificationsRepository()) {}

  public async listNotifications(userId: string) {
    const notifications = await this.notificationsRepository.listByUserId(userId);
    return { notifications };
  }

  public async createNotification(userId: string, input: CreateNotificationInput) {
    const notification = await this.notificationsRepository.create(userId, input);
    return { notification };
  }

  public async markNotificationAsRead(notificationId: string) {
    const notification = await this.notificationsRepository.markAsRead(notificationId);
    return { notification };
  }
}

