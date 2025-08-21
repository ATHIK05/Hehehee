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
  Pilot, 
  Editor, 
  Referral, 
  Inquiry, 
  VideoReview, 
  PilotApplication,
  EditorApplication,
  ReferralApplication,
  Cancellation
} from '../types';

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

// Pilots
export const createPilot = async (pilotData: Omit<Pilot, 'id' | 'registeredDate'>) => {
  const docRef = await addDoc(collection(db, 'pilots'), {
    ...pilotData,
    registeredDate: Timestamp.now()
  });
  return docRef.id;
};

export const getPilots = async (): Promise<Pilot[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'pilots'), orderBy('registeredDate', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    registeredDate: doc.data().registeredDate?.toDate() || new Date(),
  })) as Pilot[];
};

export const updatePilot = async (pilotId: string, updates: Partial<Pilot>) => {
  await updateDoc(doc(db, 'pilots', pilotId), updates);
};

export const deletePilot = async (pilotId: string) => {
  await deleteDoc(doc(db, 'pilots', pilotId));
};

// Editors
export const createEditor = async (editorData: Omit<Editor, 'id' | 'registeredDate'>) => {
  const docRef = await addDoc(collection(db, 'editors'), {
    ...editorData,
    registeredDate: Timestamp.now()
  });
  return docRef.id;
};

export const getEditors = async (): Promise<Editor[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'editors'), orderBy('registeredDate', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    registeredDate: doc.data().registeredDate?.toDate() || new Date(),
  })) as Editor[];
};

export const updateEditor = async (editorId: string, updates: Partial<Editor>) => {
  await updateDoc(doc(db, 'editors', editorId), updates);
};

export const deleteEditor = async (editorId: string) => {
  await deleteDoc(doc(db, 'editors', editorId));
};

// Referrals
export const createReferral = async (referralData: Omit<Referral, 'id' | 'registeredDate'>) => {
  const docRef = await addDoc(collection(db, 'referrals'), {
    ...referralData,
    registeredDate: Timestamp.now()
  });
  return docRef.id;
};

export const getReferrals = async (): Promise<Referral[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'referrals'), orderBy('registeredDate', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    registeredDate: doc.data().registeredDate?.toDate() || new Date(),
  })) as Referral[];
};

export const updateReferral = async (referralId: string, updates: Partial<Referral>) => {
  await updateDoc(doc(db, 'referrals', referralId), updates);
};

export const deleteReferral = async (referralId: string) => {
  await deleteDoc(doc(db, 'referrals', referralId));
};

// Inquiries
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

// Pilot Applications
export const createPilotApplication = async (applicationData: Omit<PilotApplication, 'id' | 'appliedDate'>) => {
  const docRef = await addDoc(collection(db, 'pilotApplications'), {
    ...applicationData,
    appliedDate: Timestamp.now()
  });
  return docRef.id;
};

export const getPilotApplications = async (): Promise<PilotApplication[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'pilotApplications'), orderBy('appliedDate', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    appliedDate: doc.data().appliedDate?.toDate() || new Date(),
  })) as PilotApplication[];
};

export const updatePilotApplication = async (applicationId: string, updates: Partial<PilotApplication>) => {
  await updateDoc(doc(db, 'pilotApplications', applicationId), updates);
};

export const deletePilotApplication = async (applicationId: string) => {
  await deleteDoc(doc(db, 'pilotApplications', applicationId));
};

// Editor Applications
export const createEditorApplication = async (applicationData: Omit<EditorApplication, 'id' | 'appliedDate'>) => {
  const docRef = await addDoc(collection(db, 'editorApplications'), {
    ...applicationData,
    appliedDate: Timestamp.now()
  });
  return docRef.id;
};

export const getEditorApplications = async (): Promise<EditorApplication[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'editorApplications'), orderBy('appliedDate', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    appliedDate: doc.data().appliedDate?.toDate() || new Date(),
  })) as EditorApplication[];
};

export const updateEditorApplication = async (applicationId: string, updates: Partial<EditorApplication>) => {
  await updateDoc(doc(db, 'editorApplications', applicationId), updates);
};

export const deleteEditorApplication = async (applicationId: string) => {
  await deleteDoc(doc(db, 'editorApplications', applicationId));
};

// Referral Applications
export const createReferralApplication = async (applicationData: Omit<ReferralApplication, 'id' | 'appliedDate'>) => {
  const docRef = await addDoc(collection(db, 'referralApplications'), {
    ...applicationData,
    appliedDate: Timestamp.now()
  });
  return docRef.id;
};

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

// Cancellations
export const createCancellation = async (cancellationData: Omit<Cancellation, 'id' | 'cancellationDate'>) => {
  const docRef = await addDoc(collection(db, 'cancellations'), {
    ...cancellationData,
    cancellationDate: Timestamp.now()
  });
  return docRef.id;
};

export const getCancellations = async (): Promise<Cancellation[]> => {
  const querySnapshot = await getDocs(query(collection(db, 'cancellations'), orderBy('cancellationDate', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    cancellationDate: doc.data().cancellationDate?.toDate() || new Date(),
  })) as Cancellation[];
};

export const updateCancellation = async (cancellationId: string, updates: Partial<Cancellation>) => {
  await updateDoc(doc(db, 'cancellations', cancellationId), updates);
};

// Utility functions
export const generateOrderID = () => {
  return 'ORD' + Date.now().toString().slice(-8);
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
  return 'INQ' + Date.now().toString().slice(-6);
};