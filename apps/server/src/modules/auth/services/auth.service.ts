import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { config } from '../../../config/config';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

/**
 * Contains auth business rules and orchestrates repository calls.
 */
export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  private signToken(userId: string) {
    return jwt.sign({ sub: userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
  }

  public async register(input: RegisterInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await this.authRepository.findByEmail(normalizedEmail);

    if (existing) {
      throw new Error('Email already registered');
    }

    const user = await this.authRepository.create({
      name: input.name.trim(),
      email: normalizedEmail,
      password: input.password,
    });

    return {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
      },
      token: this.signToken(String(user._id || user.id)),
    };
  }

  public async login(input: LoginInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.authRepository.findByEmailAndPassword(normalizedEmail, input.password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    return {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
      },
      token: this.signToken(String(user._id || user.id)),
    };
  }

  public async getMe(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return { user: { id: user._id || user.id, name: user.name, email: user.email } };
  }
}

