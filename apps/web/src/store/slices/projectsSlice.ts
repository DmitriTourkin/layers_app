import { createSlice, createAsyncThunk, ActionReducerMapBuilder } from "@reduxjs/toolkit";
import type { Project } from "shared";

interface ProjectState {
  list: Project[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: ProjectState = {
  list: [],
  status: 'idle',
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchAll', async () => {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Не удалось загрузить проекты");
  return (await res.json()) as Project[];
});

export const createProject = createAsyncThunk('projects/create', async (name: string) => {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Не удалось создать проект");
  return (await res.json()) as Project;
});

function handleProjectsExtraReducers(builder: ActionReducerMapBuilder<ProjectState>) {
  builder
    .addCase(fetchProjects.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    })
    .addCase(fetchProjects.fulfilled, (state, action) => {
      state.status = 'idle';
      state.list = action.payload;
    })
    .addCase(fetchProjects.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? 'Ошибка загрузки проектов';
    })
    .addCase(createProject.fulfilled, (state, action) => {
      state.error = null;
      state.list.push(action.payload);
    })
    .addCase(createProject.rejected, (state, action) => {
      state.error = action.error.message ?? 'Ошибка создания проекта';
    });
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: handleProjectsExtraReducers,
});

export default projectsSlice.reducer;
