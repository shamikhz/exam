// =============================================
// LocalStorage Utility - Online Exam Platform
// =============================================

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

// ---- Keys ----
const KEYS = {
  USERS: 'exam_users',
  TOPICS: 'exam_topics',
  QUESTIONS: 'exam_questions',
  RESULTS: 'exam_results',
  AUTH: 'exam_auth',
};

// ---- Seed default data if empty ----
export function seedDefaultData() {
  if (typeof window === 'undefined') return;

  const users = getUsers();
  if (users.length === 0) {
    const defaultUsers: User[] = [
      {
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@examapp.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'student-001',
        name: 'John Student',
        email: 'student@examapp.com',
        password: 'student123',
        role: 'student',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
  }

  const topics = getTopics();
  if (topics.length === 0) {
    const defaultTopics: Topic[] = [
      {
        id: 'topic-001',
        name: 'JavaScript Fundamentals',
        description: 'Core concepts of JavaScript including variables, functions, and closures.',
        icon: '⚡',
        difficulty: 'Easy',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'topic-002',
        name: 'React & Next.js',
        description: 'Modern React patterns, hooks, and Next.js App Router.',
        icon: '⚛️',
        difficulty: 'Medium',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'topic-003',
        name: 'Data Structures',
        description: 'Arrays, linked lists, trees, graphs, and algorithm complexity.',
        icon: '🧮',
        difficulty: 'Hard',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(KEYS.TOPICS, JSON.stringify(defaultTopics));
  }

  const questions = getQuestions();
  if (questions.length === 0) {
    const defaultQuestions: Question[] = [
      {
        id: 'q-001',
        topicId: 'topic-001',
        text: 'Which keyword declares a block-scoped variable in JavaScript?',
        options: ['var', 'let', 'const', 'Both let and const'],
        correctAnswer: 3,
        explanation: 'Both `let` and `const` are block-scoped. `var` is function-scoped.',
        points: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'q-002',
        topicId: 'topic-001',
        text: 'What does `typeof null` return?',
        options: ['null', 'undefined', 'object', 'string'],
        correctAnswer: 2,
        explanation: '`typeof null` returns "object" — a known historical quirk in JavaScript.',
        points: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'q-003',
        topicId: 'topic-001',
        text: 'Which method is used to remove the last element from an array?',
        options: ['shift()', 'pop()', 'splice()', 'slice()'],
        correctAnswer: 1,
        explanation: '`pop()` removes and returns the last element of an array.',
        points: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'q-004',
        topicId: 'topic-002',
        text: 'Which React hook is used to perform side effects?',
        options: ['useState', 'useEffect', 'useContext', 'useRef'],
        correctAnswer: 1,
        explanation: '`useEffect` is used for side effects like data fetching and subscriptions.',
        points: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'q-005',
        topicId: 'topic-002',
        text: 'In Next.js 15 App Router, pages are Server Components by default.',
        options: ['True', 'False', 'Only in production', 'Only with TypeScript'],
        correctAnswer: 0,
        explanation: 'Pages are Server Components by default. Add `"use client"` to opt-in to Client Components.',
        points: 10,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'q-006',
        topicId: 'topic-003',
        text: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
        correctAnswer: 2,
        explanation: 'Binary search halves the search space each iteration, giving O(log n) complexity.',
        points: 15,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(defaultQuestions));
  }
}

// ---- Users ----
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
}

export function saveUser(user: User): void {
  const users = getUsers();
  const existing = users.findIndex((u) => u.id === user.id);
  if (existing >= 0) users[existing] = user;
  else users.push(user);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function deleteUser(id: string): void {
  const users = getUsers().filter((u) => u.id !== id);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

// ---- Topics ----
export function getTopics(): Topic[] {
  if (typeof window === 'undefined') return [];
  const topics = JSON.parse(localStorage.getItem(KEYS.TOPICS) || '[]') as Topic[];
  const questions = getQuestions();
  return topics.map((t) => ({
    ...t,
    questionCount: questions.filter((q) => q.topicId === t.id).length,
  }));
}

export function saveTopic(topic: Topic): void {
  const topics = JSON.parse(localStorage.getItem(KEYS.TOPICS) || '[]') as Topic[];
  const existing = topics.findIndex((t) => t.id === topic.id);
  if (existing >= 0) topics[existing] = topic;
  else topics.push(topic);
  localStorage.setItem(KEYS.TOPICS, JSON.stringify(topics));
}

export function deleteTopic(id: string): void {
  const topics = JSON.parse(localStorage.getItem(KEYS.TOPICS) || '[]') as Topic[];
  localStorage.setItem(KEYS.TOPICS, JSON.stringify(topics.filter((t) => t.id !== id)));
  const questions = getQuestions().filter((q) => q.topicId !== id);
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
}

// ---- Questions ----
export function getQuestions(): Question[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(KEYS.QUESTIONS) || '[]');
}

export function getQuestionsByTopic(topicId: string): Question[] {
  return getQuestions().filter((q) => q.topicId === topicId);
}

export function saveQuestion(question: Question): void {
  const questions = getQuestions();
  const existing = questions.findIndex((q) => q.id === question.id);
  if (existing >= 0) questions[existing] = question;
  else questions.push(question);
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
}

export function deleteQuestion(id: string): void {
  const questions = getQuestions().filter((q) => q.id !== id);
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
}

// ---- Exam Results ----
export function getResults(): ExamResult[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(KEYS.RESULTS) || '[]');
}

export function getResultsByStudent(studentId: string): ExamResult[] {
  return getResults().filter((r) => r.studentId === studentId);
}

export function saveResult(result: ExamResult): void {
  const results = getResults();
  results.push(result);
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
}

// ---- Auth ----
export function login(role: 'admin' | 'student', email: string, password: string): AuthState | null {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password && u.role === role);
  if (!user) return null;
  const auth: AuthState = { 
    userId: user.id, 
    role: user.role, 
    name: user.name, 
    email: user.email,
    avatar: user.avatar 
  };
  localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
  return auth;
}

/** Login without role restriction — matches any role */
export function loginAny(email: string, password: string): AuthState | null {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  const auth: AuthState = { 
    userId: user.id, 
    role: user.role, 
    name: user.name, 
    email: user.email,
    avatar: user.avatar 
  };
  localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
  return auth;
}

/** Register a new user. Returns AuthState on success or error string on failure. */
export function register(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'student'
): AuthState | string {
  const users = getUsers();
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return 'An account with this email already exists.';
  const newUser: User = {
    id: generateId(role),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  const auth: AuthState = { 
    userId: newUser.id, 
    role: newUser.role, 
    name: newUser.name, 
    email: newUser.email,
    avatar: newUser.avatar 
  };
  localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
  return auth;
}

export function logout(): void {
  localStorage.removeItem(KEYS.AUTH);
}

export function updateUserProfile(data: Partial<User>): AuthState | null {
  const auth = getCurrentUser();
  if (!auth) return null;

  const users = getUsers();
  const idx = users.findIndex((u) => u.id === auth.userId);
  if (idx === -1) return null;

  const updatedUser = { ...users[idx], ...data };
  users[idx] = updatedUser;
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));

  // Sync auth state
  const updatedAuth: AuthState = {
    ...auth,
    name: updatedUser.name,
    email: updatedUser.email,
    avatar: updatedUser.avatar,
  };
  localStorage.setItem(KEYS.AUTH, JSON.stringify(updatedAuth));
  return updatedAuth;
}

export function getCurrentUser(): AuthState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.AUTH);
  if (!raw) return null;
  return JSON.parse(raw) as AuthState;
}

// ---- Helpers ----
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}
