import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('admin' | 'client' | 'pilot' | 'editor')[];
  requireActive?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedUserTypes, 
  requireActive = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireActive && user.status !== 'active') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedUserTypes && !allowedUserTypes.includes(user.userType)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}