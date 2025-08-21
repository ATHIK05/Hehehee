import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Order, 
  Client,
  Staff,
  ClientApplication,
  StaffApplication,
  Assignment,
  Submission,
  Comment,
  Referral,
  Payment,
  // Legacy types
  Pilot, 
  Editor, 
  VideoReview, 
  Inquiry, 
  PilotApplication,
  EditorApplication,
  ReferralApplication,
  Cancellation
} from '../types';

// Client Applications
export const createClientApplication = async (applicationData: Omit<ClientApplication, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'clientApplications'), {
    ...applicationData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getClientApplications = async (): Promise<ClientApplication[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'clientApplications'), orderBy('createdAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    approvedAt: doc.data().approvedAt?.toDate() || undefined,
  })) as ClientApplication[];
};

export const updateClientApplication = async (applicationId: string, updates: Partial<ClientApplication>) => {
  await updateDoc(doc(db, 'clientApplications', applicationId), {
    ...updates,
    ...(updates.status === 'approved' && { approvedAt: Timestamp.now() })
  });
};

// Staff Applications
export const createStaffApplication = async (applicationData: Omit<StaffApplication, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'staffApplications'), {
    ...applicationData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getStaffApplications = async (): Promise<StaffApplication[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'staffApplications'), orderBy('createdAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    approvedAt: doc.data().approvedAt?.toDate() || undefined,
  })) as StaffApplication[];
};

export const updateStaffApplication = async (applicationId: string, updates: Partial<StaffApplication>) => {
  await updateDoc(doc(db, 'staffApplications', applicationId), {
    ...updates,
    ...(updates.status === 'approved' && { approvedAt: Timestamp.now() })
  });
};

// Clients
export const createClient = async (clientData: Omit<Client, 'id' | 'joinedAt'>) => {
  const docRef = await addDoc(collection(db, 'clients'), {
    ...clientData,
    joinedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getClients = async (): Promise<Client[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'clients'), orderBy('joinedAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    joinedAt: doc.data().joinedAt?.toDate() || new Date(),
  })) as Client[];
};

// Staff
export const createStaff = async (staffData: Omit<Staff, 'id' | 'joinedAt'>) => {
  const docRef = await addDoc(collection(db, 'staff'), {
    ...staffData,
    joinedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getStaff = async (): Promise<Staff[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'staff'), orderBy('joinedAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    joinedAt: doc.data().joinedAt?.toDate() || new Date(),
  })) as Staff[];
};

// Orders
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getOrders = async (): Promise<Order[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    orderDate: doc.data().orderDate?.toDate() || new Date(),
  })) as Order[];
};

export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
  await updateDoc(doc(db, 'orders', orderId), {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteOrder = async (orderId: string) => {
  await deleteDoc(doc(db, 'orders', orderId));
};

// Assignments
export const createAssignment = async (assignmentData: Omit<Assignment, 'id' | 'assignedAt'>) => {
  const docRef = await addDoc(collection(db, 'assignments'), {
    ...assignmentData,
    assignedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getAssignments = async (): Promise<Assignment[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'assignments'), orderBy('assignedAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    assignedAt: doc.data().assignedAt?.toDate() || new Date(),
  })) as Assignment[];
};

export const updateAssignment = async (assignmentId: string, updates: Partial<Assignment>) => {
  await updateDoc(doc(db, 'assignments', assignmentId), updates);
};

// Submissions
export const createSubmission = async (submissionData: Omit<Submission, 'id' | 'submittedAt'>) => {
  const docRef = await addDoc(collection(db, 'submissions'), {
    ...submissionData,
    submittedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getSubmissions = async (): Promise<Submission[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'submissions'), orderBy('submittedAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: doc.data().submittedAt?.toDate() || new Date(),
    reviewedAt: doc.data().reviewedAt?.toDate() || undefined,
  })) as Submission[];
};

export const updateSubmission = async (submissionId: string, updates: Partial<Submission>) => {
  await updateDoc(doc(db, 'submissions', submissionId), {
    ...updates,
    ...(updates.status === 'reviewed' && { reviewedAt: Timestamp.now() })
  });
};

// Comments
export const createComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'comments'), {
    ...commentData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getComments = async (orderId?: string): Promise<Comment[]> => {
  const q = orderId 
    ? query(collection(db, 'comments'), where('orderId', '==', orderId), orderBy('createdAt', 'desc'))
    : query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Comment[];
};

// Referrals
export const createReferral = async (referralData: Omit<Referral, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'referrals'), {
    ...referralData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getReferrals = async (): Promise<Referral[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'referrals'), orderBy('createdAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Referral[];
};

export const updateReferral = async (referralId: string, updates: Partial<Referral>) => {
  await updateDoc(doc(db, 'referrals', referralId), updates);
};

export const deleteReferral = async (referralId: string) => {
  await deleteDoc(doc(db, 'referrals', referralId));
};

// Payments
export const createPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'payments'), {
    ...paymentData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getPayments = async (): Promise<Payment[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    paymentDate: doc.data().paymentDate?.toDate() || undefined,
  })) as Payment[];
};

