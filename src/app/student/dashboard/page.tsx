'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser, logout,
  getTopics, getQuestionsByTopic, saveResult,
  getResultsByStudent, getQuestions,
  generateId,
  type Topic, type Question, type ExamResult,
} from '@/lib/storage';
import { useTheme } from '@/lib/ThemeProvider';
import styles from './dashboard.module.css';

type View = 'dashboard' | 'exam' | 'review';

export default function StudentDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [view, setView] = useState<View>('dashboard');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [myResults, setMyResults] = useState<ExamResult[]>([]);

  // Exam state
  const [examTopic, setExamTopic] = useState<Topic | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Review state
  const [reviewResult, setReviewResult] = useState<ExamResult | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [reviewTopic, setReviewTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'student') { router.replace('/auth'); return; }
    setUserName(user.name);
    setUserId(user.userId);
    refreshData(user.userId);
  }, [router]);

  function refreshData(uid: string) {
    setTopics(getTopics());
    setMyResults(getResultsByStudent(uid));
  }

  function handleLogout() {
    logout();
    router.push('/auth');
  }

  // ---- Start Exam ----
  function startExam(topic: Topic) {
    const qs = getQuestionsByTopic(topic.id);
    if (qs.length === 0) { alert('No questions available for this topic yet.'); return; }
    setExamTopic(topic);
    setExamQuestions(qs);
    setSelectedAnswers(new Array(qs.length).fill(-1));
    setCurrentQ(0);
    setTimeLeft(qs.length * 60); // 1 min per question
    setExamStarted(true);
    setView('exam');
  }

  // Timer
  useEffect(() => {
    if (view !== 'exam' || !examStarted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { submitExam(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view, examStarted]);

  function selectAnswer(idx: number) {
    const updated = [...selectedAnswers];
    updated[currentQ] = idx;
    setSelectedAnswers(updated);
  }

  function submitExam() {
    if (timerRef.current) clearInterval(timerRef.current);
    const score = examQuestions.reduce((acc, q, i) => {
      return selectedAnswers[i] === q.correctAnswer ? acc + q.points : acc;
    }, 0);
    const totalPoints = examQuestions.reduce((acc, q) => acc + q.points, 0);
    const result: ExamResult = {
      id: generateId('result'),
      studentId: userId,
      topicId: examTopic!.id,
      score,
      totalPoints,
      answers: selectedAnswers,
      timeTaken: examQuestions.length * 60 - timeLeft,
      completedAt: new Date().toISOString(),
    };
    saveResult(result);
    refreshData(userId);
    openReview(result, examQuestions, examTopic!);
  }

  function openReview(result: ExamResult, qs: Question[], topic: Topic) {
    setReviewResult(result);
    setReviewQuestions(qs);
    setReviewTopic(topic);
    setExamStarted(false);
    setView('review');
  }

  function openResultReview(result: ExamResult) {
    const qs = getQuestionsByTopic(result.topicId);
    const topic = topics.find((t) => t.id === result.topicId) || null;
    if (topic) openReview(result, qs, topic);
  }

  // Format time
  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Stats
  const totalExams = myResults.length;
  const avgPercent = totalExams > 0
    ? Math.round(myResults.reduce((acc, r) => acc + (r.score / r.totalPoints) * 100, 0) / totalExams)
    : 0;
  const bestPercent = totalExams > 0
    ? Math.round(Math.max(...myResults.map((r) => (r.score / r.totalPoints) * 100)))
    : 0;

  const difficultyColors: Record<string, string> = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

  return (
    <div className={styles.page}>
      {/* ---- Header ---- */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>🎓</span>
          <span className={styles.logoText}>ExamTop</span>
          {view !== 'dashboard' && (
            <button onClick={() => setView('dashboard')} className={styles.backBtn}>
              ← Back
            </button>
          )}
        </div>
        <div className={styles.headerRight}>
          {view === 'exam' && examStarted && (
            <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerWarning : ''}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
          <button id="student-theme-toggle" onClick={toggleTheme} className={styles.themeBtn} aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
          <button id="student-logout" onClick={handleLogout} className={styles.logoutBtn}>Sign Out</button>
        </div>
      </header>

      <main className={styles.main}>
        {/* ================== DASHBOARD VIEW ================== */}
        {view === 'dashboard' && (
          <div className={styles.dashContent}>
            {/* Welcome */}
            <div className={styles.welcome}>
              <div>
                <h1 className={styles.welcomeTitle}>
                  Hello, {userName.split(' ')[0]}! 👋
                </h1>
                <p className={styles.welcomeSubtitle}>Ready to test your knowledge today?</p>
              </div>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>📋</div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{totalExams}</div>
                  <div className={styles.statLabel}>Exams Taken</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>📊</div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{avgPercent}%</div>
                  <div className={styles.statLabel}>Avg Score</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>🏆</div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{bestPercent}%</div>
                  <div className={styles.statLabel}>Best Score</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>📚</div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{topics.length}</div>
                  <div className={styles.statLabel}>Topics</div>
                </div>
              </div>
            </div>

            {/* Topics grid */}
            <section>
              <h2 className={styles.sectionTitle}>Available Topics</h2>
              <div className={styles.topicsGrid}>
                {topics.map((t) => {
                  const topicResults = myResults.filter((r) => r.topicId === t.id);
                  const lastResult = topicResults[topicResults.length - 1];
                  const lastPercent = lastResult ? Math.round((lastResult.score / lastResult.totalPoints) * 100) : null;
                  return (
                    <div key={t.id} className={styles.topicCard}>
                      <div className={styles.topicCardTop}>
                        <span className={styles.topicIcon}>{t.icon}</span>
                        <span className={styles.diffBadge} style={{ background: `${difficultyColors[t.difficulty]}20`, color: difficultyColors[t.difficulty] }}>
                          {t.difficulty}
                        </span>
                      </div>
                      <h3 className={styles.topicName}>{t.name}</h3>
                      <p className={styles.topicDesc}>{t.description}</p>
                      <div className={styles.topicMeta}>
                        <span className={styles.topicQCount}>❓ {t.questionCount} questions</span>
                        {lastPercent !== null && (
                          <span className={styles.topicLastScore} style={{ color: lastPercent >= 60 ? '#10b981' : '#ef4444' }}>
                            Last: {lastPercent}%
                          </span>
                        )}
                      </div>
                      <button
                        id={`start-exam-${t.id}`}
                        onClick={() => startExam(t)}
                        className={styles.startBtn}
                        disabled={!t.questionCount}
                      >
                        {t.questionCount ? (lastPercent !== null ? '🔄 Retake Exam' : '▶ Start Exam') : '📭 No Questions'}
                      </button>
                    </div>
                  );
                })}
                {topics.length === 0 && (
                  <div className={styles.emptyState}>
                    <span style={{ fontSize: '3rem' }}>📚</span>
                    <p>No topics available yet. Ask your admin to create some!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Recent results */}
            {myResults.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Recent Results</h2>
                <div className={styles.resultsList}>
                  {[...myResults].reverse().slice(0, 5).map((r) => {
                    const topic = topics.find((t) => t.id === r.topicId);
                    const pct = Math.round((r.score / r.totalPoints) * 100);
                    return (
                      <div key={r.id} className={styles.resultCard}>
                        <div className={styles.resultLeft}>
                          <span className={styles.resultIcon}>{topic?.icon || '📋'}</span>
                          <div>
                            <div className={styles.resultTopic}>{topic?.name || 'Unknown Topic'}</div>
                            <div className={styles.resultDate}>{new Date(r.completedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className={styles.resultRight}>
                          <div className={styles.resultScore} style={{ color: pct >= 60 ? '#10b981' : '#ef4444' }}>
                            {pct}%
                          </div>
                          <div className={styles.resultPts}>{r.score}/{r.totalPoints} pts</div>
                          <button
                            id={`review-result-${r.id}`}
                            onClick={() => openResultReview(r)}
                            className={styles.reviewBtn}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ================== EXAM VIEW ================== */}
        {view === 'exam' && examTopic && (
          <div className={styles.examView}>
            {/* Progress */}
            <div className={styles.ExamTopgress}>
              <div className={styles.ExamTopgressInfo}>
                <span>{examTopic.icon} {examTopic.name}</span>
                <span>Question {currentQ + 1} of {examQuestions.length}</span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${((currentQ + 1) / examQuestions.length) * 100}%` }}
                />
              </div>
              <div className={styles.qDots}>
                {examQuestions.map((_, i) => (
                  <button
                    key={i}
                    id={`q-dot-${i}`}
                    onClick={() => setCurrentQ(i)}
                    className={`${styles.qDot} ${i === currentQ ? styles.qDotActive : selectedAnswers[i] > -1 ? styles.qDotAnswered : ''}`}
                    aria-label={`Question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Question card */}
            <div className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNum}>Q{currentQ + 1}</span>
                <span className={styles.questionPoints}>{examQuestions[currentQ].points} pts</span>
              </div>
              <p className={styles.questionText}>{examQuestions[currentQ].text}</p>

              <div className={styles.optionsList}>
                {examQuestions[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    id={`option-${i}`}
                    onClick={() => selectAnswer(i)}
                    className={`${styles.optionBtn} ${selectedAnswers[currentQ] === i ? styles.optionBtnSelected : ''}`}
                  >
                    <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              <div className={styles.examNavRow}>
                <button
                  onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                  disabled={currentQ === 0}
                  className={styles.navBtn}
                >
                  ← Prev
                </button>

                {currentQ < examQuestions.length - 1 ? (
                  <button
                    id="next-question"
                    onClick={() => setCurrentQ((q) => q + 1)}
                    className={styles.navBtnPrimary}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    id="submit-exam"
                    onClick={submitExam}
                    className={styles.submitExamBtn}
                  >
                    Submit Exam ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================== REVIEW VIEW ================== */}
        {view === 'review' && reviewResult && reviewTopic && (
          <div className={styles.reviewView}>
            {/* Score card */}
            <div className={styles.scoreCard}>
              <div className={styles.scoreCircle} style={{
                background: (reviewResult.score / reviewResult.totalPoints) >= 0.6
                  ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
              }}>
                <div
                  className={styles.scorePercent}
                  style={{ color: (reviewResult.score / reviewResult.totalPoints) >= 0.6 ? '#10b981' : '#ef4444' }}
                >
                  {Math.round((reviewResult.score / reviewResult.totalPoints) * 100)}%
                </div>
                <div className={styles.scoreLabel}>
                  {(reviewResult.score / reviewResult.totalPoints) >= 0.6 ? '🎉 Passed!' : '😔 Failed'}
                </div>
              </div>
              <div className={styles.scoreMeta}>
                <div className={styles.scoreMetaItem}>
                  <span className={styles.scoreMetaLabel}>Topic</span>
                  <span className={styles.scoreMetaValue}>{reviewTopic.icon} {reviewTopic.name}</span>
                </div>
                <div className={styles.scoreMetaItem}>
                  <span className={styles.scoreMetaLabel}>Score</span>
                  <span className={styles.scoreMetaValue}>{reviewResult.score} / {reviewResult.totalPoints}</span>
                </div>
                <div className={styles.scoreMetaItem}>
                  <span className={styles.scoreMetaLabel}>Time</span>
                  <span className={styles.scoreMetaValue}>{formatTime(reviewResult.timeTaken)}</span>
                </div>
                <div className={styles.scoreMetaItem}>
                  <span className={styles.scoreMetaLabel}>Correct</span>
                  <span className={styles.scoreMetaValue}>
                    {reviewQuestions.filter((q, i) => reviewResult.answers[i] === q.correctAnswer).length} / {reviewQuestions.length}
                  </span>
                </div>
              </div>
              <button id="back-to-dashboard" onClick={() => setView('dashboard')} className={styles.backToDashBtn}>
                Back to Dashboard
              </button>
            </div>

            {/* Answer review */}
            <div className={styles.answersSection}>
              <h2 className={styles.sectionTitle}>Answer Review</h2>
              {reviewQuestions.map((q, i) => {
                const userAns = reviewResult.answers[i];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div key={q.id} className={`${styles.reviewCard} ${isCorrect ? styles.reviewCardCorrect : styles.reviewCardWrong}`}>
                    <div className={styles.reviewCardHeader}>
                      <span className={styles.reviewQ}>Q{i + 1}</span>
                      <span className={isCorrect ? styles.correctTag : styles.wrongTag}>
                        {isCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                      <span className={styles.reviewPts}>{isCorrect ? `+${q.points}` : '0'} pts</span>
                    </div>
                    <p className={styles.reviewQText}>{q.text}</p>
                    <div className={styles.reviewOptions}>
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className={`${styles.reviewOpt}
                            ${oi === q.correctAnswer ? styles.reviewOptCorrect : ''}
                            ${oi === userAns && !isCorrect ? styles.reviewOptWrong : ''}
                          `}
                        >
                          <span className={styles.reviewOptLetter}>{String.fromCharCode(65 + oi)}</span>
                          {opt}
                          {oi === q.correctAnswer && ' ✓'}
                          {oi === userAns && !isCorrect && ' ✗'}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className={styles.reviewExpl}>
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
