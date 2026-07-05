import { pool } from '../db/client';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query(`
    SELECT id, email, password_hash AS "passwordHash",
    name, created_at AS "createdAt"
    FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(`
    SELECT id, email, password_hash AS "passwordHash", 
    name, created_at AS "createdAt"
    FROM users WHERE email = $1`, [email]);
  return result.rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string, name: string): Promise<User> {
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, password_hash AS "passwordHash", name, created_at AS "createdAt"`,
      [email, passwordHash, name]
    );
    return result.rows[0];
}