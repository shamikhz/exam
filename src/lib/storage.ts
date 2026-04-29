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
  query, where, limit, writeBatch, getCountFromServer,
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

export async function finalizeSocialLogin(firebaseUser: any, role: 'admin' | 'student'): Promise<AuthState> {
  const email = firebaseUser.email || `${firebaseUser.uid}@social.examapp.com`;
  const normalised = email.toLowerCase().trim();

  const q = query(usersCol(), where('email', '==', normalised));
  const snap = await getDocs(q);

  let finalUser: User;

  if (snap.empty) {
    // Create new user in Firestore
    finalUser = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || normalised.split('@')[0],
      email: normalised,
      role,
      avatar: firebaseUser.photoURL || undefined,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', finalUser.id), finalUser);
  } else {
    finalUser = snap.docs[0].data() as User;
    // Update role if it's a new login to a different role? 
    // Usually, we should stick to the stored role to avoid hijacking.
  }

  const authState: AuthState = {
    userId: finalUser.id,
    role: finalUser.role,
    name: finalUser.name,
    email: finalUser.email,
    avatar: finalUser.avatar,
  };
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
  const topicsSnap = await getDocs(topicsCol());

  const topicsWithCounts = await Promise.all(
    topicsSnap.docs.map(async (d) => {
      const topic = d.data() as Topic;
      const q = query(questionsCol(), where('topicId', '==', topic.id));
      const countSnap = await getCountFromServer(q);
      return {
        ...topic,
        questionCount: countSnap.data().count,
      };
    })
  );
  return topicsWithCounts;
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
  const qQuestions = query(questionsCol(), where('topicId', '==', id));
  const snapQuestions = await getDocs(qQuestions);

  // Cascade: delete all results for this topic
  const qResults = query(resultsCol(), where('topicId', '==', id));
  const snapResults = await getDocs(qResults);

  const batch = writeBatch(db);
  snapQuestions.docs.forEach(d => batch.delete(d.ref));
  snapResults.docs.forEach(d => batch.delete(d.ref));
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
  if (question.options && question.correctAnswer !== undefined) {
    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      throw new Error("Invalid correct answer index.");
    }
  }

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

export async function saveQuestionsBatch(questions: Question[]): Promise<void> {
  const batch = writeBatch(db);
  questions.forEach((q) => {
    const docRef = doc(db, 'questions', q.id);
    batch.set(docRef, q);
  });
  await batch.commit();
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
  // Validate and compute score server-side
  if (!result.topicId || !result.answers) {
    throw new Error("Missing required fields for saving result.");
  }

  const questions = await getQuestionsByTopic(result.topicId);
  let computedScore = 0;
  let computedTotal = 0;

  questions.forEach((q, i) => {
    computedTotal += q.points;
    if (result.answers![i] === q.correctAnswer) {
      computedScore += q.points;
    }
  });

  const finalResult: Partial<ExamResult> = {
    ...result,
    score: computedScore,
    totalPoints: computedTotal,
  };

  if (!finalResult.id) {
    const newDoc = doc(resultsCol());
    const fullResult: ExamResult = {
      ...finalResult as ExamResult,
      id: newDoc.id,
      completedAt: new Date().toISOString()
    };
    await setDoc(newDoc, fullResult);
    return fullResult;
  } else {
    await setDoc(doc(db, 'results', finalResult.id), finalResult as ExamResult);
    return finalResult as ExamResult;
  }
}

export async function deleteResult(id: string): Promise<void> {
  await deleteDoc(doc(db, 'results', id));
}

// ============================
// HELPERS
// ============================

// (getNextSequentialId removed for production scalability)

