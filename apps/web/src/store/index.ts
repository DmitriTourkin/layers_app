import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import shapesReducer from './slices/shapesSlice';
import presenceReducer from './slices/presenceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    shapes: shapesReducer,
    presence: presenceReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;