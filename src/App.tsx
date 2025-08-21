import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthPage from './pages/auth/AuthPage';
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

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={`/${user.role}`} replace /> : <AuthPage />} 
      />
      
      {/* Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminApp />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/pilot"
        element={
          <ProtectedRoute allowedRoles={['pilot']}>
            <PilotDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/editor"
        element={
          <ProtectedRoute allowedRoles={['editor']}>
            <EditorDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Default Redirects */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
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