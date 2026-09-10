import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { auth } from '../services/api';

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string | null;
}

interface AuthState {
  token: string | null;
  user: CurrentUser | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('access_token'),
  user: null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await auth.login(email, password);
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    const me = await auth.me();
    return { token: access_token, user: me.data as CurrentUser };
  },
);

export const fetchCurrentUser = createAsyncThunk('auth/me', async () => {
  const response = await auth.me();
  return response.data as CurrentUser;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('access_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: CurrentUser }>) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
