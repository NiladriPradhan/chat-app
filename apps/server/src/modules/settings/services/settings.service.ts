import { SettingsRepository } from '../repositories/settings.repository';

interface UpdateSettingsInput {
  preferences?: Record<string, unknown>;
}

/**
 * Contains the settings business rules.
 */
export class SettingsService {
  constructor(private readonly settingsRepository = new SettingsRepository()) {}

  public async getSettings(userId: string) {
    const settings = await this.settingsRepository.getByUserId(userId);
    return { settings };
  }

  public async updateSettings(userId: string, input: UpdateSettingsInput) {
    const settings = await this.settingsRepository.updateOrCreate(userId, input.preferences || {});
    return { settings };
  }
}

