// src/middleware.ts
import { defineMiddleware } from 'astro/middleware'
import { auth } from '@/lib/auth'
import type { DatabaseUser } from '@/types/users'

// Configuración
const PUBLIC_ROUTES = new Set([
  '/auth/login', 
  '/api/auth/login', 
  '/auth/signup', 
  '/api/auth/signup',
  '/access-denied', // Agregar para evitar loops de redirección
  '/', // Página de inicio (opcional, dependiendo de tu app)
])

const ADMIN_ROUTES = new Set(['/admin', '/api/admin'])

// Rutas que requieren patrones más complejos
const ADMIN_ROUTE_PATTERNS = [
  /^\/admin($|\/)/,  // /admin y /admin/*
  /^\/api\/admin($|\/)/  // /api/admin y /api/admin/*
]

const ACCESS_DENIED_PATH = '/access-denied'
const LOGIN_PATH = '/auth/login'
const SESSION_RENEWAL_THRESHOLD = 60 * 60 * 24 // 1 día en segundos

// Type Guards
function isDatabaseUser(user: unknown): user is DatabaseUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'name' in user &&
    'username' in user &&
    'role' in user &&
    typeof (user as any).id === 'string' &&
    typeof (user as any).name === 'string' &&
    typeof (user as any).username === 'string' &&
    typeof (user as any).role === 'string'
  )
}

// Utilidades
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname)
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.has(pathname) || 
         ADMIN_ROUTE_PATTERNS.some(pattern => pattern.test(pathname))
}

function needsSessionRenewal(session: any): boolean {
  if (session.fresh) return true
  
  const now = new Date()
  const expiresAt = new Date(session.expiresAt)
  const secondsUntilExpiration = (expiresAt.getTime() - now.getTime()) / 1000
  
  return secondsUntilExpiration < SESSION_RENEWAL_THRESHOLD
}

function createLoginRedirect(pathname: string): string {
  return `${LOGIN_PATH}?returnTo=${encodeURIComponent(pathname)}`
}

function clearSessionCookie(cookies: any): void {
  const sessionCookie = auth.createBlankSessionCookie()
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
}

function setSessionCookie(cookies: any, sessionId: string): void {
  const sessionCookie = auth.createSessionCookie(sessionId)
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context
  const { pathname } = url

  // Permitir rutas públicas
  if (isPublicRoute(pathname)) {
    return next()
  }

  try {
    // Obtener y validar sesión
    const sessionId = cookies.get(auth.sessionCookieName)?.value

    if (!sessionId) {
      return redirect(createLoginRedirect(pathname))
    }

    const { session, user } = await auth.validateSession(sessionId)

    
    // Validar sesión y usuario
    if (!session || !isDatabaseUser(user)) {
      clearSessionCookie(cookies)
      return redirect(createLoginRedirect(pathname))
    }

    // Renovar sesión si es necesario
    if (needsSessionRenewal(session)) {
      try {
        setSessionCookie(cookies, session.id)
      } catch (renewalError) {
        console.error('Session renewal failed:', renewalError)
      }
    }

    // Asignar a locals con tipos seguros
    const typedContext = context as typeof context & {
      locals: {
        session: typeof session;
        user: DatabaseUser;
      }
    }

    typedContext.locals.session = session
    typedContext.locals.user = user
    
    // Verificar permisos de admin
    if (isAdminRoute(pathname) && user.role !== 'admin') {
      console.warn('Unauthorized admin access attempt:', { 
        userId: user.id, 
        userRole: user.role, 
        pathname 
      })
      return redirect(ACCESS_DENIED_PATH)
    }

    return next()

  } catch (error) {
    console.error('Middleware error:', {
      error: error instanceof Error ? error.message : error,
      pathname,
      timestamp: new Date().toISOString()
    })
    
    // Limpiar sesión en caso de error
    clearSessionCookie(cookies)
    return redirect(createLoginRedirect(pathname))
  }
})

// Opcional: Exportar utilidades para uso en otros archivos
export { 
  isPublicRoute, 
  isAdminRoute, 
  isDatabaseUser 
}