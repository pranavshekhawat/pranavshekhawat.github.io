import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase-config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user profile from Firestore
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Create or update user profile in Firestore
  const createUserProfile = async (uid, data) => {
    try {
      const userRef = doc(db, 'users', uid);
      const existingDoc = await getDoc(userRef);
      
      if (existingDoc.exists()) {
        // Update existing profile
        await setDoc(userRef, {
          ...existingDoc.data(),
          ...data,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        // Create new profile
        await setDoc(userRef, {
          ...data,
          uid,
          plan: 'free', // Default plan
          planExpiry: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Usage limits for free plan
          limits: {
            maxRecipes: 5,
            maxIngredients: 20,
            maxBatches: 10,
          }
        });
      }
      
      await fetchUserProfile(uid);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Create user profile in Firestore
      await createUserProfile(result.user.uid, {
        email,
        displayName,
        authProvider: 'email',
      });
      
      return result.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create/update user profile
      await createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        authProvider: 'google',
      });
      
      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  // Sign out
  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Check if user has valid subscription
  const hasActiveSubscription = () => {
    if (!userProfile) return false;
    if (userProfile.plan === 'free') return true; // Free plan always valid
    if (!userProfile.planExpiry) return false;
    return new Date(userProfile.planExpiry.toDate()) > new Date();
  };

  // Get user's plan limits
  const getPlanLimits = () => {
    const defaultLimits = {
      free: { maxRecipes: 5, maxIngredients: 20, maxBatches: 10 },
      starter: { maxRecipes: 50, maxIngredients: 100, maxBatches: 50 },
      pro: { maxRecipes: -1, maxIngredients: -1, maxBatches: -1 }, // -1 = unlimited
      business: { maxRecipes: -1, maxIngredients: -1, maxBatches: -1 },
    };
    
    const plan = userProfile?.plan || 'free';
    return userProfile?.limits || defaultLimits[plan] || defaultLimits.free;
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logOut,
    resetPassword,
    hasActiveSubscription,
    getPlanLimits,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
