import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { endpoint }) => {
    if (headers.has('skip-auth')) {
      headers.delete('skip-auth');
      return headers;
    }

    const publicEndpoints = ['register', 'login', 'verifyOtp', 'refresh', 'forgotPassword', 'resetPassword'];
    if (publicEndpoints.includes(endpoint)) {
      return headers;
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include',
});

// Enhanced base query with reauth handling
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 - token expired
  if (result.error?.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      const headers = new Headers();
      headers.set('skip-auth', 'true');

      // Try to refresh token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
          headers,
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const resData = (refreshResult.data as any)?.data || refreshResult.data;
        const accessToken = resData?.accessToken;
        const newRefreshToken = resData?.refreshToken;

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          // Retry original request
          result = await baseQuery(args, api, extraOptions);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  }

  return result;
};

// Create base API with RTK Query
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'Post', 'Booking', 'Session', 'Wallet', 'Notification'],
  endpoints: () => ({}),
});
