import type { WsEvent } from "shared";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseWsEvent(raw: unknown): WsEvent | null {
  if (typeof raw !== "string") return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isObject(data)) return null;

  switch (data.type) {
    case "presence":
      return Array.isArray(data.users) ? (data as unknown as WsEvent) : null;
    case "shape:upsert":
      return isObject(data.shape) && typeof data.shape.id === "string"
        ? (data as unknown as WsEvent)
        : null;
    case "shape:remove":
      return typeof data.id === "string" ? (data as unknown as WsEvent) : null;
    default:
      return null;
  }
}
