/**
 * User Data Helper
 * 
 * Provides utilities for accessing user-scoped data in Firestore.
 * Each user's data is stored under: users/{userId}/{collection}
 * 
 * This ensures complete data isolation between users.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase-config';

/**
 * Get the current user's ID
 * @throws Error if user is not authenticated
 */
export const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

/**
 * Get a reference to a user's subcollection
 * Path: users/{userId}/{collectionName}
 */
export const getUserCollection = (collectionName) => {
  const userId = getCurrentUserId();
  return collection(db, 'users', userId, collectionName);
};

/**
 * Get a reference to a specific document in a user's subcollection
 * Path: users/{userId}/{collectionName}/{docId}
 */
export const getUserDoc = (collectionName, docId) => {
  const userId = getCurrentUserId();
  return doc(db, 'users', userId, collectionName, docId);
};

/**
 * Add a document to a user's subcollection
 */
export const addUserDoc = async (collectionName, data) => {
  const colRef = getUserCollection(collectionName);
  return addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Update a document in a user's subcollection
 */
export const updateUserDoc = async (collectionName, docId, data) => {
  const docRef = getUserDoc(collectionName, docId);
  return updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a document from a user's subcollection
 */
export const deleteUserDoc = async (collectionName, docId) => {
  const docRef = getUserDoc(collectionName, docId);
  return deleteDoc(docRef);
};

/**
 * Get all documents from a user's subcollection
 */
export const getUserDocs = async (collectionName) => {
  const colRef = getUserCollection(collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get a single document from a user's subcollection
 */
export const getSingleUserDoc = async (collectionName, docId) => {
  const docRef = getUserDoc(collectionName, docId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
};

/**
 * Subscribe to real-time updates on a user's subcollection
 * Returns unsubscribe function
 */
export const subscribeToUserCollection = (collectionName, callback, queryConstraints = []) => {
  try {
    const colRef = getUserCollection(collectionName);
    const q = queryConstraints.length > 0 
      ? query(colRef, ...queryConstraints) 
      : colRef;
    
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(docs);
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
      callback([]);
    });
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}:`, error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Subscribe to a single document in a user's subcollection
 */
export const subscribeToUserDoc = (collectionName, docId, callback) => {
  try {
    const docRef = getUserDoc(collectionName, docId);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error(`Error subscribing to document:`, error);
    return () => {};
  }
};

// Export query helpers
export { query, where, orderBy, limit };

/**
 * Collection names used in Soap Lab
 */
export const COLLECTIONS = {
  RECIPES: 'recipes',
  INGREDIENTS: 'ingredients',
  BATCHES: 'batches',
  SALES: 'sales',
  NOTIFICATIONS: 'notifications',
  NOTES: 'notes',
  SETTINGS: 'settings',
};

export default {
  getCurrentUserId,
  getUserCollection,
  getUserDoc,
  addUserDoc,
  updateUserDoc,
  deleteUserDoc,
  getUserDocs,
  getSingleUserDoc,
  subscribeToUserCollection,
  subscribeToUserDoc,
  COLLECTIONS,
};
