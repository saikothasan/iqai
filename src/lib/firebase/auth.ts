'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfileInFirestore, getUserProfile } from './firestore';

export const signUpWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
  return signOut(auth);
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  // Check if user profile already exists before creating a new one
  const userProfile = await getUserProfile(user.uid);
  if (!userProfile) {
    await createUserProfileInFirestore(user.uid, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  }
  return userCredential;
};

export const createUserProfile = async (
  user: User,
  additionalData: { displayName?: string; photoURL?: string }
) => {
  if (!user) return;

  const { displayName, photoURL } = additionalData;

  await createUserProfileInFirestore(user.uid, {
    email: user.email,
    displayName: displayName || user.displayName,
    photoURL: photoURL || user.photoURL,
  });
};
