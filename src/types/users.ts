//src\types\users.ts
export interface DatabaseUser {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: 'admin' | 'cashier';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthUser = DatabaseUser & {
  password: string;
};

export type SessionUser = Pick<DatabaseUser, 'id' | 'name' | 'username' | 'role' | 'email' | 'isActive'>;

export interface CreateUserData {
  name: string;
  username: string;
  email?: string;
  password: string;
  role: 'admin' | 'cashier';
}