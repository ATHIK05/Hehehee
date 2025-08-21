export interface Order {
  id: string;
  orderID: string;
  clientName: string;
  phoneNumber: string;
  city: string;
  editor?: string;
  pilot?: string;
  status: 'new' | 'assigned' | 'editing' | 'final_review' | 'completed' | 'cancelled';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  packageType?: string;
  paymentStatus: 'pending' | 'partial' | 'completed';
  driveLink?: string;
  referralCode?: string;
  requirementSummary?: string;
}

export interface Pilot {
  id: string;
  name: string;
  pilotCode: string;
  phoneNumber: string;
  email: string;
  city: string;
  state: string;
  registeredDate: Date;
  totalOrders: number;
  isVerified: boolean;
  referralCode?: string;
  status: 'active' | 'inactive';
  experience?: string;
  totalEarnings: number;
  amountPaid: number;
  remainingDues: number;
}

export interface Editor {
  id: string;
  name: string;
  editorCode: string;
  phoneNumber: string;
  email: string;
  city: string;
  totalOrders: number;
  isVerified: boolean;
  specialization: string[];
  status: 'active' | 'inactive';
  registeredDate: Date;
  totalEarnings: number;
  amountPaid: number;
  remainingDues: number;
}

export interface Referral {
  id: string;
  name: string;
  rin: string; // Referral Identification Number
  email: string;
  city: string;
  state: string;
  socialProfiles: string[];
  followersCount: number;
  category: string;
  referredClients: number;
  totalOrderCost: number;
  referralFee: number;
  centralProfit: number;
  registeredDate: Date;
  status: 'active' | 'inactive';
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