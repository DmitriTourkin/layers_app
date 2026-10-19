import { WebSocketServer, WebSocket } from "ws";
import { Redis } from "ioredis";
import type { Server } from "http";
import { verifyToken } from "./auth/auth.service";
import { assertProjectAccess } from "./projects/project.service";
import * as userRepository from "./auth/user.repository";
import type { PresenceEvent, PresenceUser, ShapeEvent } from "shared";

interface TrackedSocket extends WebSocket {
  isAlive?: boolean;
}

const SHAPE_EVENTS_CHANNEL = "shape-events";

const rooms = new Map<string, Map<WebSocket, PresenceUser>>();
let publisher: Redis | null = null;

function parseCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  const found = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

function broadcastPresence(projectId: string) {
  const room = rooms.get(projectId);
  if (!room) return;

  const uniqueUsers = new Map<string, PresenceUser>();
  for (const user of room.values()) {
    uniqueUsers.set(user.id, user);
  }

  const event: PresenceEvent = { type: "presence", users: [...uniqueUsers.values()] };
  const message = JSON.stringify(event);
  for (const client of room.keys()) {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  }
}

function deliverToRoom(projectId: string, event: ShapeEvent) {
  const room = rooms.get(projectId);
  if (!room) return;

  const message = JSON.stringify(event);
  for (const client of room.keys()) {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  }
}

export function broadcastShapeEvent(projectId: string, event: ShapeEvent) {
  if (!publisher) {
    deliverToRoom(projectId, event);
    return;
  }

  publisher
    .publish(SHAPE_EVENTS_CHANNEL, JSON.stringify({ projectId, event }))
    .catch(() => deliverToRoom(projectId, event));
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  publisher = new Redis(redisUrl, { enableOfflineQueue: false });
  const subscriber = new Redis(redisUrl);

  publisher.on("error", (err) => console.error("redis publisher:", err.message));
  subscriber.on("error", (err) => console.error("redis subscriber:", err.message));

  subscriber.subscribe(SHAPE_EVENTS_CHANNEL);
  subscriber.on("message", (_channel, raw) => {
    try {
      const { projectId, event } = JSON.parse(raw) as { projectId: string; event: ShapeEvent };
      deliverToRoom(projectId, event);
    } catch {}
  });

  wss.on("connection", async (ws: TrackedSocket, req) => {
    const url = new URL(req.url ?? "", "http://localhost");
    const projectId = url.searchParams.get("projectId");
    const token = parseCookie(req.headers.cookie, "token");

    let closedEarly = false;
    ws.on("close", () => {
      closedEarly = true;
      if (projectId) {
        rooms.get(projectId)?.delete(ws);
        broadcastPresence(projectId);
      }
    });

    if (!projectId || !token) {
      ws.close();
      return;
    }

    let userId: string;
    try {
      ({ userId } = verifyToken(token));
      await assertProjectAccess(projectId, userId);
    } catch {
      ws.close();
      return;
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      ws.close();
      return;
    }

    if (closedEarly || ws.readyState !== WebSocket.OPEN) return;

    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    if (!rooms.has(projectId)) rooms.set(projectId, new Map());
    rooms.get(projectId)!.set(ws, { id: user.id, name: user.name });
    broadcastPresence(projectId);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      const ws = client as TrackedSocket;
      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
    publisher?.disconnect();
    subscriber.disconnect();
    publisher = null;
  });
}
