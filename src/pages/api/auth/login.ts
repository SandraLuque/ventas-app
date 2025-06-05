// 📁 src/pages/api/auth/login.ts
import type { APIRoute } from 'astro';
import { loginSchema } from '@/lib/validations/auth';
import { findUserByUsername } from '@/lib/user-service';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/auth-utils';
import { loginRateLimiter } from '@/lib/rate-limiter';

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  try {
    // Verificar rate limiting
    const clientIp = clientAddress || 'unknown';
    
    if (loginRateLimiter.isBlocked(clientIp)) {
      const timeRemaining = Math.ceil(loginRateLimiter.getBlockTimeRemaining(clientIp) / 1000 / 60);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Demasiados intentos fallidos',
          message: `Cuenta bloqueada. Intenta nuevamente en ${timeRemaining} minutos.`,
          blockedUntil: Date.now() + loginRateLimiter.getBlockTimeRemaining(clientIp)
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content-Type debe ser application/json'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parsear y validar datos
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      // Registrar intento fallido por validación
      loginRateLimiter.recordAttempt(clientIp, false);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Datos de entrada inválidos',
          fieldErrors: validationResult.error.flatten().fieldErrors
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { username, password, rememberMe } = validationResult.data;

    // Buscar usuario
    const user = await findUserByUsername(username);
    console.log(`Intento de inicio de sesión para usuario: ${user} desde IP: ${clientIp}`);
    if (!user) {
      loginRateLimiter.recordAttempt(clientIp, false);
      console.log(`Usuario no encontrado: ${username}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciales inválidas',
          message: 'Nombre de usuario o contraseña incorrectos'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar contraseña
    const passwordValid = await verifyPassword(user.password, password);
    
    if (!passwordValid) {
      loginRateLimiter.recordAttempt(clientIp, false);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciales inválidas',
          message: 'Nombre de usuario o contraseña incorrectos'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      loginRateLimiter.recordAttempt(clientIp, false);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cuenta desactivada',
          message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Crear sesión
    const sessionId = await createSession(user.id, cookies);
    
    // Registrar intento exitoso
    loginRateLimiter.recordAttempt(clientIp, true);

    // Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        },
        sessionId,
        rememberMe
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        message: 'Ha ocurrido un error inesperado. Intenta nuevamente.'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};