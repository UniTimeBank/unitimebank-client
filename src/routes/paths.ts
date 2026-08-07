// Quản lý tập trung các hằng số đường dẫn (Route Paths)
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  USER_PROFILE: '/profile/:userId',
  NOT_FOUND: '*',
} as const;

