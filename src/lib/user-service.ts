// 📁 src/lib/user-service.ts
import { db } from '@/bd/index';
import { users } from '@/bd/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from 'lucia';
import { hashPassword } from './password';
import type { CreateUserData, DatabaseUser, AuthUser } from '@/types/users';

/**
 * Buscar usuario por username
 */
export async function findUserByUsername(username: string): Promise<AuthUser | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.username, username.toLowerCase().trim()),
        eq(users.isActive, true)
      ))
      .limit(1);
    
    return user ? {
      ...user,
      role: user.role as 'admin' | 'cashier' // Type assertion
    } : null;
  } catch (error) {
    console.error('Error finding user by username:', error);
    return null;
  }
}

/**
 * Buscar usuario por ID
 */
export async function findUserById(id: string): Promise<DatabaseUser | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, id),
        eq(users.isActive, true)
      ))
      .limit(1);
    
    return user ? {
      ...user,
      role: user.role as 'admin' | 'cashier' // Type assertion
    } : null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

/**
 * Crear nuevo usuario
 */
export async function createUser(userData: CreateUserData): Promise<DatabaseUser | null> {
  try {
    const userId = generateId(15);
    const hashedPassword = await hashPassword(userData.password);
    
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        name: userData.name,
        username: userData.username.toLowerCase().trim(),
        email: userData.email || null,
        password: hashedPassword,
        role: userData.role,
        isActive: true,
      })
      .returning();
    
    return newUser ? {
      ...newUser,
      role: newUser.role as 'admin' | 'cashier' // Type assertion
    } : null;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}