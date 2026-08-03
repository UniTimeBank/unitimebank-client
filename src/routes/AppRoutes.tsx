import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/features/auth';
import { UserProfilePage } from '@/features/user';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { ROUTES } from './paths';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Route công khai - Auth (Chỉ dùng /login và /register) */}
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

      {/* Redirect Home và Dashboard trực tiếp về Profile */}
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.PROFILE} replace />} />
      <Route path={ROUTES.DASHBOARD} element={<Navigate to={ROUTES.PROFILE} replace />} />

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
      <Route path={ROUTES.NOT_FOUND} element={<Navigate to={ROUTES.PROFILE} replace />} />
    </Routes>
  );
};
