import { pool } from "../db/client";
import type { Shape, ShapeInput } from "shared";

const SELECT_FIELDS = `id, project_id AS "projectId", created_by AS "createdBy", 
type, x, y, width, height, rotation, fill, z_index as "zIndex", properties`;


export async function createShape(projectId: string, createdBy: string, input: ShapeInput): Promise<Shape> {
  const result = await pool.query<Shape>(
    `INSERT INTO shapes (project_id, created_by, type, x, y, width, height, rotation,
    fill, z_index, properties)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING ${SELECT_FIELDS}`, 
    [
      projectId,
      createdBy,
      input.type,
      input.x,
      input.y,
      input.width,
      input.height,
      input.rotation ?? 0,
      input.fill ?? "#969292",
      input.zIndex ?? 0,
      input.properties ?? {},
    ]
  );
  return result.rows[0];
}

export async function getShapeById(id: string): Promise<Shape | null> {
  const result = await pool.query<Shape>(
    `SELECT ${SELECT_FIELDS} FROM shapes WHERE id = $1`, [id]
  )
  return result.rows[0] ?? null;
}

export async function getShapesByProject(projectId: string): Promise<Shape[]> {
  const result = await pool.query<Shape>(
    `SELECT ${SELECT_FIELDS} FROM shapes 
    WHERE project_id = $1 ORDER BY z_index ASC`, 
    [projectId]
  )
  return result.rows;
}

export async function updateShape(id: string, input: Partial<ShapeInput>): Promise<Shape>{
  const current = await getShapeById(id);
  if (!current) throw new Error("NOT_FOUND");

  const merged = { 
    ...current, 
    ...input 
  };

  const result = await pool.query<Shape>(
    `UPDATE shapes
    SET type = $1, x = $2, y = $3, width = $4, height = $5,
    rotation = $6, fill = $7, z_index = $8, properties = $9, updated_at = now()
    WHERE id = $10
    RETURNING ${SELECT_FIELDS}`,
    [
      merged.type,
      merged.x,
      merged.y,
      merged.width, merged.height,
      merged.rotation,
      merged.fill,
      merged.zIndex, 
      merged.properties, id
    ]
  )

  return result.rows[0];
}

export async function deleteShape(id: string): Promise<void> {
  await pool.query(`DELETE FROM shapes WHERE id = $1`, [id]);
}