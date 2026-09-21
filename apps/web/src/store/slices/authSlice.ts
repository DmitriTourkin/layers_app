import { createSlice, createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { PublicUser } from 'shared';

interface AuthState {
  user: PublicUser | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  initialized: false,
};

export const login = createAsyncThunk('auth/login', async (credentials: { email: string; password: string}) => {
  const res = await fetch('/api/auth/login', {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify(credentials)
  });

  if (!res.ok) throw new Error("Неверный email или пароль");
  const data = await res.json();
  return data.user as PublicUser;
});

export const register = createAsyncThunk('auth/register', async (data: { email: string; password: string; name: string}) => {
  const res = await fetch('/api/auth/register', {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Не удалось зарегистрировать пользователя");
  return (await res.json()) as PublicUser;
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async () => {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error("UNAUTHORIZED");
  return (await res.json()) as PublicUser;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
});

function handleAuthExtraReducers(builder: ActionReducerMapBuilder<AuthState>) {
  builder
  .addCase(login.pending , (state) => {
    state.status = 'loading';
    state.error = null
  })
  .addCase(login.fulfilled, (state, action) => {
    state.status = 'idle';
    state.user = action.payload
  })
  .addCase(login.rejected, (state, action) => {
    state.status = 'failed';
    state.error = action.error.message ?? "Ошибка входа"
  })
  .addCase(register.pending , (state) => {
    state.status = 'loading';
    state.error = null;
  })
  .addCase(register.fulfilled , (state, action) => {
    state.status = 'idle';
    state.user = action.payload
  })
  .addCase(register.rejected , (state, action) => {
    state.status = 'failed';
    state.error = action.error.message ?? "Ошибка регистрации аккаунта";
  })
  .addCase(fetchCurrentUser.fulfilled, (state, action) => {
    state.user = action.payload;
    state.initialized = true;
  })
  .addCase(fetchCurrentUser.rejected, (state) => {
    state.user = null;
    state.initialized = true;
  })
  .addCase(logout.fulfilled, (state) => {
    state.user = null;
    state.status = 'idle';
    state.error = null;
  })
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: handleAuthExtraReducers
})

export default authSlice.reducer;
