import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/shared/hooks';
import { selectIsAuthenticated } from '@/core/store';
import { MainLayout } from '@/shared/layouts';
import { ROUTES } from './paths';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Điều hướng về trang đăng nhập nếu chưa authed, lưu lại location trước đó
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};
