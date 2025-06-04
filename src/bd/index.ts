//src\bd\index.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from "pg";
import * as schema from './schema';

const pool = new pg.Pool({
  connectionString: import.meta.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
