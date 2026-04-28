// =============================================
// Firestore Utility - Online Exam Platform
// =============================================
// All data (users, topics, questions, results) lives in Firestore.
// The active SESSION (who is logged in) still uses localStorage for speed.
// Admin credentials (admin@examapp.com / admin123) are seeded on first boot
// and NEVER modified.
// =============================================

import {
  collection, doc,
  getDocs, getDoc, setDoc, deleteDoc, updateDoc,
  query, where, limit, writeBatch,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { db, auth } from "@/lib/firebase";

// ---- Types ----
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only stored for admin; students use Firebase Auth
  role: 'admin' | 'student';
  createdAt: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar?: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  topicId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  createdAt: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  topicId: string;
  score: number;
  totalPoints: number;
  answers: number[];
  timeTaken: number;
  completedAt: string;
}

export interface AuthState {
  userId: string;
  role: 'admin' | 'student';
  name: string;
  email: string;
  avatar?: string;
}

// ---- Auth session key (localStorage, not Firestore) ----
const AUTH_KEY = 'exam_auth';

// ---- Collection refs ----
const usersCol = () => collection(db, 'users');
const topicsCol = () => collection(db, 'topics');
const questionsCol = () => collection(db, 'questions');
const resultsCol = () => collection(db, 'results');

const SEEDED_KEY = 'exam_db_seeded';

// ---- Seed default data on first boot ----
export async function seedDefaultData(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Optimized: check local flag first to skip all network requests
  if (localStorage.getItem(SEEDED_KEY)) return;

  // Always ensure demo Firebase Auth accounts exist
  const demoAccounts = [
    { email: 'admin@examapp.com',   password: 'admin123'   },
    { email: 'student@examapp.com', password: 'student123' },
  ];
  for (const { email, password } of demoAccounts) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch {
      // auth/email-already-in-use → already in Firebase Auth
    }
  }

  // Seed Firestore only once
  try {
    const q = query(usersCol(), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      localStorage.setItem(SEEDED_KEY, 'true');
      return;
    }

    // Admin profile
    await setDoc(doc(db, 'users', 'admin-1'), {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@examapp.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
    } as User);

    // Demo student profile
    await setDoc(doc(db, 'users', 'student-1'), {
      id: 'student-1',
      name: 'John Student',
      email: 'student@examapp.com',
      role: 'student',
      createdAt: new Date().toISOString(),
    } as User);

    // Seed topics
    const defaultTopics: Topic[] = [
      { id: 'topic-1', name: 'JavaScript Fundamentals', description: 'Core concepts of JavaScript including variables, functions, and closures.', icon: '⚡', difficulty: 'Easy', createdAt: new Date().toISOString() },
      { id: 'topic-2', name: 'React & Next.js', description: 'Modern React patterns, hooks, and Next.js App Router.', icon: '⚛️', difficulty: 'Medium', createdAt: new Date().toISOString() },
      { id: 'topic-3', name: 'Data Structures', description: 'Arrays, linked lists, trees, graphs, and algorithm complexity.', icon: '🧮', difficulty: 'Hard', createdAt: new Date().toISOString() },
    ];
    for (const t of defaultTopics) {
      await setDoc(doc(db, 'topics', t.id), t);
    }

    // Seed questions
    const defaultQuestions: Question[] = [
      { id: 'q-1', topicId: 'topic-1', text: 'Which keyword declares a block-scoped variable in JavaScript?', options: ['var', 'let', 'const', 'Both let and const'], correctAnswer: 3, explanation: 'Both `let` and `const` are block-scoped. `var` is function-scoped.', points: 10, createdAt: new Date().toISOString() },
      { id: 'q-2', topicId: 'topic-1', text: 'What does `typeof null` return?', options: ['null', 'undefined', 'object', 'string'], correctAnswer: 2, explanation: '`typeof null` returns "object" — a known historical quirk in JavaScript.', points: 10, createdAt: new Date().toISOString() },
      { id: 'q-3', topicId: 'topic-1', text: 'Which method is used to remove the last element from an array?', options: ['shift()', 'pop()', 'splice()', 'slice()'], correctAnswer: 1, explanation: '`pop()` removes and returns the last element of an array.', points: 10, createdAt: new Date().toISOString() },
      { id: 'q-4', topicId: 'topic-2', text: 'Which React hook is used to perform side effects?', options: ['useState', 'useEffect', 'useContext', 'useRef'], correctAnswer: 1, explanation: '`useEffect` is used for side effects like data fetching and subscriptions.', points: 10, createdAt: new Date().toISOString() },
      { id: 'q-5', topicId: 'topic-2', text: 'In Next.js App Router, pages are Server Components by default.', options: ['True', 'False', 'Only in production', 'Only with TypeScript'], correctAnswer: 0, explanation: 'Pages are Server Components by default. Add `"use client"` to opt-in to Client Components.', points: 10, createdAt: new Date().toISOString() },
      { id: 'q-6', topicId: 'topic-3', text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctAnswer: 2, explanation: 'Binary search halves the search space each iteration, giving O(log n) complexity.', points: 15, createdAt: new Date().toISOString() },
    ];
    for (const q of defaultQuestions) {
      await setDoc(doc(db, 'questions', q.id), q);
    }
    localStorage.setItem(SEEDED_KEY, 'true');
  } catch (err) {
    console.warn("Skipping Firestore seeding (likely blocked by security rules):", err);
  }
}