// Legacy functions for backward compatibility
export const getPilots = async (): Promise<Pilot[]> => {
  const staff = await getStaff();
  return staff.filter(s => s.role === 'pilot').map(s => ({
    ...s,
    pilotCode: `PIL${s.id.slice(-3)}`,
    totalOrders: 0,
    isVerified: true,
    totalEarnings: 0,
    amountPaid: 0,
    remainingDues: 0,
    registeredDate: s.joinedAt,
    specialization: s.skills || []
  })) as Pilot[];
};

export const getEditors = async (): Promise<Editor[]> => {
  const staff = await getStaff();
  return staff.filter(s => s.role === 'editor').map(s => ({
    ...s,
    editorCode: `ED${s.id.slice(-3)}`,
    totalOrders: 0,
    isVerified: true,
    specialization: s.skills || [],
    totalEarnings: 0,
    amountPaid: 0,
    remainingDues: 0,
    registeredDate: s.joinedAt
  })) as Editor[];
};

export const createPilot = async (pilotData: Omit<Pilot, 'id' | 'registeredDate'>) => {
  return await createStaff({
    userId: pilotData.userId || '',
    name: pilotData.name,
    role: 'pilot',
    location: pilotData.location,
    skills: [],
    status: pilotData.status
  });
};

export const createEditor = async (editorData: Omit<Editor, 'id' | 'registeredDate'>) => {
  return await createStaff({
    userId: editorData.userId || '',
    name: editorData.name,
    role: 'editor',
    location: editorData.location,
    skills: editorData.specialization,
    status: editorData.status
  });
};

export const updatePilot = async (pilotId: string, updates: Partial<Pilot>) => {
  // Convert to staff update
  const staffUpdates: Partial<Staff> = {
    name: updates.name,
    location: updates.location,
    status: updates.status
  };
  await updateDoc(doc(db, 'staff', pilotId), staffUpdates);
};

export const updateEditor = async (editorId: string, updates: Partial<Editor>) => {
  // Convert to staff update
  const staffUpdates: Partial<Staff> = {
    name: updates.name,
    location: updates.location,
    skills: updates.specialization,
    status: updates.status
  };
  await updateDoc(doc(db, 'staff', editorId), staffUpdates);
};

export const deletePilot = async (pilotId: string) => {
  await deleteDoc(doc(db, 'staff', pilotId));
};

export const deleteEditor = async (editorId: string) => {
  await deleteDoc(doc(db, 'staff', editorId));
};

