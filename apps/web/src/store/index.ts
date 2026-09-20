import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import shapesReducer from './slices/shapesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    shapes: shapesReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;