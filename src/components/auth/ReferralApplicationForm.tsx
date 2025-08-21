import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { createReferralApplication } from '../../services/firebase';

interface ReferralApplicationFormProps {
  onBack: () => void;
}

export default function ReferralApplicationForm({ onBack }: ReferralApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    category: '',
    socialProfiles: ['', '', ''],
    followersCount: 0,
    referralCode: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const categories = [
    'Influencer',
    'Content Creator',
    'Reviewer',
    'Promoter',
    'Business Partner',
    'Marketing Agency'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.socialProfiles.filter(p => p.trim()).length === 0) {
      newErrors.socialProfiles = 'At least one social profile is required';
    }
    if (formData.followersCount < 100) {
      newErrors.followersCount = 'Minimum 100 followers required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createReferralApplication({
        ...formData,
        socialProfiles: formData.socialProfiles.filter(p => p.trim()),
        status: 'pending'
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'followersCount' ? parseInt(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialProfileChange = (index: number, value: string) => {
    const newProfiles = [...formData.socialProfiles];
    newProfiles[index] = value;
    setFormData(prev => ({ ...prev, socialProfiles: newProfiles }));
    if (errors.socialProfiles) {
      setErrors(prev => ({ ...prev, socialProfiles: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Application Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Thank you for your referral partner application. Our team will review your profile and get back to you within 2-3 business days.
          </p>
          <Button onClick={onBack} className="w-full">
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
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Referral Partner Application</h1>
              <p className="text-slate-600">Join our referral network and earn rewards</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="+91 9876543210"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.city ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter your city"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.state ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter your state"
              />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.category ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Social Media Profiles * (At least one required)
            </label>
            <div className="space-y-2">
              {formData.socialProfiles.map((profile, index) => (
                <input
                  key={index}
                  type="url"
                  value={profile}
                  onChange={(e) => handleSocialProfileChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={`Social profile ${index + 1} (Instagram, YouTube, LinkedIn, etc.)`}
                />
              ))}
            </div>
            {errors.socialProfiles && <p className="text-red-500 text-xs mt-1">{errors.socialProfiles}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Total Followers Count *
            </label>
            <input
              type="number"
              name="followersCount"
              value={formData.followersCount}
              onChange={handleChange}
              min="100"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.followersCount ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="Total followers across all platforms"
            />
            {errors.followersCount && <p className="text-red-500 text-xs mt-1">{errors.followersCount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter referral code if you have one"
            />
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-900 mb-2">Referral Benefits:</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Earn 5-10% commission on successful referrals</li>
              <li>• Monthly performance bonuses</li>
              <li>• Marketing materials and support</li>
              <li>• Real-time tracking dashboard</li>
              <li>• Flexible payout options</li>
            </ul>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}