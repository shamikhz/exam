'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getTopics, saveTopic as storageSaveTopic, deleteTopic as storageDeleteTopic,
  getQuestions, saveQuestion as storageSaveQuestion, deleteQuestion as storageDeleteQuestion,
  getResults, getUsers, deleteUser as storageDeleteUser,
  generateId,
  type Topic, type Question
} from '@/lib/storage';

export type Tab = 'overview' | 'topics' | 'questions' | 'students';

export function useAdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<ReturnType<typeof getResults>>([]);
  const [users, setUsers] = useState<ReturnType<typeof getUsers>>([]);
  
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

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState({
    topicId: '', text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'topic' | 'question' | 'student'; id: string } | null>(null);

  const refreshData = useCallback(() => {
    setTopics(getTopics());
    setQuestions(getQuestions());
    setResults(getResults());
    setUsers(getUsers());
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

  function handleTopicSubmit(e: React.FormEvent) {
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
      const topic: Topic = {
        id: editingTopic?.id || generateId('topic'),
        name: topicForm.name.trim(),
        description: topicForm.description,
        icon: topicForm.icon,
        difficulty: topicForm.difficulty,
        createdAt: editingTopic?.createdAt || new Date().toISOString(),
      };
      storageSaveTopic(topic);
      setShowTopicForm(false);
      refreshData();
    } catch (err: any) {
      console.error('Failed to save topic:', err);
      if (err.name === 'QuotaExceededError' || err.message?.includes('quota')) {
        setTopicError('Storage limit reached. Try using a smaller image icon.');
      } else {
        setTopicError('An unexpected error occurred while saving. Please try again.');
      }
    }
  }

  function handleDeleteTopic(id: string) {
    storageDeleteTopic(id);
    setDeleteConfirm(null);
    refreshData();
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

  function handleQuestionSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q: Question = {
      id: editingQuestion?.id || generateId('q'),
      topicId: questionForm.topicId,
      text: questionForm.text,
      options: questionForm.options,
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation,
      points: questionForm.points,
      createdAt: editingQuestion?.createdAt || new Date().toISOString(),
    };
    storageSaveQuestion(q);
    setShowQuestionForm(false);
    refreshData();
  }

  function handleDeleteQuestion(id: string) {
    storageDeleteQuestion(id);
    setDeleteConfirm(null);
    refreshData();
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
        console.error("Failed to delete user from Firebase:", err);
      }
    }
    storageDeleteUser(id);
    setDeleteConfirm(null);
    refreshData();
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
    selectedTopicView, setSelectedTopicView,
    selectedTopicFilter, setSelectedTopicFilter,
    studentSearchQuery, setStudentSearchQuery,
    studentPage, setStudentPage, STUDENTS_PER_PAGE,
    
    // Topic logic
    showTopicForm, setShowTopicForm, editingTopic, topicForm, setTopicForm, topicError,
    openTopicForm, handleTopicSubmit, handleDeleteTopic,
    
    // Question logic
    showQuestionForm, setShowQuestionForm, editingQuestion, questionForm, setQuestionForm,
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
