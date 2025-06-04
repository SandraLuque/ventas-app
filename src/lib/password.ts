// 📁 src/lib/password.ts
import { hash, verify } from '@node-rs/argon2';

const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

/**
 * Hash de contraseña usando Argon2
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, HASH_OPTIONS);
}

/**
 * Verificar contraseña
 */
export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
  try {
    return await verify(hashedPassword, password, HASH_OPTIONS);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}