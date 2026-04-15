'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getTopics, 
  getResultsByStudent, 
  deleteResult as storageDeleteResult,
  getQuestionsByTopic,
  saveResult,
  generateId,
  type Topic, 
  type ExamResult,
  type Question
} from '@/lib/storage';

export type View = 'dashboard' | 'exam' | 'review';

export function useStudentDashboard(userId: string) {
  const [view, setView] = useState<View>('dashboard');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [myResults, setMyResults] = useState<ExamResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultsPage, setResultsPage] = useState(1);
  const RESULTS_PER_PAGE = 5;

  const refreshData = useCallback((uid: string) => {
    setTopics(getTopics());
    setMyResults(getResultsByStudent(uid));
  }, []);

  useEffect(() => {
    if (userId) {
      refreshData(userId);
    }
  }, [userId, refreshData]);

  function handleDeleteResult(id: string) {
    if (window.confirm('Are you sure you want to delete this result? This cannot be undone.')) {
      storageDeleteResult(id);
      refreshData(userId);
      
      const totalAfter = myResults.length - 1;
      const maxPages = Math.ceil(totalAfter / RESULTS_PER_PAGE) || 1;
      if (resultsPage > maxPages) setResultsPage(maxPages);
    }
  }

  // Stats
  const validResults = myResults.filter(r => r.totalPoints > 0);
  const totalExams = myResults.length;
  const avgPercent = validResults.length > 0
    ? Math.round(validResults.reduce((acc, r) => acc + (r.score / r.totalPoints) * 100, 0) / validResults.length)
    : 0;
  const bestPercent = validResults.length > 0
    ? Math.round(Math.max(...validResults.map((r) => (r.score / r.totalPoints) * 100)))
    : 0;

  return {
    view,
    setView,
    topics,
    myResults,
    searchQuery,
    setSearchQuery,
    resultsPage,
    setResultsPage,
    RESULTS_PER_PAGE,
    refreshData,
    handleDeleteResult,
    stats: {
      totalExams,
      avgPercent,
      bestPercent,
      topicsCount: topics.length
    }
  };
}

export function useExam(
  userId: string, 
  onExamComplete: (result: ExamResult, questions: Question[], topic: Topic) => void,
  onStart?: () => void
) {
  const [examTopic, setExamTopic] = useState<Topic | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const submitExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!examTopic) return;

    const score = examQuestions.reduce((acc, q, i) => {
      return selectedAnswers[i] === q.correctAnswer ? acc + q.points : acc;
    }, 0);
    const totalPoints = examQuestions.reduce((acc, q) => acc + q.points, 0);
    
    const result: ExamResult = {
      id: generateId('result'),
      studentId: userId,
      topicId: examTopic.id,
      score,
      totalPoints,
      answers: selectedAnswers,
      timeTaken: examQuestions.length * 60 - timeLeft,
      completedAt: new Date().toISOString(),
    };
    
    saveResult(result);
    setExamStarted(false);
    onExamComplete(result, examQuestions, examTopic);
  }, [examTopic, examQuestions, selectedAnswers, timeLeft, userId, onExamComplete]);

  function startExam(topic: Topic) {
    const qs = getQuestionsByTopic(topic.id);
    if (qs.length === 0) {
      alert('No questions available for this topic yet.');
      return;
    }
    setExamTopic(topic);
    setExamQuestions(qs);
    setSelectedAnswers(new Array(qs.length).fill(-1));
    setCurrentQ(0);
    setTimeLeft(qs.length * 60);
    setExamStarted(true);
    onStart?.();
  }

  useEffect(() => {
    if (!examStarted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          submitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [examStarted, submitExam]);

  function selectAnswer(idx: number) {
    const updated = [...selectedAnswers];
    updated[currentQ] = idx;
    setSelectedAnswers(updated);
  }

  return {
    examTopic,
    examQuestions,
    currentQ,
    setCurrentQ,
    selectedAnswers,
    timeLeft,
    examStarted,
    startExam,
    selectAnswer,
    submitExam
  };
}
