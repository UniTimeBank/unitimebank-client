import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserResponse } from '@/features/auth/types';

// Helper để đọc user từ localStorage
const getUserFromStorage = (): UserResponse | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Helper decode JWT để lấy expiration
function decodeJwtExp(token: string): Date | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
}

export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  refreshToken: string | null;
  pendingEmail: string | null; // Email đang chờ verify OTP
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  pendingEmail: null,
  status: 'idle',
  error: null,
};

const AUTH_LOG = '[Auth]';

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Lưu credentials sau khi login/verify thành công
    setCredentials: (state, action: PayloadAction<{ user: UserResponse; token: string; refreshToken: string }>) => {
      const { user, token, refreshToken } = action.payload;

      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.status = 'succeeded';
      state.error = null;
      state.pendingEmail = null;

      // Lưu vào localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Log expiration để debug
      const exp = decodeJwtExp(token);
      if (exp) {
        console.info(AUTH_LOG, `Credentials set — token expires at ${exp.toISOString()}`);
      }
    },

    // Đăng xuất
    logout: (state) => {
      console.warn(AUTH_LOG, 'Logout dispatched');
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.status = 'idle';
      state.error = null;
      state.pendingEmail = null;

      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },

    // Lưu email đang chờ verify OTP (sau khi register) và reset status về idle
    setPendingEmail: (state, action: PayloadAction<string>) => {
      state.pendingEmail = action.payload;
      state.status = 'idle';
      state.error = null;
    },

    // Xóa pending email
    clearPendingEmail: (state) => {
      state.pendingEmail = null;
    },

    // Reset status về idle
    setIdle: (state) => {
      state.status = 'idle';
      state.error = null;
    },

    // Set loading state
    setLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },

    // Set error state
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  logout,
  setPendingEmail,
  clearPendingEmail,
  setIdle,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.token;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectPendingEmail = (state: { auth: AuthState }) => state.auth.pendingEmail;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role || 'USER';
