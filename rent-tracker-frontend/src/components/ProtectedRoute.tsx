import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'landlord' | 'tenant' | 'admin';
}

function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f7f9fb]">
        <div className="text-xl font-semibold text-[#1e293b]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect to the correct dashboard based on role
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;