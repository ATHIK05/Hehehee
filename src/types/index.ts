// User Authentication & Roles
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'pilot' | 'editor';
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Applications
export interface ClientApplication {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  industry: string;
  website?: string;
  documentsLink?: string;
  referralCode?: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info';
  adminComments?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export interface StaffApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'pilot' | 'editor';
  location: string;
  portfolioLink?: string;
  skills: string[];
  documentsLink?: string;
  referralCode?: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info';
  adminComments?: string;
  approvedAt?: Date;
  createdAt: Date;
}

// Approved Users
export interface Client {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  phone: string;
  city: string;
  industry: string;
  website?: string;
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
  status: 'active' | 'inactive';
  joinedAt: Date;
}

// Orders
export interface Order {
  id: string;
  orderID: string;
  clientId: string;
  clientName: string;
  orderDate: Date;
  location: string;
  packageType: 'basic' | 'premium' | 'custom';
  requirements: string;
  budget: number;
  referenceFiles?: string[];
  status: 'pending' | 'approved' | 'assigned' | 'pilot_submitted' | 'pilot_reviewed' | 'editor_submitted' | 'editor_reviewed' | 'completed' | 'rejected' | 'cancelled';
  advancePaid: boolean;
  finalPaid: boolean;
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
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewComments?: string;
}

// Comments System
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
  referrerId: string;
  referrerName: string;
  referrerType: 'client' | 'pilot' | 'editor';
  referredId: string;
  referredName: string;
  referralCode: string;
  rewardStatus: 'pending' | 'redeemed' | 'expired';
  rewardAmount?: number;
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
  status: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  paymentDate?: Date;
  createdAt: Date;
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
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface Inquiry {
  id: string;
  inquiryID: string;
  clientName: string;
  requirementSummary: string;
  source: 'instagram' | 'website' | 'whatsapp' | 'referral';
  city: string;
  phoneNumber: string;
  createdAt: Date;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  followUpNotes?: string;
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

export interface ReferralApplication {
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
  socialProfiles: string[];
  followersCount: number;
  category: string;
  appliedDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminComments?: string;
}

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