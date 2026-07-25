import { createSlice, createAsyncThunk, ActionReducerMapBuilder, Action} from '@reduxjs/toolkit';
import type { PublicUser } from 'shared';

interface AuthState {
  user: PublicUser | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null
};

export const login = createAsyncThunk('auth/login', async (credentials: { login: string; password: string}) => {
  const res = await fetch('/api/auth/login', {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify(credentials)
  });

  if (!res.ok) throw new Error("Невереный email или пароль");
  return (await res.json()) as PublicUser;
});

export const register = createAsyncThunk('auth/register', async (data: {email: string; password: string; name: string}) => {
  const res = await fetch('api/auth/register', {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Не удалеть зарегистрировать пользователя");
  return (await res.json()) as PublicUser;
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
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
    },
  },
  extraReducers: handleAuthExtraReducers
})

export const { logout } = authSlice.actions;
export default authSlice.reducer;