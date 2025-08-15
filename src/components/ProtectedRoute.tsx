import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  tableId?: string;
}

export function ProtectedRoute({ children, tableId }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={`/loading/${tableId}`} replace />;
  }

  return <>{children}</>;
}