import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Mail, Phone, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

export default function PendingApproval() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRoleTitle = (userType: string) => {
    switch (userType) {
      case 'client': return 'Business Client';
      case 'pilot': return 'Drone Pilot';
      case 'editor': return 'Video Editor';
      default: return 'User';
    }
  };

  const getApprovalMessage = (userType: string) => {
    switch (userType) {
      case 'client':
        return 'Our team is verifying your business documents and credentials. This process typically takes 2-3 business days.';
      case 'pilot':
        return 'Our team is reviewing your pilot license, portfolio, and credentials. This process typically takes 2-3 business days.';
      case 'editor':
        return 'Our team is reviewing your portfolio, skills, and credentials. This process typically takes 2-3 business days.';
      default:
        return 'Your application is being reviewed by our team.';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-orange-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Application Under Review</h1>
        
        <div className="mb-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 mb-4">
            {getRoleTitle(user?.userType || '')} Application
          </div>
          
          <p className="text-slate-600 mb-4">
            {getApprovalMessage(user?.userType || '')}
          </p>
          
          <div className="bg-slate-50 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-slate-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2"></div>
                <span>Document verification and background check</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2"></div>
                <span>Admin review and approval decision</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2"></div>
                <span>Email notification with login credentials</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              <span>{user?.email}</span>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500 mb-4">
              Need help? Contact our support team at support@fpv.com
            </p>
            
            <Button
              variant="secondary"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}