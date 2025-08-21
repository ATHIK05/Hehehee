import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Video, Edit3, Upload, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { createStaffApplication } from '../../services/firebase';

interface StaffApplicationFormProps {
  role: 'pilot' | 'editor';
  onBack: () => void;
}

export default function StaffApplicationForm({ role, onBack }: StaffApplicationFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    skills: [] as string[],
    portfolio: [] as string[],
    documents: [] as string[],
    availability: 'full-time' as 'full-time' | 'part-time' | 'freelance',
    referralCode: '',
    experience: '',
    equipment: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const pilotSkills = [
    'Commercial Drone License', 'Aerial Photography', 'Aerial Videography',
    'Real Estate Shoots', 'Event Coverage', 'Construction Monitoring',
    'Agricultural Surveys', 'Inspection Services', 'Mapping & Surveying'
  ];

  const editorSkills = [
    'Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'After Effects',
    'Color Grading', 'Motion Graphics', 'Audio Editing', 'VFX',
    'Drone Footage Editing', 'Commercial Video Production'
  ];

  const availabilityOptions = [
    { value: 'full-time', label: 'Full-time (40+ hours/week)' },
    { value: 'part-time', label: 'Part-time (20-40 hours/week)' },
    { value: 'freelance', label: 'Freelance (Project-based)' }
  ];

  const skills = role === 'pilot' ? pilotSkills : editorSkills;

  const validateStep = (stepNumber: number) => {
    const newErrors: {[key: string]: string} = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }

    if (stepNumber === 2) {
      if (formData.skills.length === 0) newErrors.skills = 'Please select at least one skill';
      if (!formData.experience.trim()) newErrors.experience = 'Experience description is required';
    }

    if (stepNumber === 3) {
      if (formData.portfolio.length === 0) newErrors.portfolio = 'Please provide at least one portfolio link';
      if (formData.documents.length === 0) newErrors.documents = 'Please provide required documents';
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
      await createStaffApplication({
        ...formData,
        role,
        status: 'pending',
        documentsVerified: false,
        portfolioVerified: false
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
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: '' }));
    }
  };

  const handleArrayInput = (field: 'portfolio' | 'documents', value: string) => {
    const links = value.split('\n').filter(link => link.trim());
    setFormData(prev => ({
      ...prev,
      [field]: links
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
            Thank you for your {role} application. Our team will review your portfolio and credentials, then get back to you within 2-3 business days.
          </p>
          <Button onClick={onBack} className="w-full">
            Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  const Icon = role === 'pilot' ? Video : Edit3;
  const roleTitle = role === 'pilot' ? 'Drone Pilot' : 'Video Editor';
  const colorClass = role === 'pilot' ? 'from-green-500 to-green-600' : 'from-purple-500 to-purple-600';

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
            <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{roleTitle} Application</h1>
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
              className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Personal Information</h2>
            
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="City, State"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Availability *
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availabilityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
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

            <div className="flex justify-end">
              <Button onClick={handleNext}>
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Skills & Experience */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Skills & Experience</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Skills & Expertise * (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map(skill => (
                  <label key={skill} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">{skill}</span>
                  </label>
                ))}
              </div>
              {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Experience Description *
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.experience ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder={`Describe your experience as a ${role}...`}
              />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>

            {role === 'pilot' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Equipment Details
                </label>
                <textarea
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List your drone models, cameras, and other equipment..."
                />
              </div>
            )}

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

        {/* Step 3: Portfolio & Documents */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Portfolio & Documents</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Portfolio Links * (One per line)
              </label>
              <textarea
                value={formData.portfolio.join('\n')}
                onChange={(e) => handleArrayInput('portfolio', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.portfolio ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder={`https://drive.google.com/your-portfolio-1
https://vimeo.com/your-work-2
https://youtube.com/your-demo-3`}
              />
              {errors.portfolio && <p className="text-red-500 text-xs mt-1">{errors.portfolio}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Required Documents * (One per line)
              </label>
              <textarea
                value={formData.documents.join('\n')}
                onChange={(e) => handleArrayInput('documents', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.documents ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder={`https://drive.google.com/id-proof
https://drive.google.com/license-certificate
https://drive.google.com/resume`}
              />
              {errors.documents && <p className="text-red-500 text-xs mt-1">{errors.documents}</p>}
            </div>

            <div className={`${role === 'pilot' ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'} border rounded-lg p-4`}>
              <h3 className={`text-sm font-medium ${role === 'pilot' ? 'text-green-900' : 'text-purple-900'} mb-2`}>
                Required Documents:
              </h3>
              <ul className={`text-sm ${role === 'pilot' ? 'text-green-800' : 'text-purple-800'} space-y-1`}>
                {role === 'pilot' ? (
                  <>
                    <li>• Valid ID Proof (Aadhar/PAN/Passport)</li>
                    <li>• Drone License/Registration Certificate</li>
                    <li>• Insurance Certificate (if applicable)</li>
                    <li>• Resume/CV</li>
                  </>
                ) : (
                  <>
                    <li>• Valid ID Proof (Aadhar/PAN/Passport)</li>
                    <li>• Resume/CV with work experience</li>
                    <li>• Software Certificates (if any)</li>
                    <li>• Work samples/Demo reel</li>
                  </>
                )}
              </ul>
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