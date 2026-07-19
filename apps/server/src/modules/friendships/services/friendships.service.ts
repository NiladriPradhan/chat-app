import { FriendshipsRepository } from '../repositories/friendships.repository';

interface CreateFriendRequestInput {
  userId: string;
  friendId: string;
}

/**
 * Contains the friendship business rules.
 */
export class FriendshipsService {
  constructor(private readonly friendshipsRepository = new FriendshipsRepository()) {}

  public async listFriendships(userId: string) {
    const friendships = await this.friendshipsRepository.listByUserId(userId);
    return { friendships };
  }

  public async createFriendRequest(input: CreateFriendRequestInput) {
    const friendship = await this.friendshipsRepository.createRequest(input);
    return { friendship };
  }
}

