export type ShapeType = "rect" | "ellipse" | "line" | "text";

export interface Shape {
  id: string;
  projectId: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}
