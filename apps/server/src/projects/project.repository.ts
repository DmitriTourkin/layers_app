import { pool } from "../db/client";
import type { Project, ProjectMember, ProjectRole } from "shared";

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

export async function getProjectsForUser(userId: string): Promise<Project[]> {
  const result = await pool.query(`
    SELECT p.id, p.owner_id AS "ownerId",
    p.name, p.created_at AS "createdAt",
    p.updated_at AS "updatedAt"
    FROM projects p
    WHERE p.owner_id = $1
    OR EXISTS (
      SELECT 1 FROM project_members m
      WHERE m.project_id = p.id AND m.user_id = $1
    )`,
    [userId]);
  return result.rows;
}

export async function isMember(projectId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]);
  return result.rows.length > 0;
}

export async function addMember(projectId: string, userId: string, role: ProjectRole): Promise<void> {
  await pool.query(`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (project_id, user_id) DO NOTHING`,
    [projectId, userId, role]);
}

export async function getMembers(projectId: string): Promise<ProjectMember[]> {
  const result = await pool.query<ProjectMember>(`
    SELECT u.id, u.name, u.email, m.role
    FROM project_members m
    JOIN users u ON u.id = m.user_id
    WHERE m.project_id = $1
    ORDER BY m.invited_at`,
    [projectId]);
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
