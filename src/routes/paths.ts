// Quản lý tập trung các hằng số đường dẫn (Route Paths)
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  HOME: '/',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '*',
} as const;
