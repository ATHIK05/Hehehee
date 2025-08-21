import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Video, Users, Edit3, Building } from 'lucide-react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ApplicationFormProps {
  onToggleMode: () => void;
}

export default function ApplicationForm({ onToggleMode }: ApplicationFormProps) {
  const [selectedRole, setSelectedRole] = useState<'client' | 'pilot' | 'editor' | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const roles = [
    {
      id: 'client' as const,
      title: 'Business Client',
      description: 'Get professional drone videography services for your business',
      icon: Building,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'pilot' as const,
      title: 'Drone Pilot',
      description: 'Join our network of professional drone pilots',
      icon: Video,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'editor' as const,
      title: 'Video Editor',
      description: 'Work with us as a professional video editor',
      icon: Edit3,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleRoleSelect = (role: 'client' | 'pilot' | 'editor') => {
    setSelectedRole(role);
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              ✅
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Application Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Thank you for your interest. We'll review your application and get back to you within 2-3 business days.
          </p>
          <Button onClick={onToggleMode} className="w-full">
            Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onToggleMode}
            className="mr-4 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Join Our Network</h1>
            <p className="text-slate-600">Choose your role and apply to get started</p>
          </div>
        </div>

        {!selectedRole ? (
          /* Role Selection */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <motion.button
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
                className="p-6 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-all text-left group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${role.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{role.title}</h3>
                <p className="text-sm text-slate-600">{role.description}</p>
              </motion.button>
            ))}
          </div>
        ) : (
          /* Application Form */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color} rounded-lg flex items-center justify-center`}>
                {React.createElement(roles.find(r => r.id === selectedRole)?.icon || Video, { className: "w-5 h-5 text-white" })}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {roles.find(r => r.id === selectedRole)?.title} Application
                </h2>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Change role
                </button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Application Form</h3>
              <p className="text-slate-600 mb-4">
                The detailed application form for {selectedRole}s will be implemented here with role-specific fields.
              </p>
              <div className="space-y-3 text-sm text-slate-600 text-left">
                {selectedRole === 'client' && (
                  <>
                    <div>• Company information and contact details</div>
                    <div>• Industry and business requirements</div>
                    <div>• Project types and budget range</div>
                  </>
                )}
                {selectedRole === 'pilot' && (
                  <>
                    <div>• Personal information and location</div>
                    <div>• Drone equipment and certifications</div>
                    <div>• Experience and portfolio</div>
                  </>
                )}
                {selectedRole === 'editor' && (
                  <>
                    <div>• Personal information and skills</div>
                    <div>• Software expertise and specializations</div>
                    <div>• Portfolio and previous work</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={() => setSelectedRole(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitApplication}
                disabled={loading}
                className="flex-1 flex items-center justify-center"
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}