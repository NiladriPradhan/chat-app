import bcrypt from 'bcrypt';
import { UserModel } from '../../../models/user.model';

export class AuthRepository {
  public async findByEmail(email: string) {
    return UserModel.findOne({ email }).lean();
  }

  public async findByEmailAndPassword(email: string, password: string) {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
  }

  public async findById(id: string) {
    return UserModel.findById(id).lean();
  }

  public async create(input: { name: string; email: string; password: string }) {
    const hashed = await bcrypt.hash(input.password, 10);
    const created = await UserModel.create({ name: input.name, email: input.email, password: hashed });
    return created.toObject();
  }
}

