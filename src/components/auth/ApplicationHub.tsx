import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building, Video, Edit3, Users } from 'lucide-react';
import ClientApplicationForm from './ClientApplicationForm';
import StaffApplicationForm from './StaffApplicationForm';
import ReferralApplicationForm from './ReferralApplicationForm';

interface ApplicationHubProps {
  onToggleMode: () => void;
}

export default function ApplicationHub({ onToggleMode }: ApplicationHubProps) {
  const [selectedType, setSelectedType] = useState<'client' | 'pilot' | 'editor' | 'referral' | null>(null);

  const applicationTypes = [
    {
      id: 'client' as const,
      title: 'Business Client',
      description: 'Register your business to access professional drone videography services',
      icon: Building,
      color: 'from-blue-500 to-blue-600',
      features: ['Professional video production', 'Dedicated project management', 'Quality assurance', 'Timely delivery']
    },
    {
      id: 'pilot' as const,
      title: 'Drone Pilot',
      description: 'Join our network of certified drone pilots and earn from your skills',
      icon: Video,
      color: 'from-green-500 to-green-600',
      features: ['Flexible work schedule', 'Competitive rates', 'Equipment support', 'Skill development']
    },
    {
      id: 'editor' as const,
      title: 'Video Editor',
      description: 'Work with us as a professional video editor and showcase your creativity',
      icon: Edit3,
      color: 'from-purple-500 to-purple-600',
      features: ['Remote work opportunities', 'Creative projects', 'Fair compensation', 'Portfolio building']
    },
    {
      id: 'referral' as const,
      title: 'Referral Partner',
      description: 'Become a referral partner and earn rewards for bringing new clients',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      features: ['Earn commissions', 'Marketing support', 'Performance tracking', 'Flexible partnership']
    }
  ];

  if (selectedType) {
    const renderForm = () => {
      switch (selectedType) {
        case 'client':
          return <ClientApplicationForm onBack={() => setSelectedType(null)} />;
        case 'pilot':
        case 'editor':
          return <StaffApplicationForm role={selectedType} onBack={() => setSelectedType(null)} />;
        case 'referral':
          return <ReferralApplicationForm onBack={() => setSelectedType(null)} />;
        default:
          return null;
      }
    };

    return renderForm();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl"
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
            <h1 className="text-2xl font-bold text-slate-900">Join FPV Network</h1>
            <p className="text-slate-600">Choose your role and start your application</p>
          </div>
        </div>

        {/* Application Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applicationTypes.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType(type.id)}
              className="p-6 border-2 border-slate-200 rounded-xl hover:border-slate-300 transition-all text-left group"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <type.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{type.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{type.description}</p>
              
              <div className="space-y-2">
                {type.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-slate-50 rounded-xl">
          <h3 className="text-lg font-medium text-slate-900 mb-3">Application Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">1</div>
              <div>
                <p className="font-medium text-slate-900">Submit Application</p>
                <p className="text-slate-600">Fill out the detailed application form with required documents</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold text-xs">2</div>
              <div>
                <p className="font-medium text-slate-900">Admin Review</p>
                <p className="text-slate-600">Our team will verify your documents and credentials</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-xs">3</div>
              <div>
                <p className="font-medium text-slate-900">Get Access</p>
                <p className="text-slate-600">Once approved, you'll receive login credentials</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}