// ============================
// USERS
// ============================

export async function getUsers(): Promise<User[]> {
  const snap = await getDocs(usersCol());
  return snap.docs.map(d => d.data() as User);
}

export async function checkUserExists(email: string): Promise<boolean> {
  const q = query(usersCol(), where('email', '==', email.toLowerCase().trim()), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function saveUser(user: User): Promise<void> {
  await setDoc(doc(db, 'users', user.id), user);
}

export async function deleteUser(id: string): Promise<void> {
  // Delete user document
  await deleteDoc(doc(db, 'users', id));
  // Cascade: delete all their exam results
  const q = query(resultsCol(), where('studentId', '==', id));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function updateUserProfile(data: Partial<User>): Promise<AuthState | null> {
  const auth = getCurrentUser();
  if (!auth) return null;

  const userRef = doc(db, 'users', auth.userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;

  // Merge new data on top of existing doc
  const updated: User = { ...snap.data() as User, ...data };

  // Strip undefined values — Firestore rejects them and they can wipe optional fields
  const sanitised = Object.fromEntries(
    Object.entries(updated).filter(([, v]) => v !== undefined)
  ) as User;

  // updateDoc only writes the provided keys, preserving all other stored fields
  await updateDoc(userRef, sanitised as Partial<User>);

  const updatedAuth: AuthState = {
    ...auth,
    name: sanitised.name,
    email: sanitised.email,
    avatar: sanitised.avatar,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(updatedAuth));
  return updatedAuth;
}

// ============================
// AUTH (session in localStorage, data in Firestore)
// ============================

export async function loginAny(email: string, password: string): Promise<AuthState | null> {
  const normalised = email.toLowerCase().trim();

  // Authenticate via Firebase Auth (works for both admin and student)
  try {
    await signInWithEmailAndPassword(auth, normalised, password);
  } catch {
    return null; // Wrong password or user not found
  }

  // Fetch Firestore profile to get role, name, avatar
  const q = query(usersCol(), where('email', '==', normalised));
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const user = snap.docs[0].data() as User;

  const authState: AuthState = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
  return authState;
}

export async function loginWithoutPassword(email: string): Promise<AuthState | null> {
  const q = query(usersCol(), where('email', '==', email.toLowerCase().trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const user = snap.docs[0].data() as User;
  const authState: AuthState = { userId: user.id, role: user.role, name: user.name, email: user.email, avatar: user.avatar };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
  return authState;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'student'
): Promise<AuthState | string> {
  const normalised = email.toLowerCase().trim();

  // Check Firestore for existing profile
  const q = query(usersCol(), where('email', '==', normalised));
  const snap = await getDocs(q);
  if (!snap.empty) return 'An account with this email already exists.';

  // Create account in Firebase Auth for ALL roles
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, normalised, password);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists.';
    }
    return 'Failed to create account. Please try again.';
  }

  // Store profile in Firestore — use the Firebase Auth UID as the document ID
  const newUser: User = {
    id: userCredential.user.uid,
    name: name.trim(),
    email: normalised,
    role,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', newUser.id), newUser);

  const authState: AuthState = {
    userId: newUser.id,
    role: newUser.role,
    name: newUser.name,
    email: newUser.email,
    avatar: newUser.avatar,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
  return authState;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): AuthState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as AuthState;
}

// ============================
// TOPICS
// ============================

export async function getTopics(): Promise<Topic[]> {
  const [topicsSnap, questionsSnap] = await Promise.all([
    getDocs(topicsCol()),
    getDocs(questionsCol()),
  ]);
  const allQuestions = questionsSnap.docs.map(d => d.data() as Question);
  return topicsSnap.docs.map(d => {
    const topic = d.data() as Topic;
    return {
      ...topic,
      questionCount: allQuestions.filter(q => q.topicId === topic.id).length,
    };
  });
}

export async function saveTopic(topic: Partial<Topic> & { name: string }): Promise<Topic> {
  if (!topic.id) {
    const newDoc = doc(topicsCol());
    const fullTopic: Topic = {
      ...topic as Topic,
      id: newDoc.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(newDoc, fullTopic);
    return fullTopic;
  } else {
    await setDoc(doc(db, 'topics', topic.id), topic as Topic);
    return topic as Topic;
  }
}

export async function deleteTopic(id: string): Promise<void> {
  await deleteDoc(doc(db, 'topics', id));
  // Cascade: delete all questions for this topic
  const q = query(questionsCol(), where('topicId', '==', id));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

// ============================
// QUESTIONS
// ============================

export async function getQuestions(): Promise<Question[]> {
  const snap = await getDocs(questionsCol());
  return snap.docs.map(d => d.data() as Question);
}

export async function getQuestionsByTopic(topicId: string): Promise<Question[]> {
  const q = query(questionsCol(), where('topicId', '==', topicId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Question);
}

export async function saveQuestion(question: Partial<Question> & { topicId: string }): Promise<Question> {
  // 1. Server-side duplicate check (as second line of defense)
  if (!question.id && question.text) {
    const q = query(
      questionsCol(), 
      where('topicId', '==', question.topicId),
      where('text', '==', question.text.trim())
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error("This question already exists in this topic.");
    }
  }

  // 2. Save logic
  if (!question.id) {
    const newDoc = doc(questionsCol());
    const fullQuestion: Question = {
      ...question as Question,
      id: newDoc.id,
      createdAt: new Date().toISOString()
    };
    await setDoc(newDoc, fullQuestion);
    return fullQuestion;
  } else {
    await setDoc(doc(db, 'questions', question.id), question as Question);
    return question as Question;
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, 'questions', id));
}

// ============================
// RESULTS
// ============================

export async function getResults(): Promise<ExamResult[]> {
  const snap = await getDocs(resultsCol());
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as ExamResult));
}

export async function getResultsByStudent(studentId: string): Promise<ExamResult[]> {
  const q = query(resultsCol(), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as ExamResult));
}

export async function saveResult(result: Partial<ExamResult>): Promise<ExamResult> {
  if (!result.id) {
    const newDoc = doc(resultsCol());
    const fullResult: ExamResult = {
      ...result as ExamResult,
      id: newDoc.id,
      completedAt: new Date().toISOString()
    };
    await setDoc(newDoc, fullResult);
    return fullResult;
  } else {
    await setDoc(doc(db, 'results', result.id), result as ExamResult);
    return result as ExamResult;
  }
}

export async function deleteResult(id: string): Promise<void> {
  await deleteDoc(doc(db, 'results', id));
}

// ============================
// HELPERS
// ============================

// (getNextSequentialId removed for production scalability)

