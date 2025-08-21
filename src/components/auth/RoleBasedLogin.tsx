import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Video, Building, Users, Edit3, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

interface RoleBasedLoginProps {
  onToggleMode: () => void;
}

export default function RoleBasedLogin({ onToggleMode }: RoleBasedLoginProps) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const demoAccounts = [
    {
      role: 'Admin',
      email: 'admin@fpv.com',
      password: 'admin123',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      description: 'Full system access'
    },
    {
      role: 'Client',
      email: 'client@fpv.com',
      password: 'client123',
      icon: Building,
      color: 'from-blue-500 to-blue-600',
      description: 'Business client portal'
    },
    {
      role: 'Pilot',
      email: 'pilot@fpv.com',
      password: 'pilot123',
      icon: Video,
      color: 'from-green-500 to-green-600',
      description: 'Drone pilot dashboard'
    },
    {
      role: 'Editor',
      email: 'editor@fpv.com',
      password: 'editor123',
      icon: Edit3,
      color: 'from-purple-500 to-purple-600',
      description: 'Video editor workspace'
    }
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-slate-800 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Video className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">FPV Admin Portal</h1>
          <p className="text-slate-600">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center"
          >
            {loading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <LogIn className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <h3 className="text-sm font-medium text-slate-700 mb-4 text-center">Demo Accounts</h3>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <motion.button
                key={account.role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fillDemoCredentials(account.email, account.password)}
                className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-all text-left"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-6 h-6 bg-gradient-to-r ${account.color} rounded flex items-center justify-center`}>
                    <account.icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-900">{account.role}</span>
                </div>
                <p className="text-xs text-slate-500">{account.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-slate-900 font-medium hover:underline"
            >
              Apply Now
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}