// Video Reviews (Legacy)
export const createVideoReview = async (reviewData: Omit<VideoReview, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'videoReviews'), {
    ...reviewData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getVideoReviews = async (): Promise<VideoReview[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'videoReviews'), orderBy('createdAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as VideoReview[];
};

export const updateVideoReview = async (reviewId: string, updates: Partial<VideoReview>) => {
  await updateDoc(doc(db, 'videoReviews', reviewId), {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteVideoReview = async (reviewId: string) => {
  await deleteDoc(doc(db, 'videoReviews', reviewId));
};

// Inquiries (Legacy)
export const createInquiry = async (inquiryData: Omit<Inquiry, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'inquiries'), {
    ...inquiryData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getInquiries = async (): Promise<Inquiry[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Inquiry[];
};

export const updateInquiry = async (inquiryId: string, updates: Partial<Inquiry>) => {
  await updateDoc(doc(db, 'inquiries', inquiryId), updates);
};

export const deleteInquiry = async (inquiryId: string) => {
  await deleteDoc(doc(db, 'inquiries', inquiryId));
};

// Legacy Application functions
export const getPilotApplications = async (): Promise<PilotApplication[]> => {
  const staffApps = await getStaffApplications();
  return staffApps.filter(app => app.role === 'pilot').map(app => ({
    id: app.id,
    name: app.name,
    phoneNumber: app.phone,
    email: app.email,
    city: app.location,
    experience: app.skills.join(', '),
    appliedDate: app.createdAt,
    status: app.status as any,
    referralCode: app.referralCode,
    adminComments: app.adminComments
  }));
};

export const getEditorApplications = async (): Promise<EditorApplication[]> => {
  const staffApps = await getStaffApplications();
  return staffApps.filter(app => app.role === 'editor').map(app => ({
    id: app.id,
    name: app.name,
    phoneNumber: app.phone,
    email: app.email,
    city: app.location,
    experience: app.skills.join(', '),
    specialization: app.skills,
    appliedDate: app.createdAt,
    status: app.status as any,
    portfolioLink: app.portfolioLink,
    adminComments: app.adminComments
  }));
};

export const updatePilotApplication = async (applicationId: string, updates: Partial<PilotApplication>) => {
  await updateStaffApplication(applicationId, {
    status: updates.status as any,
    adminComments: updates.adminComments
  });
};

export const updateEditorApplication = async (applicationId: string, updates: Partial<EditorApplication>) => {
  await updateStaffApplication(applicationId, {
    status: updates.status as any,
    adminComments: updates.adminComments
  });
};

export const deletePilotApplication = async (applicationId: string) => {
  await deleteDoc(doc(db, 'staffApplications', applicationId));
};

export const deleteEditorApplication = async (applicationId: string) => {
  await deleteDoc(doc(db, 'staffApplications', applicationId));
};

// Referral Applications (Legacy)
export const getReferralApplications = async (): Promise<ReferralApplication[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'referralApplications'), orderBy('appliedDate', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    appliedDate: doc.data().appliedDate?.toDate() || new Date(),
  })) as ReferralApplication[];
};

export const updateReferralApplication = async (applicationId: string, updates: Partial<ReferralApplication>) => {
  await updateDoc(doc(db, 'referralApplications', applicationId), updates);
};

export const deleteReferralApplication = async (applicationId: string) => {
  await deleteDoc(doc(db, 'referralApplications', applicationId));
};

// Cancellations (Legacy)
export const getCancellations = async (): Promise<Cancellation[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'cancellations'), orderBy('cancellationDate', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    cancellationDate: doc.data().cancellationDate?.toDate() || new Date(),
  })) as Cancellation[];
};

export const createCancellation = async (cancellationData: Omit<Cancellation, 'id' | 'cancellationDate'>) => {
  const docRef = await addDoc(collection(db, 'cancellations'), {
    ...cancellationData,
    cancellationDate: Timestamp.now()
  });
  return docRef.id;
};

export const updateCancellation = async (cancellationId: string, updates: Partial<Cancellation>) => {
  await updateDoc(doc(db, 'cancellations', cancellationId), updates);
};

// Utility functions
export const generateOrderID = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return 'ORD' + timestamp.slice(-6) + random;
};

export const generatePilotCode = (city: string) => {
  const cityCode = city.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${cityCode}${randomNum}`;
};

export const generateEditorCode = () => {
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ED${randomNum}`;
};

export const generateRIN = () => {
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RIN${randomNum}`;
};

export const generateInquiryID = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return 'INQ' + timestamp.slice(-4) + random;
};

export const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Real-time listeners
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      orderDate: doc.data().orderDate?.toDate() || new Date(),
    })) as Order[];
    callback(orders);
  });
};

export const subscribeToInquiries = (callback: (inquiries: Inquiry[]) => void) => {
  const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const inquiries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Inquiry[];
    callback(inquiries);
  });
};

export const subscribeToVideoReviews = (callback: (reviews: VideoReview[]) => void) => {
  const q = query(collection(db, 'videoReviews'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const reviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as VideoReview[];
    callback(reviews);
  });
};