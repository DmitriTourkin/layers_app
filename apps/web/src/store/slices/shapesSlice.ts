import { createSlice, createAsyncThunk, ActionReducerMapBuilder, PayloadAction } from "@reduxjs/toolkit";
import type { Shape, ShapeInput } from "shared";

interface ShapesState {
  list: Shape[];
  selectedId: string | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  currentProjectId: string | null;
  loadedProjectId: string | null;
}

const initialState: ShapesState = {
  list: [],
  selectedId: null,
  status: 'idle',
  error: null,
  currentProjectId: null,
  loadedProjectId: null,
};

export const fetchShapes = createAsyncThunk('shapes/fetchAll', async (projectId: string) => {
  const res = await fetch(`/api/projects/${projectId}/shapes`);
  if (!res.ok) throw new Error('Не удалось загрузить фигуры');
  return (await res.json()) as Shape[];
});

export const addShape = createAsyncThunk(
  'shapes/add',
  async ({ projectId, input }: { projectId: string; input: ShapeInput }) => {
    const res = await fetch(`/api/projects/${projectId}/shapes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Не удалось создать фигуру');
    return (await res.json()) as Shape;
  }
);

export const updateShape = createAsyncThunk(
  'shapes/update',
  async ({ id, input }: { id: string; input: Partial<ShapeInput> }) => {
    const res = await fetch(`/api/shapes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Не удалось обновить фигуру');
    return (await res.json()) as Shape;
  }
);

export const removeShape = createAsyncThunk('shapes/remove', async (id: string) => {
  const res = await fetch(`/api/shapes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Не удалось удалить фигуру');
  return id;
});

function handleShapesExtraReducers(builder: ActionReducerMapBuilder<ShapesState>) {
  builder
    .addCase(fetchShapes.pending, (state, action) => {
      state.status = 'loading';
      state.error = null;
      if (state.currentProjectId !== action.meta.arg) {
        state.list = [];
        state.selectedId = null;
        state.currentProjectId = action.meta.arg;
      }
    })
    .addCase(fetchShapes.fulfilled, (state, action) => {
      if (state.currentProjectId !== action.meta.arg) return;
      state.status = 'idle';
      state.list = action.payload;
      state.loadedProjectId = action.meta.arg;
    })
    .addCase(fetchShapes.rejected, (state, action) => {
      if (state.currentProjectId !== action.meta.arg) return; 
      state.status = 'failed';
      state.error = action.error.message ?? 'Ошибка загрузки фигур';
    })
    .addCase(addShape.fulfilled, (state, action) => {
      const index = state.list.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
      else state.list.push(action.payload);
    })
    .addCase(updateShape.fulfilled, (state, action) => {
      const index = state.list.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
    })
    .addCase(removeShape.fulfilled, (state, action) => {
      state.list = state.list.filter((s) => s.id !== action.payload);
      if (state.selectedId === action.payload) state.selectedId = null;
    });
}

const shapesSlice = createSlice({
  name: 'shapes',
  initialState,
  reducers: {
    setSelectedShapeId(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
    },
    shapeUpserted(state, action: PayloadAction<Shape>) {
      const index = state.list.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state.list[index] = action.payload;
      else state.list.push(action.payload);
    },
    shapeRemoved(state, action: PayloadAction<string>) {
      state.list = state.list.filter((s) => s.id !== action.payload);
      if (state.selectedId === action.payload) state.selectedId = null;
    },
  },
  extraReducers: handleShapesExtraReducers,
});

export const { setSelectedShapeId, shapeUpserted, shapeRemoved } = shapesSlice.actions;
export default shapesSlice.reducer;
