import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserProfile, ClientProfile, StaffProfile } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: User['userType'], profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          await loadUserProfile(firebaseUser.uid);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (userId: string) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUser({
        id: userId,
        email: userData.email,
        userType: userData.userType,
        status: userData.status,
        profile: userData.profile,
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLoginAt: userData.lastLoginAt?.toDate()
      });

      // Update last login
      await updateDoc(doc(db, 'users', userId), {
        lastLoginAt: Timestamp.now()
      });
    } else {
      throw new Error('User profile not found');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      await loadUserProfile(firebaseUser.uid);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userType: User['userType'], 
    profile: UserProfile
  ) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: profile.name
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create user document in Firestore
      const userData: Omit<User, 'id'> = {
        email,
        userType,
        status: userType === 'admin' ? 'active' : 'pending',
        profile,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: Timestamp.now()
      });

      setUser({
        id: firebaseUser.uid,
        ...userData
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedProfile = { ...user.profile, ...updates };
      await updateDoc(doc(db, 'users', user.id), {
        profile: updatedProfile
      });
      
      setUser(prev => prev ? { ...prev, profile: updatedProfile } : null);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const refreshUser = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};