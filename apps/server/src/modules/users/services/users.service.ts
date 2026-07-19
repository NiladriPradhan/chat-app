import { UserRepository } from '../repositories/users.repository';

interface UpdateUserInput {
  name?: string;
  email?: string;
}

/**
 * Contains the user business rules.
 */
export class UserService {
  constructor(private readonly userRepository = new UserRepository()) {}

  public async listUsers() {
    const users = await this.userRepository.list();
    return { users: users.map((u) => ({ _id: u._id, id: u._id, name: u.name, email: u.email })) };
  }

  public async searchUsers(query: string, excludeId?: string) {
    if (!query || query.trim().length < 1) {
      const users = await this.userRepository.list();
      return {
        users: users
          .filter((u) => u._id.toString() !== excludeId)
          .map((u) => ({ _id: u._id, id: u._id, name: u.name, email: u.email })),
      };
    }
    const users = await this.userRepository.search(query.trim(), excludeId);
    return { users };
  }

  public async getUser(id: string) {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return { user: { id: user.id, name: user.name, email: user.email } };
  }

  public async updateUser(id: string, input: UpdateUserInput) {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (input.email) {
      user.email = input.email.trim().toLowerCase();
    }

    if (input.name) {
      user.name = input.name.trim();
    }

    await this.userRepository.ensureSettings(user.id);

    return { user: { id: user.id, name: user.name, email: user.email } };
  }
}

