import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthPage from './pages/auth/AuthPage';
import PendingApproval from './pages/PendingApproval';
import Unauthorized from './pages/Unauthorized';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Admin Pages
import AdminApp from './AdminApp';

// User Dashboards
import PilotDashboard from './pages/pilot/PilotDashboard';
import EditorDashboard from './pages/editor/EditorDashboard';
import ClientDashboard from './pages/client/ClientDashboard';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect based on user type and status
  const getDefaultRoute = () => {
    if (!user) return '/login';
    
    if (user.status === 'pending') return '/pending-approval';
    
    switch (user.userType) {
      case 'admin': return '/admin';
      case 'client': return '/client';
      case 'pilot': return '/pilot';
      case 'editor': return '/editor';
      default: return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={getDefaultRoute()} replace /> : <AuthPage />} 
      />
      
      {/* Pending Approval */}
      <Route
        path="/pending-approval"
        element={
          user && user.status === 'pending' ? (
            <PendingApproval />
          ) : (
            <Navigate to={getDefaultRoute()} replace />
          )
        }
      />
      
      {/* Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedUserTypes={['admin']}>
            <AdminApp />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/pilot"
        element={
          <ProtectedRoute allowedUserTypes={['pilot']}>
            <PilotDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/editor"
        element={
          <ProtectedRoute allowedUserTypes={['editor']}>
            <EditorDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedUserTypes={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Default Redirects */}
      <Route 
        path="/" 
        element={<Navigate to={getDefaultRoute()} replace />} 
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;