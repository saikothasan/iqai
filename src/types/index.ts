import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Test {
  id: string;
  userId: string;
  testType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  answers: (string | null)[];
  score: number;
  status: 'in-progress' | 'completed';
  duration: number; // in seconds
  completedAt: Timestamp | null;
  createdAt: Timestamp;
}
