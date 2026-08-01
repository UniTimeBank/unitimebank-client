// Auth response
import type { UserResponse } from './user-response.type';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser?: boolean;
  user: UserResponse;
}
