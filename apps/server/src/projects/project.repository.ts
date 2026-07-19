import { pool } from "../db/client";
import { Project } from "shared";

export async function createProject(ownerId: string, name: string): Promise<Project> {
  const result = await pool.query<Project>(`
    INSERT INTO projects (owner_id, name)
    VALUES ($1, $2)
    RETURNING id, owner_id AS "ownerId", name, 
    created_at AS "createdAt", updated_at AS "updatedAt"`,
    [ownerId, name]);
  return result.rows[0];
}

export async function getProjectById(id: string): Promise<Project | null>{
  const result = await pool.query(`
    SELECT id, owner_id as "ownerId",
    name, created_at as "createdAt",
    updated_at as "updatedAt"
    FROM projects WHERE id = $1`, 
    [id]);
  return result.rows[0] ?? null;
}

export async function getProjectsByOwner(ownerId: string): Promise<Project[] | []> {
  const result = await pool.query(`
    SELECT id, owner_id as "ownerId",
    name, created_at as "createdAt", 
    updated_at as "updatedAt"
    FROM projects WHERE owner_id = $1`, 
    [ownerId]);
  return result.rows;
}

export async function updateProjectName(id: string, name: string) {
  const result = await pool.query(`
    UPDATE projects SET name = $1, updated_at = now()
    WHERE id = $2
    RETURNING id, owner_id as "ownerId", name, 
    created_at as "createdAt", updated_at AS "updatedAt"
    `, [name, id]);
    return result.rows[0];
}

export async function deleteProject(id: string): Promise<void> {
  await pool.query(`DELETE FROM projects WHERE id = $1`, [id]);
}
