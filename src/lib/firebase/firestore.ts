import { db } from './config';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Test, UserProfile } from '@/types';

// Create user profile
export const createUserProfileInFirestore = async (
  uid: string,
  data: { email: string | null; displayName: string | null; photoURL: string | null }
) => {
  const userRef = doc(db, 'users', uid);
  const userProfile: UserProfile = {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    createdAt: serverTimestamp() as Timestamp,
  };
  await setDoc(userRef, userProfile);
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

// Create a new test
export const createTest = async (userId: string, testType: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<string> => {
  const testsCollection = collection(db, 'tests');
  const testData = {
    userId,
    testType,
    difficulty,
    questions: [],
    answers: [],
    score: 0,
    status: 'in-progress',
    duration: 0,
    completedAt: null,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(testsCollection, testData);
  return docRef.id;
};

// Get a single test
export const getTest = async (testId: string): Promise<Test | null> => {
  const testRef = doc(db, 'tests', testId);
  const testSnap = await getDoc(testRef);
  if (testSnap.exists()) {
    return { id: testSnap.id, ...testSnap.data() } as Test;
  }
  return null;
};

// Update a test
export const updateTest = async (testId: string, data: Partial<Test>) => {
  const testRef = doc(db, 'tests', testId);
  await updateDoc(testRef, data);
};


// Get all tests for a user
export const getUserTests = async (userId: string): Promise<Test[]> => {
  const testsCollection = collection(db, 'tests');
  const q = query(testsCollection, where('userId', '==', userId), where('status', '==', 'completed'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Test));
};
