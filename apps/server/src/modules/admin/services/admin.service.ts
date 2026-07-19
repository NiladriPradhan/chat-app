import { AdminRepository } from '../repositories/admin.repository';

/**
 * Contains the admin business rules.
 */
export class AdminService {
  constructor(private readonly adminRepository = new AdminRepository()) {}

  public async getStats() {
    return this.adminRepository.getStats();
  }

  public async listUsers() {
    return { users: await this.adminRepository.listUsers() };
  }

  public async deleteUser(id: string) {
    const user = await this.adminRepository.deleteUser(id);
    return { user };
  }

  public async listConversations() {
    return { conversations: await this.adminRepository.listConversations() };
  }

  public async deleteConversation(id: string) {
    const conversation = await this.adminRepository.deleteConversation(id);
    return { conversation };
  }
}

