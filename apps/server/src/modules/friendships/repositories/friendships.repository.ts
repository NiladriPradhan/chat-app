import { Types } from 'mongoose';
import { FriendshipModel } from '../../../models/friendship.model';
import { UserModel } from '../../../models/user.model';

export class FriendshipsRepository {
  public async listByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return [];
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');
    return FriendshipModel.find({
      $or: [{ userId }, { friendId: userId }],
    })
      .populate('userId friendId', 'name email avatar')
      .lean();
  }

  public async findRequest(userId: string, friendId: string) {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(friendId)) return null;
    return FriendshipModel.findOne({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    }).lean();
  }

  public async createRequest(input: { userId: string; friendId: string }) {
    if (!Types.ObjectId.isValid(input.userId) || !Types.ObjectId.isValid(input.friendId)) {
      throw new Error('Invalid user IDs');
    }

    const requester = await UserModel.findById(input.userId);
    const target = await UserModel.findById(input.friendId);
    if (!requester || !target) throw new Error('User or friend not found');

    const existing = await this.findRequest(input.userId, input.friendId);
    if (existing) throw new Error('Friendship already exists');

    const friendship = await FriendshipModel.create({
      userId: input.userId,
      friendId: input.friendId,
      status: 'pending',
    });

    return friendship.toObject();
  }

  public async acceptRequest(requestId: string) {
    if (!Types.ObjectId.isValid(requestId)) return null;
    return FriendshipModel.findByIdAndUpdate(requestId, { status: 'accepted' }, { new: true }).lean();
  }

  public async rejectRequest(requestId: string) {
    if (!Types.ObjectId.isValid(requestId)) return false;
    const result = await FriendshipModel.findByIdAndDelete(requestId);
    return !!result;
  }

  public async unfriend(userId: string, friendId: string) {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(friendId)) return false;
    const result = await FriendshipModel.deleteOne({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    });
    return result.deletedCount > 0;
  }
}

