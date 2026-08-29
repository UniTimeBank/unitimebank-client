import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/features/auth';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { ROUTES } from './paths';
import { UserProfilePage } from '@/features/user';
import {
  PostExplorePage,
  OpenRequestsPage,
  CommunityPage,
  MentorPostDetailPage,
  LearnerRequestDetailPage,
} from '@/features/post';
import {
  ManagementLayout,
  BookingManagementPage,
  GroupSessionsManagementPage,
  ScheduleManagementPage,
  DashboardManagementPage,
  PostsManagementPage,
  WalletManagementPage,
  MessagesManagementPage,
} from '@/features/management';
import {
  OneOnOneRoomPage,
  GroupRoomPage,
  GroupLobbyPage,
} from '@/features/session';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Route công khai - Auth */}
      <Route
        path={ROUTES.AUTH.LOGIN}
        element={
          <PublicRoute>
            <AuthPage initialView="login" />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.AUTH.REGISTER}
        element={
          <PublicRoute>
            <AuthPage initialView="register" />
          </PublicRoute>
        }
      />
      <Route path="/auth" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />

      {/* Redirect Home về Explore */}
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.EXPLORE} replace />} />
      <Route path={ROUTES.DASHBOARD} element={<Navigate to={ROUTES.EXPLORE} replace />} />

      {/* Route bảo vệ - Explore & Requests & Community */}
      <Route
        path={ROUTES.EXPLORE}
        element={
          <ProtectedRoute>
            <PostExplorePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.COMMUNITY}
        element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.REQUESTS}
        element={
          <ProtectedRoute>
            <OpenRequestsPage />
          </ProtectedRoute>
        }
      />

      {/* Route bảo vệ - Chi tiết Bài Đăng */}
      <Route
        path={ROUTES.POST_MENTOR_DETAIL}
        element={
          <ProtectedRoute>
            <MentorPostDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.POST_LEARNER_DETAIL}
        element={
          <ProtectedRoute>
            <LearnerRequestDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Route bảo vệ - Profile */}
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.USER_PROFILE}
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Route bảo vệ - Quản lý */}
      <Route
        path="/manage"
        element={
          <ProtectedRoute>
            <ManagementLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.MANAGE.BOOKINGS} replace />} />
        <Route path="bookings" element={<BookingManagementPage />} />
        <Route path="group-sessions" element={<GroupSessionsManagementPage />} />
        <Route path="schedule" element={<ScheduleManagementPage />} />
        <Route path="dashboard" element={<DashboardManagementPage />} />
        <Route path="posts" element={<PostsManagementPage />} />
        <Route path="wallet" element={<WalletManagementPage />} />
        <Route path="messages" element={<MessagesManagementPage />} />
      </Route>

      {/* Route bảo vệ - Phòng học trực tuyến & Thời gian thực (Full-screen) */}
      <Route
        path={ROUTES.ROOMS.ONE_ON_ONE}
        element={
          <ProtectedRoute fullScreen>
            <OneOnOneRoomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ROOMS.GROUP}
        element={
          <ProtectedRoute fullScreen>
            <GroupRoomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ROOMS.LOBBY}
        element={
          <ProtectedRoute>
            <GroupLobbyPage />
          </ProtectedRoute>
        }
      />

      {/* Wildcard 404 Route */}
      <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.EXPLORE} replace />} />
    </Routes>
  );
};