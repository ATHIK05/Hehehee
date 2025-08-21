// User Authentication & Roles
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
  category: 'influencer' | 'reviewer' | 'promoter' | 'content_creator' | 'business_partner' | 'marketing_agency';
  socialProfiles: string[];
  followersCount: number;
  referralCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComments?: string;
  createdAt: Date;
}

// Core Business Entities
export interface Client {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  phone: string;
  city: string;
  industry: string;
  website?: string;
  gstNumber?: string;
  businessAddress: string;
  status: 'active' | 'inactive';
  joinedAt: Date;
}

export interface Staff {
  id: string;
  userId: string;
  name: string;
  role: 'pilot' | 'editor';
  location: string;
  skills?: string[];
  portfolio?: string[];
  availability: 'full-time' | 'part-time' | 'freelance';
  status: 'active' | 'inactive';
  joinedAt: Date;
}

// Orders
export interface Order {
  id: string;
  orderID: string;
  clientId: string;
  clientName: string;
  phoneNumber: string;
  city: string;
  orderDate: Date;
  duration: number; // estimated duration in hours
  packageType: 'basic' | 'premium' | 'custom';
  requirementSummary: string;
  referenceFiles?: string[];
  amount: number;
  paymentStatus: 'pending' | 'advance_paid' | 'fully_paid';
  status: 'pending' | 'approved' | 'assigned' | 'pilot_submitted' | 'pilot_reviewed' | 'editor_assigned' | 'editor_submitted' | 'editor_reviewed' | 'completed' | 'rejected' | 'cancelled';
  pilot?: string;
  editor?: string;
  finalDriveLink?: string;
  adminComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Assignments
export interface Assignment {
  id: string;
  orderId: string;
  pilotId?: string;
  pilotName?: string;
  editorId?: string;
  editorName?: string;
  assignedAt: Date;
  status: 'assigned' | 'in_progress' | 'completed';
}

// Submissions
export interface Submission {
  id: string;
  orderId: string;
  submittedBy: 'pilot' | 'editor';
  submitterId: string;
  submitterName: string;
  driveLink: string;
  duration?: number; // for pilot submissions (in minutes)
  hoursWorked?: number; // for editor submissions
  comments: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'resubmitted';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewComments?: string;
}

// Comments System (Centralized for Audit Trail)
export interface Comment {
  id: string;
  orderId: string;
  commentBy: 'admin' | 'pilot' | 'editor' | 'client';
  commenterId: string;
  commenterName: string;
  commentStage: 'pilot_submission' | 'editor_submission' | 'final_review' | 'client_feedback' | 'general';
  commentText: string;
  createdAt: Date;
}

// Referrals
export interface Referral {
  id: string;
  rin: string; // Referral Identification Number
  name: string;
  email: string;
  city: string;
  state: string;
  category: string;
  socialProfiles: string[];
  followersCount: number;
  referredClients: number;
  totalOrderCost: number;
  referralFee: number;
  centralProfit: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Payments
export interface Payment {
  id: string;
  orderId: string;
  payerId: string;
  payerName: string;
  amount: number;
  paymentType: 'advance' | 'final' | 'payout';
  paymentMethod: 'upi' | 'bank_transfer' | 'card' | 'cash';
  status: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  paymentDate?: Date;
  createdAt: Date;
}

// Video Reviews
export interface VideoReview {
  id: string;
  orderID: string;
  clientName: string;
  driveLink: string;
  editorAssigned: string;
  pilotAssigned: string;
  reviewStatus: 'not_reviewed' | 'under_review' | 'approved' | 'rejected' | 'needs_change';
  type: 'before_edit' | 'after_edit';
  comments?: string;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Inquiries
export interface Inquiry {
  id: string;
  inquiryID: string;
  clientName: string;
  phoneNumber: string;
  city: string;
  requirementSummary: string;
  source: 'instagram' | 'website' | 'whatsapp' | 'referral' | 'direct';
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  followUpNotes?: string;
  convertedOrderId?: string;
  createdAt: Date;
}

// Cancellations
export interface Cancellation {
  id: string;
  orderID: string;
  clientName: string;
  city: string;
  assignedPilot?: string;
  assignedEditor?: string;
  cancellationDate: Date;
  reason: 'client' | 'weather' | 'gear_issue' | 'pilot_unavailable' | 'editor_unavailable' | 'other';
  status: 'cancelled' | 'reassigned' | 'refund_initiated' | 'refund_completed';
  refundAmount?: number;
  adminNotes?: string;
}

// Legacy types for backward compatibility
export interface Pilot extends Staff {
  pilotCode: string;
  totalOrders: number;
  isVerified: boolean;
  totalEarnings: number;
  amountPaid: number;
  remainingDues: number;
  registeredDate: Date;
  experience?: string;
  state?: string;
}

export interface Editor extends Staff {
  editorCode: string;
  totalOrders: number;
  isVerified: boolean;
  specialization: string[];
  totalEarnings: number;
  amountPaid: number;
  remainingDues: number;
  registeredDate: Date;
  experience?: string;
}

export interface PilotApplication {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  city: string;
  experience: string;
  appliedDate: Date;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  referralCode?: string;
  adminComments?: string;
}

export interface EditorApplication {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  city: string;
  experience: string;
  specialization: string[];
  appliedDate: Date;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  portfolioLink?: string;
  adminComments?: string;
}