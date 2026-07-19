import AuthControllerDefault, { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';

export const authController = AuthControllerDefault;
export { AuthController, AuthService, AuthRepository };
