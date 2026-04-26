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
  getDocs, getDoc, setDoc, addDoc, deleteDoc, updateDoc,
  query, where, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ---- Types ----
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
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

// ---- Seed default data on first boot ----
export async function seedDefaultData(): Promise<void> {
  if (typeof window === 'undefined') return;

  const snap = await getDocs(usersCol());
  if (!snap.empty) return; // already seeded

  // Seed admin (credentials NEVER change)
  const adminUser: User = {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@examapp.com',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', adminUser.id), adminUser);

  // Seed demo student
  const demoStudent: User = {
    id: 'student-001',
    name: 'John Student',
    email: 'student@examapp.com',
    password: 'student123',
    role: 'student',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', demoStudent.id), demoStudent);

  // Seed topics
  const defaultTopics: Topic[] = [
    { id: 'topic-001', name: 'JavaScript Fundamentals', description: 'Core concepts of JavaScript including variables, functions, and closures.', icon: '⚡', difficulty: 'Easy', createdAt: new Date().toISOString() },
    { id: 'topic-002', name: 'React & Next.js', description: 'Modern React patterns, hooks, and Next.js App Router.', icon: '⚛️', difficulty: 'Medium', createdAt: new Date().toISOString() },
    { id: 'topic-003', name: 'Data Structures', description: 'Arrays, linked lists, trees, graphs, and algorithm complexity.', icon: '🧮', difficulty: 'Hard', createdAt: new Date().toISOString() },
  ];
  for (const t of defaultTopics) {
    await setDoc(doc(db, 'topics', t.id), t);
  }

  // Seed questions
  const defaultQuestions: Question[] = [
    { id: 'q-001', topicId: 'topic-001', text: 'Which keyword declares a block-scoped variable in JavaScript?', options: ['var', 'let', 'const', 'Both let and const'], correctAnswer: 3, explanation: 'Both `let` and `const` are block-scoped. `var` is function-scoped.', points: 10, createdAt: new Date().toISOString() },
    { id: 'q-002', topicId: 'topic-001', text: 'What does `typeof null` return?', options: ['null', 'undefined', 'object', 'string'], correctAnswer: 2, explanation: '`typeof null` returns "object" — a known historical quirk in JavaScript.', points: 10, createdAt: new Date().toISOString() },
    { id: 'q-003', topicId: 'topic-001', text: 'Which method is used to remove the last element from an array?', options: ['shift()', 'pop()', 'splice()', 'slice()'], correctAnswer: 1, explanation: '`pop()` removes and returns the last element of an array.', points: 10, createdAt: new Date().toISOString() },
    { id: 'q-004', topicId: 'topic-002', text: 'Which React hook is used to perform side effects?', options: ['useState', 'useEffect', 'useContext', 'useRef'], correctAnswer: 1, explanation: '`useEffect` is used for side effects like data fetching and subscriptions.', points: 10, createdAt: new Date().toISOString() },
    { id: 'q-005', topicId: 'topic-002', text: 'In Next.js App Router, pages are Server Components by default.', options: ['True', 'False', 'Only in production', 'Only with TypeScript'], correctAnswer: 0, explanation: 'Pages are Server Components by default. Add `"use client"` to opt-in to Client Components.', points: 10, createdAt: new Date().toISOString() },
    { id: 'q-006', topicId: 'topic-003', text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctAnswer: 2, explanation: 'Binary search halves the search space each iteration, giving O(log n) complexity.', points: 15, createdAt: new Date().toISOString() },
  ];
  for (const q of defaultQuestions) {
    await setDoc(doc(db, 'questions', q.id), q);
  }
}

// ============================
// USERS
// ============================

export async function getUsers(): Promise<User[]> {
  const snap = await getDocs(usersCol());
  return snap.docs.map(d => d.data() as User);
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

  const updated = { ...snap.data() as User, ...data };
  await setDoc(userRef, updated);

  const updatedAuth: AuthState = {
    ...auth,
    name: updated.name,
    email: updated.email,
    avatar: updated.avatar,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(updatedAuth));
  return updatedAuth;
}

// ============================
// AUTH (session in localStorage, data in Firestore)
// ============================

export async function loginAny(email: string, password: string): Promise<AuthState | null> {
  const q = query(usersCol(), where('email', '==', email.toLowerCase().trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const user = snap.docs[0].data() as User;
  if (user.password !== password) return null;
  const authState: AuthState = { userId: user.id, role: user.role, name: user.name, email: user.email, avatar: user.avatar };
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
  const q = query(usersCol(), where('email', '==', email.toLowerCase().trim()));
  const snap = await getDocs(q);
  if (!snap.empty) return 'An account with this email already exists.';

  const newUser: User = {
    id: generateId(role),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', newUser.id), newUser);

  const authState: AuthState = { userId: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email, avatar: newUser.avatar };
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

export async function saveTopic(topic: Topic): Promise<void> {
  await setDoc(doc(db, 'topics', topic.id), topic);
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

export async function saveQuestion(question: Question): Promise<void> {
  await setDoc(doc(db, 'questions', question.id), question);
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

export async function saveResult(result: ExamResult): Promise<void> {
  // Use result.id as document id if provided, else let Firestore generate
  if (result.id) {
    await setDoc(doc(db, 'results', result.id), result);
  } else {
    const ref = await addDoc(resultsCol(), result);
    result.id = ref.id;
  }
}

export async function deleteResult(id: string): Promise<void> {
  await deleteDoc(doc(db, 'results', id));
}

// ============================
// HELPERS
// ============================

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}
