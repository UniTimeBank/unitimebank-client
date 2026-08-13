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

      {/* Wildcard 404 Route */}
      <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.EXPLORE} replace />} />
    </Routes>
  );
};