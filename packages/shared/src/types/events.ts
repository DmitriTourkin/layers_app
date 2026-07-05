import type { Shape } from "./shape";

export interface ShapeCreatedEvent {
  type: "shape:created";
  payload: Shape;
}

export interface ShapeMovedEvent {
  type: "shape:moved";
  payload: { id: string; x: number; y: number };
}

export type WsEvent = ShapeCreatedEvent | ShapeMovedEvent;
