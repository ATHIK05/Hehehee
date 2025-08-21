import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building, Upload, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { createClientApplication } from '../../services/firebase';

interface ClientApplicationFormProps {
  onBack: () => void;
}

export default function ClientApplicationForm({ onBack }: ClientApplicationFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    industry: '',
    businessAddress: '',
    gstNumber: '',
    businessLicense: '',
    website: '',
    referralCode: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const industries = [
    'Real Estate', 'Construction', 'Event Management', 'Tourism & Travel',
    'Agriculture', 'Mining', 'Infrastructure', 'Media & Entertainment',
    'Education', 'Healthcare', 'Manufacturing', 'Other'
  ];

  const validateStep = (stepNumber: number) => {
    const newErrors: {[key: string]: string} = {};

    if (stepNumber === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid';
    }

    if (stepNumber === 2) {
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.industry) newErrors.industry = 'Industry is required';
      if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Business address is required';
    }

    if (stepNumber === 3) {
      if (!formData.businessLicense.trim()) newErrors.businessLicense = 'Business license document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      await createClientApplication({
        ...formData,
        status: 'pending',
        documentsVerified: false,
        emailVerified: false,
        phoneVerified: false
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
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
            Thank you for your business application. Our team will review your submission and get back to you within 2-3 business days.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            You will receive email updates about your application status.
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
            onClick={step === 1 ? onBack : () => setStep(step - 1)}
            className="mr-4 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Business Client Application</h1>
              <p className="text-slate-600">Step {step} of 3</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm text-slate-500">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.companyName ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Enter your company name"
                />
                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contactName ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Enter contact person name"
                />
                {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="+91 9876543210"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext}>
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Business Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Business Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Enter your city"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Industry *
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.industry ? 'border-red-300' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GST Number (Optional)
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter GST number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Business Address *
              </label>
              <textarea
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.businessAddress ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter complete business address with pincode"
              />
              {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress}</p>}
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter referral code if you have one"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Previous
              </Button>
              <Button onClick={handleNext}>
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Document Upload</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business License / Registration Document *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">Upload your business registration document</p>
                  <input
                    type="url"
                    name="businessLicense"
                    value={formData.businessLicense}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.businessLicense ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Paste Google Drive link or document URL"
                  />
                  {errors.businessLicense && <p className="text-red-500 text-xs mt-1">{errors.businessLicense}</p>}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Required Documents:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Business Registration Certificate</li>
                  <li>• GST Registration (if applicable)</li>
                  <li>• PAN Card of the business</li>
                  <li>• Address proof of business location</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-900 mb-2">Note:</h3>
                <p className="text-sm text-yellow-800">
                  Please ensure all documents are clear and readable. Our team will verify these documents before approving your application.
                </p>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Previous
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
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}