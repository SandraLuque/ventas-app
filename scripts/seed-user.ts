import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from '../src/bd/schema';
import { hashPassword } from '../src/lib/password';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function createFirstUser() {
  const password = 's&ndra3456'; // Cámbiala por seguridad
  const hashedPassword = await hashPassword(password);

  const id = crypto.randomUUID();

  await db.insert(users).values({
    id,
    name: 'Sandra',
    username: 'SandraAdmin'.toLocaleLowerCase().trim(),
    email: 'sandra@example.com',
    password: hashedPassword,
    role: 'admin',
    isActive: true,
  });

  console.log(`✅ Usuario administrador creado con ID: ${id}`);
  process.exit(0);
}

createFirstUser().catch((err) => {
  console.error('❌ Error al crear el usuario:', err);
  process.exit(1);
});
