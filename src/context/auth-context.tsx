
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { initializeUserData, updateUserLastLogin } from '@/services/firestoreService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signUp: (email: string, pass: string) => Promise<User | AuthError>;
  signIn: (email: string, pass: string) => Promise<User | AuthError>;
  signOut: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseConfigured: false,
  signUp: async () => new Promise(() => {}),
  signIn: async () => new Promise(() => {}),
  signOut: async () => {},
  resendVerificationEmail: async () => ({ success: false, error: "Not implemented" }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseConfigured = !!auth;

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // No need to run these on every state change, only on signup/signin.
          // Let's move them there to be more efficient.
        }
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase auth state error:', error);
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);
  
  const signUp = async (email: string, password: string): Promise<User | AuthError> => {
    if (!auth) return { code: 'auth/configuration-not-set', message: 'Firebase is not configured.'} as AuthError;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      await sendEmailVerification(newUser);
      await initializeUserData(newUser.uid, newUser.email);
      return newUser;
    } catch (error) {
      return error as AuthError;
    }
  };
  
  const signIn = async (email: string, password: string): Promise<User | AuthError> => {
    if (!auth) return { code: 'auth/configuration-not-set', message: 'Firebase is not configured.'} as AuthError;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateUserLastLogin(userCredential.user.uid);
      }
      return userCredential.user;
    } catch (error) {
      return error as AuthError;
    }
  }

  const signOut = async (): Promise<void> => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth?.currentUser) {
      return { success: false, error: "You are not logged in." };
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      console.error("Error resending verification email:", authError);
      let message = "An unknown error occurred.";
      if (authError.code === 'auth/too-many-requests') {
        message = "You've requested this too many times recently. Please wait a bit before trying again.";
      }
      return { success: false, error: message };
    }
  };

  const value = { user, loading, signUp, signIn, signOut, isFirebaseConfigured, resendVerificationEmail };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
