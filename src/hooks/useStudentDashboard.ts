'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getTopics,
  getResults,
  getResultsByStudent,
  deleteResult as storageDeleteResult,
  getQuestionsByTopic,
  saveResult,
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
  const [isLoading, setIsLoading] = useState(true);
  const RESULTS_PER_PAGE = 5;

  const refreshData = useCallback(async (uid: string) => {
    if (!uid) return;
    setIsLoading(true);
    const [t, r] = await Promise.all([
      getTopics(),
      getResultsByStudent(uid),
    ]);
    setTopics(t);
    setMyResults(r);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (userId) {
      refreshData(userId);
    }
  }, [userId, refreshData]);

  async function handleDeleteResult(id: string) {
    if (window.confirm('Are you sure you want to delete this result? This cannot be undone.')) {
      await storageDeleteResult(id);
      await refreshData(userId);

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
    isLoading,
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
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef<number>(0);

  const EXAM_STATE_KEY = `exam_ongoing_${userId}`;

  useEffect(() => {
    const savedState = localStorage.getItem(EXAM_STATE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
        const remaining = Math.max(0, parsed.duration - elapsed);

        if (remaining > 0) {
          setExamTopic(parsed.topic);
          setExamQuestions(parsed.qs);
          setSelectedAnswers(parsed.answers);
          setCurrentQ(parsed.currentQ || 0);
          durationRef.current = parsed.duration;
          startTimeRef.current = parsed.startTime;
          setTimeLeft(remaining);
          setExamStarted(true);
          // Delay onStart slightly so the view can update
          setTimeout(() => onStart?.(), 0);
        } else {
          localStorage.removeItem(EXAM_STATE_KEY);
        }
      } catch (err) {
        localStorage.removeItem(EXAM_STATE_KEY);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [EXAM_STATE_KEY]);

  useEffect(() => {
    if (!examStarted) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examStarted]);

  useEffect(() => {
    if (examStarted && examTopic && examQuestions.length > 0) {
      localStorage.setItem(EXAM_STATE_KEY, JSON.stringify({
        topic: examTopic,
        qs: examQuestions,
        answers: selectedAnswers,
        currentQ,
        startTime: startTimeRef.current,
        duration: durationRef.current
      }));
    }
  }, [examStarted, selectedAnswers, currentQ, examTopic, examQuestions, EXAM_STATE_KEY]);

  const submitExam = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!examTopic) return;

    localStorage.removeItem(`exam_ongoing_${userId}`);

    // Send only necessary data; the server calculates score and totalPoints.
    const result: Partial<ExamResult> = {
      studentId: userId,
      topicId: examTopic.id,
      answers: selectedAnswers,
      timeTaken: durationRef.current - timeLeft,
    };

    const savedResult = await saveResult(result);
    setExamStarted(false);
    onExamComplete(savedResult, examQuestions, examTopic);
  }, [examTopic, examQuestions, selectedAnswers, timeLeft, userId, onExamComplete]);

  async function startExam(topic: Topic) {
    const qs = await getQuestionsByTopic(topic.id);
    if (qs.length === 0) {
      alert('No questions available for this topic yet.');
      return;
    }
    setExamTopic(topic);
    setExamQuestions(qs);
    setSelectedAnswers(new Array(qs.length).fill(-1));
    setCurrentQ(0);
    const totalTime = qs.length * 60;
    durationRef.current = totalTime;
    startTimeRef.current = Date.now();
    setTimeLeft(totalTime);
    setExamStarted(true);
    onStart?.();
  }

  useEffect(() => {
    if (!examStarted) return;
    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, durationRef.current - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        submitExam();
      }
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
