// 📁 src/env.d.ts
/// <reference types="astro/client" />

import type { DatabaseUser } from "@/types/users";
import type { AuthSession } from "@/types/auth";

declare global {
  namespace App {
    interface Locals {
      // Sesión actual (puede ser null si no está autenticado)
      session: AuthSession | null;
      
      // Usuario actual (se obtiene a través de la función getUser)
      user: DatabaseUser;
      
      // ID del usuario (para compatibilidad)
      userId: string | null;
      
      // Función para obtener el usuario completo
      getUser: () => Promise<DatabaseUser | null>;
    }
  }
}

export {}