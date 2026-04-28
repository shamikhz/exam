'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getTopics, saveTopic as storageSaveTopic, deleteTopic as storageDeleteTopic,
  getQuestions, saveQuestion as storageSaveQuestion, deleteQuestion as storageDeleteQuestion,
  getResults, getUsers, deleteUser as storageDeleteUser,
  type Topic, type Question
} from '@/lib/storage';

export type Tab = 'overview' | 'topics' | 'questions' | 'students';

export function useAdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<Awaited<ReturnType<typeof getResults>>>([]);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getUsers>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTopicView, setSelectedTopicView] = useState('all');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const STUDENTS_PER_PAGE = 50;

  // Modals state
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ name: '', description: '', icon: '📚', difficulty: 'Easy' as Topic['difficulty'] });
  const [topicError, setTopicError] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState({
    topicId: '', text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'topic' | 'question' | 'student'; id: string } | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const [t, q, r, u] = await Promise.all([
      getTopics(),
      getQuestions(),
      getResults(),
      getUsers(),
    ]);
    setTopics(t);
    setQuestions(q);
    setResults(r);
    setUsers(u);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Topic CRUD
  function openTopicForm(topic?: Topic) {
    if (topic) {
      setEditingTopic(topic);
      setTopicForm({ name: topic.name, description: topic.description, icon: topic.icon, difficulty: topic.difficulty });
    } else {
      setEditingTopic(null);
      setTopicForm({ name: '', description: '', icon: '📚', difficulty: 'Easy' });
    }
    setTopicError('');
    setShowTopicForm(true);
  }

  async function handleTopicSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTopicError('');

    if (!topicForm.name.trim()) {
      setTopicError('Topic name is required.');
      return;
    }

    const isDuplicate = topics.some(t =>
      t.name.toLowerCase() === topicForm.name.trim().toLowerCase() &&
      t.id !== editingTopic?.id
    );

    if (isDuplicate) {
      setTopicError(`A topic named "${topicForm.name.trim()}" already exists. Please choose a unique name.`);
      return;
    }

    try {
      const topicData: Partial<Topic> = {
        ...topicForm,
        name: topicForm.name.trim(),
      };
      if (editingTopic) {
        topicData.id = editingTopic.id;
        topicData.createdAt = editingTopic.createdAt;
      }
      await storageSaveTopic(topicData as Topic);
      setShowTopicForm(false);
      await refreshData();
    } catch (err: unknown) {
      console.error('Failed to save topic:', err);
      setTopicError('An unexpected error occurred while saving. Please try again.');
    }
  }

  async function handleDeleteTopic(id: string) {
    await storageDeleteTopic(id);
    setDeleteConfirm(null);
    await refreshData();
  }

  // Question CRUD
  function openQuestionForm(q?: Question) {
    if (q) {
      setEditingQuestion(q);
      setQuestionForm({ topicId: q.topicId, text: q.text, options: [...q.options], correctAnswer: q.correctAnswer, explanation: q.explanation, points: q.points });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        topicId: selectedTopicFilter !== 'all' ? selectedTopicFilter : (topics[0]?.id || ''),
        text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10
      });
    }
    setShowQuestionForm(true);
  }

  async function handleQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQuestionError('');

    // Duplicate check: check if question text already exists in this topic
    const isDuplicate = questions.some(q => 
      q.topicId === questionForm.topicId && 
      q.text.trim().toLowerCase() === questionForm.text.trim().toLowerCase() &&
      q.id !== editingQuestion?.id
    );

    if (isDuplicate) {
      setQuestionError("This question already exists in this topic.");
      return;
    }

    const qData: Partial<Question> = {
      ...questionForm,
    };
    if (editingQuestion) {
      qData.id = editingQuestion.id;
      qData.createdAt = editingQuestion.createdAt;
    }
    await storageSaveQuestion(qData as Question);
    setShowQuestionForm(false);
    await refreshData();
  }

  async function handleDeleteQuestion(id: string) {
    await storageDeleteQuestion(id);
    setDeleteConfirm(null);
    await refreshData();
  }

  async function handleDeleteStudent(id: string) {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete) {
      try {
        await fetch('/api/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userToDelete.email })
        });
      } catch (err) {
        console.error("Failed to delete user from Firebase Auth:", err);
      }
    }
    await storageDeleteUser(id);
    setDeleteConfirm(null);
    await refreshData();
  }

  // Derived Values
  const totalPoints = results.reduce((acc, r) => acc + r.score, 0);
  const avgScore = results.length > 0 ? Math.round(totalPoints / results.length) : 0;
  const passRate = results.length > 0
    ? Math.round((results.filter((r) => (r.score / r.totalPoints) >= 0.6).length / results.length) * 100)
    : 0;

  const filteredQuestions = selectedTopicFilter === 'all'
    ? questions
    : questions.filter((q) => q.topicId === selectedTopicFilter);

  return {
    activeTab, setActiveTab,
    topics, questions, results, users,
    isLoading,
    selectedTopicView, setSelectedTopicView,
    selectedTopicFilter, setSelectedTopicFilter,
    studentSearchQuery, setStudentSearchQuery,
    studentPage, setStudentPage, STUDENTS_PER_PAGE,

    // Topic logic
    showTopicForm, setShowTopicForm, editingTopic, topicForm, setTopicForm, topicError,
    openTopicForm, handleTopicSubmit, handleDeleteTopic,

    // Question logic
    showQuestionForm, setShowQuestionForm, editingQuestion, questionForm, setQuestionForm, questionError,
    openQuestionForm, handleQuestionSubmit, handleDeleteQuestion,

    // Student logic
    handleDeleteStudent,

    // Modals
    deleteConfirm, setDeleteConfirm,

    // Derived
    stats: {
      topicsCount: topics.length,
      questionsCount: questions.length,
      studentsCount: users.filter((u) => u.role === 'student').length,
      examsCount: results.length,
      avgScore,
      passRate
    },
    filteredQuestions
  };
}
