import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleGoBack = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'pilot') {
      navigate('/pilot');
    } else if (user?.role === 'editor') {
      navigate('/editor');
    } else if (user?.role === 'client') {
      navigate('/client');
    } else {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
        <p className="text-slate-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-3">
          <Button onClick={handleGoBack} className="w-full flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back to Dashboard
          </Button>
          
          <Button variant="secondary" onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Current Role: <span className="font-medium capitalize">{user?.role}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}