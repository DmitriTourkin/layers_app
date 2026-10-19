"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { fetchShapes } from "@/store/slices/shapesSlice";
import { Toolbar, type Tool } from "@/components/editor/Toolbar";
import { EditorCanvas } from "@/components/editor/Canvas";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { PresenceBar } from "@/components/editor/PresenceBar";
import { NavigationBar } from "@/components/common/NavigationBar";

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, initialized } = useSelector((s: RootState) => s.auth);
  const { status: shapesStatus, loadedProjectId, error: shapesError } = useSelector(
    (s: RootState) => s.shapes
  );
  const [activeTool, setActiveTool] = useState<Tool>("select");

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    } else if (user) {
      dispatch(fetchShapes(projectId));
    }
  }, [dispatch, router, initialized, user, projectId]);

  const isReady = loadedProjectId === projectId;
  const isFailed = !isReady && shapesStatus === "failed";

  return (
    <div className="min-h-screen bg-gray-950 p-6 pt-24 text-gray-100">
      <NavigationBar />
      <div className="mb-4 flex items-center justify-center gap-4">
        <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
        <PresenceBar />
      </div>

      <div className="flex justify-center gap-4">
        <LayersPanel />
        {isReady ? (
          <EditorCanvas projectId={projectId} activeTool={activeTool} />
        ) : (
          <div className="flex h-[600px] w-[1000px] items-center justify-center rounded-2xl bg-gray-900 shadow-md">
            {isFailed ? (
              <p className="text-sm text-red-400">{shapesError ?? "Не удалось загрузить фигуры"}</p>
            ) : (
              <p className="text-sm text-gray-500">Загрузка...</p>
            )}
          </div>
        )}
        <PropertiesPanel />
      </div>
    </div>
  );
}
