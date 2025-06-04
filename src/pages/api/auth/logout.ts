// 📁 src/pages/api/auth/logout.ts
import type { APIRoute } from 'astro';
import { invalidateSession } from '@/lib/auth-utils';

export const POST: APIRoute = async ({ locals, cookies }) => {
  try {
    // Verificar si hay sesión activa
    if (!locals.session) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No hay sesión activa para cerrar'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Invalidar sesión
    await invalidateSession(locals.session.id, cookies);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sesión cerrada exitosamente'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Logout error:', error);
    
    // Aunque haya error, intentamos limpiar la cookie
    try {
      const { auth } = await import('@/lib/auth');
      const sessionCookie = auth.createBlankSessionCookie();
      cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (cookieError) {
      console.error('Error clearing session cookie:', cookieError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al cerrar sesión',
        message: 'Ha ocurrido un error, pero tu sesión ha sido limpiada localmente'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
