import { UserModel, IUser } from '../../../models/user.model';
import { Types } from 'mongoose';

export class UserRepository {
  public async list() {
    return UserModel.find().select('-password').lean();
  }

  public async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return UserModel.findById(id).select('-password').lean();
  }

  public async search(query: string, excludeId?: string) {
    const regex = new RegExp(query, 'i');
    const filter: any = {
      $or: [{ name: regex }, { email: regex }],
    };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return UserModel.find(filter).select('name email avatar').limit(20).lean();
  }

  public async ensureSettings(_userId: string) {
    return { preferences: {} };
  }
}

