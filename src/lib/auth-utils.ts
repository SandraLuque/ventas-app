// 📁 src/lib/auth-utils.ts
import { auth } from './auth';
import type { AstroCookies } from 'astro';
import type { SessionUser } from '@/types/users';
import { findUserById } from './user-service';

export interface AuthResult {
  user: SessionUser | null;
  session: any | null;
}

/**
 * Valida la sesión actual del usuario
 */
export async function validateSession(cookies: AstroCookies): Promise<AuthResult> {
  const sessionId = cookies.get(auth.sessionCookieName)?.value ?? null;
  
  if (sessionId) {
    const user = await findUserById(sessionId);
    return { user, session: { id: sessionId, fresh: true } };
  }

  if (!sessionId) {
    return { user: null, session: null };
  }

  try {
    const result = await auth.validateSession(sessionId);
    
    if (result.session && result.session.fresh) {
      const sessionCookie = auth.createSessionCookie(result.session.id);
      cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    
    if (!result.session) {
      const sessionCookie = auth.createBlankSessionCookie();
      cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    return {
      user: result.user,
      session: result.session,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    const sessionCookie = auth.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return { user: null, session: null };
  }
}

/**
 * Invalida la sesión actual
 */
export async function invalidateSession(sessionId: string, cookies: AstroCookies): Promise<void> {
  try {
    await auth.invalidateSession(sessionId);
  } catch (error) {
    console.error('Error invalidating session:', error);
  } finally {
    const sessionCookie = auth.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }
}

/**
 * Crea una nueva sesión para el usuario
 */
export async function createSession(userId: string, cookies: AstroCookies): Promise<string> {
  const session = await auth.createSession(userId, {});
  const sessionCookie = auth.createSessionCookie(session.id);
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return session.id;
}

/**
 * Verifica si el usuario tiene el rol requerido
 */
export function hasRole(user: SessionUser | null, requiredRole: string): boolean {
  return user?.role === requiredRole;
}

/**
 * Verifica si el usuario es admin
 */
export function isAdmin(user: SessionUser | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Verifica si el usuario es cajero
 */
export function isCashier(user: SessionUser | null): boolean {
  return hasRole(user, 'cashier');
}