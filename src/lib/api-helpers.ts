// 📁 src/lib/api-helpers.ts
import type { DatabaseUser } from '@/types/users';

/**
 * Utilidades para APIs
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface AuthContext {
  user: DatabaseUser;
  session: {
    id: string;
    fresh: boolean;
    expiresAt: Date;
  };
}

/**
 * Crea respuesta de API estandarizada
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
  fieldErrors?: Record<string, string[]>
): ApiResponse<T> {
  return {
    success,
    ...(data && { data }),
    ...(message && { message }),
    ...(error && { error }),
    ...(fieldErrors && { fieldErrors })
  };
}

/**
 * Valida que el request sea JSON
 */
export function validateJsonContentType(request: Request): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.includes('application/json') ?? false;
}

/**
 * Extrae IP del cliente
 */
export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

/**
 * Sanitiza datos de usuario para respuestas públicas
 */
export function sanitizeUser(user: DatabaseUser) {
  const { password, ...safeUser } = user as any;
  return safeUser;
}

/**
 * Verifica permisos de admin
 */
export function requireAdmin(user: DatabaseUser | null): user is DatabaseUser {
  return user?.role === 'admin' && user?.isActive === true;
}

/**
 * Verifica usuario autenticado
 */
export function requireAuth(user: DatabaseUser | null): user is DatabaseUser {
  return user !== null && user.isActive === true;
}