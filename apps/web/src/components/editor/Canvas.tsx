"use client";

import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Rect, Ellipse, IText, type FabricObject } from "fabric";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { addShape, updateShape, fetchShapes, setSelectedShapeId, shapeUpserted, shapeRemoved } from "@/store/slices/shapesSlice";
import { setPresence, clearPresence } from "@/store/slices/presenceSlice";
import type { Shape, ShapeType } from "shared";
import type { Tool } from "./Toolbar";
import { parseWsEvent } from "@/utils/wsEvents";

function createFabricObject(shape: Shape): FabricObject {
  const common = {
    left: shape.x,
    top: shape.y,
    width: shape.width,
    height: shape.height,
    angle: shape.rotation,
    fill: shape.fill,
  };

  if (shape.type === "rect") return new Rect(common);
  if (shape.type === "ellipse") {
    return new Ellipse({ ...common, rx: shape.width / 2, ry: shape.height / 2 });
  }
  return new IText("Текст", { left: shape.x, top: shape.y, fill: shape.fill });
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

const EPSILON = 0.01;

function differs(a: number | undefined, b: number): boolean {
  return Math.abs((a ?? 0) - b) > EPSILON;
}

function isOutOfSync(obj: FabricObject, shape: Shape): boolean {
  if (
    differs(obj.left, shape.x) ||
    differs(obj.top, shape.y) ||
    differs(obj.angle, shape.rotation) ||
    obj.fill !== shape.fill
  ) {
    return true;
  }
  if (shape.type === "text") return false;
  return differs(obj.getScaledWidth(), shape.width) || differs(obj.getScaledHeight(), shape.height);
}

function applyShape(obj: FabricObject, shape: Shape) {
  obj.set({ left: shape.x, top: shape.y, angle: shape.rotation, fill: shape.fill });
  if (shape.type !== "text") {
    obj.set({ width: shape.width, height: shape.height, scaleX: 1, scaleY: 1 });
    if (obj instanceof Ellipse) obj.set({ rx: shape.width / 2, ry: shape.height / 2 });
  }
  obj.setCoords();
}

export function EditorCanvas({ projectId, activeTool }: { projectId: string; activeTool: Tool }) {
  const dispatch = useDispatch<AppDispatch>();
  const list = useSelector((s: RootState) => s.shapes.list);

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const objectsRef = useRef<Map<string, FabricObject>>(new Map());

  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new FabricCanvas(canvasElRef.current, {
      width: 1000,
      height: 600,
      backgroundColor: "#18181b",
    });
    fabricCanvasRef.current = canvas;

    canvas.on("mouse:down", (e) => {
      const tool = activeToolRef.current;
      if (tool === "select") return;

      const { x, y } = e.scenePoint;
      const input =
        tool === "text"
          ? { type: "text" as ShapeType, x, y, width: 120, height: 30 }
          : { type: tool as ShapeType, x, y, width: 100, height: 100 };

      dispatch(addShape({ projectId, input }));
    });

    canvas.on("object:modified", (e) => {
      const target = e.target;
      const id = [...objectsRef.current.entries()].find(([, obj]) => obj === target)?.[0];
      if (!id) return;

      dispatch(
        updateShape({
          id,
          input: {
            x: target.left ?? 0,
            y: target.top ?? 0,
            width: (target.width ?? 0) * (target.scaleX ?? 1),
            height: (target.height ?? 0) * (target.scaleY ?? 1),
            rotation: target.angle ?? 0,
          },
        })
      );
    });

    canvas.on("selection:created", (e) => {
      const id = [...objectsRef.current.entries()].find(([, obj]) => obj === e.selected[0])?.[0];
      dispatch(setSelectedShapeId(id ?? null));
    });
    canvas.on("selection:cleared", () => dispatch(setSelectedShapeId(null)));

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      objectsRef.current.clear();
    };
  }, [dispatch, projectId]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const currentIds = new Set(list.map((s) => s.id));

    for (const [id, obj] of objectsRef.current) {
      if (!currentIds.has(id)) {
        canvas.remove(obj);
        objectsRef.current.delete(id);
      }
    }

    for (const shape of list) {
      const existing = objectsRef.current.get(shape.id);
      if (!existing) {
        const obj = createFabricObject(shape);
        objectsRef.current.set(shape.id, obj);
        canvas.add(obj);
      } else if (isOutOfSync(existing, shape)) {
        applyShape(existing, shape);
      }
    }

    canvas.renderAll();
  }, [list]);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let unmounted = false;
    let hasConnectedBefore = false;

    function connect() {
      ws = new WebSocket(`${WS_URL}?projectId=${projectId}`);

      ws.onopen = () => {
        if (hasConnectedBefore) dispatch(fetchShapes(projectId));
        hasConnectedBefore = true;
      };

      ws.onmessage = (event) => {
        const data = parseWsEvent(event.data);
        if (!data) return;

        switch (data.type) {
          case "presence":
            dispatch(setPresence(data.users));
            break;
          case "shape:upsert":
            dispatch(shapeUpserted(data.shape));
            break;
          case "shape:remove":
            dispatch(shapeRemoved(data.id));
            break;
        }
      };

      ws.onclose = () => {
        if (unmounted) return;
        reconnectTimer = setTimeout(connect, 1000);
      };
    }

    connect();

    return () => {
      unmounted = true;
      clearTimeout(reconnectTimer);
      ws.close();
      dispatch(clearPresence());
    };
  }, [dispatch, projectId]);

  return <canvas ref={canvasElRef} className="rounded-2xl shadow-md" />;
}
