// src/lib/auth.ts
import { Lucia } from 'lucia'
import  { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from '@/bd/index'
import type { DatabaseUser } from '@/types/users'
import { sessions, users } from '@/bd/schema';

// Configurar adapter
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

// Configurar Lucia
export const auth = new Lucia(adapter, {
  sessionCookie: {
    name: 'pos_auth_session',
    attributes: {
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      name: attributes.name,
      email: attributes.email,
      username: attributes.username,
      role: attributes.role,
      isActive: attributes.isActive,
    };
  },
});

// Declaración de módulos para TypeScript
declare module 'lucia' {
  interface Register {
    Lucia: typeof auth;
    DatabaseUserAttributes: DatabaseUser;
  }
}
