export type ShapeType = "rect" | "ellipse" | "line" | "text";

// Сущность в БД
export interface Shape {
  id: string;
  projectId: string;
  createdBy: string | null;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  zIndex: number;
  properties: Record<string, unknown>;
}

// То, что присылает клиент с фронта при изменении
// Без id - из JWT получаю, createdBy – чтобы никто не вставил чужой id
// Без projectId - из url получаю, без дублирования в body
export interface ShapeInput {
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fill?: string;
  zIndex?: number;
  properties?: Record<string, unknown>;
}

