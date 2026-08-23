// Quản lý tập trung các hằng số đường dẫn (Route Paths)
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  HOME: '/',
  EXPLORE: '/explore',
  REQUESTS: '/requests',
  COMMUNITY: '/community',
  POST_CREATE: '/posts/create',
  POST_MENTOR_DETAIL: '/posts/mentor/:id',
  POST_LEARNER_DETAIL: '/posts/learner/:id',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  USER_PROFILE: '/profile/:userId',
  MANAGE: {
    ROOT: '/manage',
    BOOKINGS: '/manage/bookings',
    SCHEDULE: '/manage/schedule',
    POSTS: '/manage/posts',
    WALLET: '/manage/wallet',
    MESSAGES: '/manage/messages',
    DASHBOARD: '/manage/dashboard',
  },
  ROOMS: {
    ONE_ON_ONE: '/rooms/one-on-one/:bookingId',
    GROUP: '/rooms/group/:roomId',
    LOBBY: '/rooms/group',
  },
  NOT_FOUND: '*',
} as const;
