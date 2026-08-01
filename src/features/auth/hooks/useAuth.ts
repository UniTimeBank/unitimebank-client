import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks';
import { authApi } from '@/core/api/auth';
import {
  setCredentials,
  logout as logoutAction,
  setPendingEmail,
  setLoading,
  setError,
  selectAuthStatus,
  selectAuthError,
  selectPendingEmail,
} from '@/core/store';
import type {
  OtpPurpose,
  AuthOperationResult,
  ApiErrorResponse,
  RegisterResponse,
  AuthResponse,
} from '../types';

// Helper trích xuất message từ ApiErrorResponse
const extractErrorMessage = (err: unknown, defaultMsg: string): string => {
  const errorObj = err as ApiErrorResponse;
  return errorObj?.data?.message || errorObj?.message || defaultMsg;
};

// Hook chính quản lý Authentication
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const pendingEmail = useAppSelector(selectPendingEmail);

  // RTK Query mutations
  const [registerMutation] = authApi.useRegisterMutation();
  const [loginMutation] = authApi.useLoginMutation();
  const [googleLoginMutation] = authApi.useGoogleLoginMutation();
  const [verifyOtpMutation] = authApi.useVerifyOtpMutation();
  const [setPasswordMutation] = authApi.useSetPasswordMutation();
  const [logoutMutation] = authApi.useLogoutMutation();

  // Register - Đăng ký tài khoản
  const register = useCallback(
    async (email: string, password: string): Promise<AuthOperationResult<RegisterResponse>> => {
      dispatch(setLoading());
      try {
        const result = await registerMutation({ email, password }).unwrap();
        dispatch(setPendingEmail(email));
        return { success: true, data: result };
      } catch (err: unknown) {
        const message = extractErrorMessage(err, 'Đăng ký thất bại');
        dispatch(setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch, registerMutation]
  );

  // Verify OTP - Xác thực OTP
  const verifyOtp = useCallback(
    async (
      email: string,
      code: string,
      purpose: OtpPurpose = 'REGISTER'
    ): Promise<AuthOperationResult<AuthResponse>> => {
      dispatch(setLoading());
      try {
        const result = await verifyOtpMutation({ email, code, purpose }).unwrap();
        if (!result || !result.accessToken || !result.user) {
          const message = (result as ApiErrorResponse)?.message || 'Xác thực OTP thất bại';
          dispatch(setError(message));
          return { success: false, error: message };
        }
        dispatch(setCredentials({
          user: result.user,
          token: result.accessToken,
          refreshToken: result.refreshToken,
        }));
        return { success: true, data: result };
      } catch (err: unknown) {
        const message = extractErrorMessage(err, 'Xác thực OTP thất bại');
        dispatch(setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch, verifyOtpMutation]
  );

  // Login - Đăng nhập
  const login = useCallback(
    async (email: string, password: string): Promise<AuthOperationResult<AuthResponse>> => {
      dispatch(setLoading());
      try {
        const result = await loginMutation({ email, password }).unwrap();
        if (!result || !result.accessToken || !result.user) {
          const message = (result as ApiErrorResponse)?.message || 'Đăng nhập thất bại';
          dispatch(setError(message));
          return { success: false, error: message };
        }
        dispatch(setCredentials({
          user: result.user,
          token: result.accessToken,
          refreshToken: result.refreshToken,
        }));
        return { success: true, data: result };
      } catch (err: unknown) {
        const message = extractErrorMessage(err, 'Đăng nhập thất bại');
        dispatch(setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch, loginMutation]
  );

  // Google Login - Đăng nhập Google
  const googleLogin = useCallback(
    async (idToken: string, displayName?: string): Promise<AuthOperationResult<AuthResponse>> => {
      dispatch(setLoading());
      try {
        const result = await googleLoginMutation({ idToken, displayName }).unwrap();
        if (!result || !result.accessToken || !result.user) {
          const message = (result as ApiErrorResponse)?.message || 'Đăng nhập Google thất bại';
          dispatch(setError(message));
          return { success: false, error: message };
        }
        dispatch(setCredentials({
          user: result.user,
          token: result.accessToken,
          refreshToken: result.refreshToken,
        }));
        return { success: true, data: result };
      } catch (err: unknown) {
        const message = extractErrorMessage(err, 'Đăng nhập Google thất bại');
        dispatch(setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch, googleLoginMutation]
  );

  // Set Password - Thiết lập mật khẩu mới
  const setPassword = useCallback(
    async (userId: string, newPassword: string): Promise<AuthOperationResult<{ message: string }>> => {
      dispatch(setLoading());
      try {
        const result = await setPasswordMutation({ userId, newPassword }).unwrap();
        return { success: true, data: result };
      } catch (err: unknown) {
        const message = extractErrorMessage(err, 'Thiết lập mật khẩu thất bại');
        dispatch(setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch, setPasswordMutation]
  );

  // Logout - Đăng xuất
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken') || undefined;
    try {
      await logoutMutation({ refreshToken });
    } catch {
      // Bỏ qua lỗi logout API
    }
    dispatch(logoutAction());
  }, [dispatch, logoutMutation]);

  return {
    // State
    status,
    error,
    pendingEmail,
    isLoading: status === 'loading',
    isAuthenticated: status === 'succeeded',

    // Actions
    register,
    verifyOtp,
    login,
    googleLogin,
    setPassword,
    logout,
  };
};
