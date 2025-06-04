// 📁 src/pages/api/auth/profile.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Obtener usuario usando la función getUser
    const user = await locals.getUser();
    
    // Verificar autenticación
    if (!locals.session || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado',
          message: 'Debes iniciar sesión para acceder a tu perfil'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Información de la sesión (basada en tu estructura actual)
    const sessionInfo = {
      userId: locals.session.userId || null,
      hasSession: !!locals.session
    };

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        session: sessionInfo,
        permissions: {
          canCreateUsers: user.role === 'admin',
          canManageProducts: user.role === 'admin',
          canViewReports: user.role === 'admin',
          canProcessSales: ['admin', 'cashier'].includes(user.role),
          canManageInventory: user.role === 'admin'
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Profile error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        message: 'Ha ocurrido un error al obtener tu perfil'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};