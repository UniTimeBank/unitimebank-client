import { baseApi } from '@/core/api/baseApi';
import type {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  AuthResponse,
  RegisterResponse,
  RefreshTokenDto,
} from '@/features/auth/types';

// Auth API endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Đăng ký
    register: builder.mutation<RegisterResponse, RegisterDto>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    // Xác thực OTP
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpDto>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (_body, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        } catch (error) {
          console.error('Lỗi khi lưu tokens:', error);
        }
      },
    }),

    // Đăng nhập
    login: builder.mutation<AuthResponse, LoginDto>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (_body, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        } catch (error) {
          console.error('Lỗi khi lưu tokens:', error);
        }
      },
    }),

    // Đăng nhập Google
    googleLogin: builder.mutation<AuthResponse, { idToken: string; displayName?: string }>({
      query: (body) => ({
        url: '/auth/google',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (_body, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        } catch (error) {
          console.error('Lỗi khi lưu tokens:', error);
        }
      },
    }),

    // Thiết lập mật khẩu
    setPassword: builder.mutation<{ message: string }, { userId: string; newPassword: string }>({
      query: (body) => ({
        url: '/auth/set-password',
        method: 'POST',
        body,
      }),
    }),

    // Đổi mật khẩu (khi đã đăng nhập)
    changePassword: builder.mutation<{ message: string }, { userId: string; oldPassword: string; newPassword: string }>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    // ========== QUÊN MẬT KHẨU ==========
    // Gửi OTP đặt lại mật khẩu
    forgotPassword: builder.mutation<{ message: string; email?: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    // Đặt lại mật khẩu với OTP
    resetPassword: builder.mutation<{ message: string }, { email: string; code: string; newPassword: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    // Làm mới token
    refreshToken: builder.mutation<Omit<AuthResponse, 'user'>, RefreshTokenDto>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (_body, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        } catch (error) {
          console.error('Lỗi khi refresh token:', error);
        }
      },
    }),

    // Đăng xuất
    logout: builder.mutation<{ message: string }, { refreshToken?: string }>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
      onQueryStarted: async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useSetPasswordMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;
