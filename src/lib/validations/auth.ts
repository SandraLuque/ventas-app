// 📁 src/lib/validations/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string()
    .min(1, 'El nombre de usuario es requerido')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional().default(false)
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos')
    .trim()
    .toLowerCase(),
  email: z.string()
    .email('Email inválido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'cashier'], {
    errorMap: () => ({ message: 'El rol debe ser admin o cashier' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;