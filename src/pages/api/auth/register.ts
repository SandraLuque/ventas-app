// 📁 src/pages/api/auth/register.ts
import type { APIRoute } from 'astro';
import { registerSchema } from '@/lib/validations/auth';
import { createUser, findUserByUsername } from '@/lib/user-service';
import type { DatabaseUser } from '@/types/users';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Obtener usuario usando la función getUser
    const user = await locals.getUser();
    
    // Verificar autenticación
    if (!locals.session || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado',
          message: 'Debes iniciar sesión para acceder a esta función'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar que sea admin
    if (user.role !== 'admin') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Acceso denegado',
          message: 'Solo los administradores pueden registrar nuevos usuarios'
        }),
        { 
          status: 403,
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
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
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

    const { name, username, email, password, role } = validationResult.data;

    // Verificar si el usuario ya existe
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuario ya existe',
          message: 'Ya existe un usuario con ese nombre de usuario',
          fieldErrors: {
            username: ['Este nombre de usuario ya está en uso']
          }
        }),
        { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Crear usuario
    const newUser = await createUser({
      name,
      username,
      email: email || undefined,
      password,
      role
    });

    if (!newUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error al crear usuario',
          message: 'No se pudo crear el usuario. Intenta nuevamente.'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Respuesta exitosa (sin incluir password)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt
        },
        createdBy: {
          id: user.id,
          username: user.username
        }
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Register error:', error);
    
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