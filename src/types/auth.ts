//src\types\auth.ts
import type { CreateUserData } from "./users";

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  fresh: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData extends CreateUserData {}