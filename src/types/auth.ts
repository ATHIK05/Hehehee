// Authentication and User Types
export interface User {
  id: string;
  email: string;
  userType: 'admin' | 'client' | 'pilot' | 'editor';
  status: 'active' | 'inactive' | 'pending';
  profile: UserProfile;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface UserProfile {
  name: string;
  phone: string;
  avatar?: string;
  // Role-specific profile data
  clientProfile?: ClientProfile;
  staffProfile?: StaffProfile;
}

export interface ClientProfile {
  companyName: string;
  contactName: string;
  industry: string;
  city: string;
  gstNumber?: string;
  businessAddress: string;
  website?: string;
  businessLicense?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
}

export interface StaffProfile {
  role: 'pilot' | 'editor';
  location: string;
  skills: string[];
  portfolio?: string[];
  documents?: string[];
  availability: 'full-time' | 'part-time' | 'freelance';
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
}

// Application Types
export interface ClientApplication {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  industry: string;
  businessAddress: string;
  gstNumber?: string;
  businessLicense: string;
  website?: string;
  referralCode?: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info';
  adminComments?: string;
  documentsVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface StaffApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'pilot' | 'editor';
  location: string;
  skills: string[];
  portfolio: string[];
  documents: string[];
  availability: 'full-time' | 'part-time' | 'freelance';
  referralCode?: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info';
  adminComments?: string;
  documentsVerified: boolean;
  portfolioVerified: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface ReferralApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  category: 'influencer' | 'reviewer' | 'promoter' | 'content_creator';
  socialProfiles: string[];
  followersCount: number;
  referralCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComments?: string;
  createdAt: Date;
}