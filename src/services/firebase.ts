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
  Assignment,
  Submission,
  Comment,
  Referral,
  Payment,
  ClientApplication,
  StaffApplication,
  ReferralApplication,
  VideoReview,
  Inquiry,
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
    reviewedAt: doc.data().reviewedAt?.toDate() || undefined,
  })) as ClientApplication[];
};

export const updateClientApplication = async (applicationId: string, updates: Partial<ClientApplication>) => {
  await updateDoc(doc(db, 'clientApplications', applicationId), {
    ...updates,
    ...(updates.reviewedAt && { reviewedAt: Timestamp.now() })
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
    reviewedAt: doc.data().reviewedAt?.toDate() || undefined,
  })) as StaffApplication[];
};

export const updateStaffApplication = async (applicationId: string, updates: Partial<StaffApplication>) => {
  await updateDoc(doc(db, 'staffApplications', applicationId), {
    ...updates,
    ...(updates.reviewedAt && { reviewedAt: Timestamp.now() })
  });
};

// Referral Applications
export const createReferralApplication = async (applicationData: Omit<ReferralApplication, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'referralApplications'), {
    ...applicationData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getReferralApplications = async (): Promise<ReferralApplication[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'referralApplications'), orderBy('createdAt', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as ReferralApplication[];
};

export const updateReferralApplication = async (applicationId: string, updates: Partial<ReferralApplication>) => {
  await updateDoc(doc(db, 'referralApplications', applicationId), updates);
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

export const updateClient = async (clientId: string, updates: Partial<Client>) => {
  await updateDoc(doc(db, 'clients', clientId), updates);
};

export const deleteClient = async (clientId: string) => {
  await deleteDoc(doc(db, 'clients', clientId));
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

export const updateStaff = async (staffId: string, updates: Partial<Staff>) => {
  await updateDoc(doc(db, 'staff', staffId), updates);
};

export const deleteStaff = async (staffId: string) => {
  await deleteDoc(doc(db, 'staff', staffId));
};

// Orders
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    orderDate: orderData.orderDate ? Timestamp.fromDate(orderData.orderDate) : Timestamp.now(),
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
  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now()
  };
  
  if (updates.orderDate) {
    updateData.orderDate = Timestamp.fromDate(updates.orderDate);
  }
  
  await updateDoc(doc(db, 'orders', orderId), updateData);
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
  const updateData: any = {
    ...updates,
    ...(updates.status === 'approved' || updates.status === 'rejected' ? { reviewedAt: Timestamp.now() } : {})
  };
  
  await updateDoc(doc(db, 'submissions', submissionId), updateData);
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
  const rin = generateRIN();
  const docRef = await addDoc(collection(db, 'referrals'), {
    ...referralData,
    rin,
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
    createdAt: Timestamp.now(),
    ...(paymentData.paymentDate && { paymentDate: Timestamp.fromDate(paymentData.paymentDate) })
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

// Video Reviews
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

// Inquiries
export const createInquiry = async (inquiryData: Omit<Inquiry, 'id' | 'createdAt'>) => {
  const inquiryID = generateInquiryID();
  const docRef = await addDoc(collection(db, 'inquiries'), {
    ...inquiryData,
    inquiryID,
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

// Cancellations
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

// Legacy compatibility functions
export const getPilots = async () => {
  const staff = await getStaff();
  return staff.filter(s => s.role === 'pilot').map(s => ({
    ...s,
    pilotCode: generatePilotCode(s.location),
    totalOrders: 0,
    isVerified: true,
    totalEarnings: 0,
    amountPaid: 0,
    remainingDues: 0,
    registeredDate: s.joinedAt,
    specialization: s.skills || [],
    phoneNumber: '', // Will need to be added from user profile
    email: '', // Will need to be added from user profile
    city: s.location,
    state: '',
    experience: ''
  }));
};

export const getEditors = async () => {
  const staff = await getStaff();
  return staff.filter(s => s.role === 'editor').map(s => ({
    ...s,
    editorCode: generateEditorCode(),
    totalOrders: 0,
    isVerified: true,
    specialization: s.skills || [],
    totalEarnings: 0,
    amountPaid: 0,
    remainingDues: 0,
    registeredDate: s.joinedAt,
    phoneNumber: '', // Will need to be added from user profile
    email: '', // Will need to be added from user profile
    city: s.location,
    experience: ''
  }));
};

export const createPilot = async (pilotData: any) => {
  return await createStaff({
    userId: pilotData.userId || '',
    name: pilotData.name,
    role: 'pilot',
    location: pilotData.city || pilotData.location,
    skills: [],
    portfolio: [],
    availability: 'full-time',
    status: pilotData.status || 'active'
  });
};

export const createEditor = async (editorData: any) => {
  return await createStaff({
    userId: editorData.userId || '',
    name: editorData.name,
    role: 'editor',
    location: editorData.city || editorData.location,
    skills: editorData.specialization || [],
    portfolio: [],
    availability: 'full-time',
    status: editorData.status || 'active'
  });
};

export const updatePilot = async (pilotId: string, updates: any) => {
  const staffUpdates: Partial<Staff> = {
    name: updates.name,
    location: updates.location || updates.city,
    status: updates.status
  };
  await updateDoc(doc(db, 'staff', pilotId), staffUpdates);
};

export const updateEditor = async (editorId: string, updates: any) => {
  const staffUpdates: Partial<Staff> = {
    name: updates.name,
    location: updates.location || updates.city,
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

// Legacy application functions
export const getPilotApplications = async () => {
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

export const getEditorApplications = async () => {
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
    portfolioLink: app.portfolio?.[0],
    adminComments: app.adminComments
  }));
};

export const updatePilotApplication = async (applicationId: string, updates: any) => {
  await updateStaffApplication(applicationId, {
    status: updates.status,
    adminComments: updates.adminComments,
    reviewedBy: 'admin',
    reviewedAt: new Date()
  });
};

export const updateEditorApplication = async (applicationId: string, updates: any) => {
  await updateStaffApplication(applicationId, {
    status: updates.status,
    adminComments: updates.adminComments,
    reviewedBy: 'admin',
    reviewedAt: new Date()
  });
};

export const deletePilotApplication = async (applicationId: string) => {
  await deleteDoc(doc(db, 'staffApplications', applicationId));
};

export const deleteEditorApplication = async (applicationId: string) => {
  await deleteDoc(doc(db, 'staffApplications', applicationId));
};

export const deleteReferralApplication = async (applicationId: string) => {
  await deleteDoc(doc(db, 'referralApplications', applicationId));
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
  return `PIL${cityCode}${randomNum}`;
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

export const subscribeToApplications = (callback: (applications: any[]) => void) => {
  const q = query(collection(db, 'clientApplications'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (querySnapshot) => {
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    callback(applications);
  });
};