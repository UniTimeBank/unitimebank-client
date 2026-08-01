import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/shared/hooks';
import { selectIsAuthenticated } from '@/core/store';
import { ROUTES } from './paths';

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};
