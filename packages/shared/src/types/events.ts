import type { Shape } from "./shape";

export interface PresenceUser {
  id: string;
  name: string;
}

export interface PresenceEvent {
  type: "presence";
  users: PresenceUser[];
}

export interface ShapeUpsertEvent {
  type: "shape:upsert";
  shape: Shape;
}

export interface ShapeRemoveEvent {
  type: "shape:remove";
  id: string;
}

export type ShapeEvent = ShapeUpsertEvent | ShapeRemoveEvent;

export type WsEvent = PresenceEvent | ShapeEvent;
