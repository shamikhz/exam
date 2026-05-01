'use client';

import { useState } from 'react';
import {
  getQuestionsByTopic,
  type ExamResult,
  type Question,
  type Topic
} from '@/lib/storage';
import { useTheme } from '@/lib/ThemeProvider';
import { useDashboard } from '@/hooks/useDashboard';
import { useStudentDashboard, useExam, type View } from '@/hooks/useStudentDashboard';

import styles from './dashboard.module.css';

// Shared UI Components
import { StatCard } from '@/components/ui/StatCard';
import { Pagination } from '@/components/ui/Pagination';

// Student Dashboard Components
import { DashboardHeader } from './components/DashboardHeader';
import { TopicCard } from './components/TopicCard';
import { ResultCard } from './components/ResultCard';
import { ExamView } from './components/ExamView';
import { ReviewView } from './components/ReviewView';

export default function StudentDashboard() {
  const { theme, toggleTheme } = useTheme();

  const {
    userName, userEmail, userAvatar, userId,
    isMenuOpen, setIsMenuOpen, handleLogout
  } = useDashboard('student');

  const {
    view, setView, topics, myResults, searchQuery, setSearchQuery,
    selectedSubject, setSelectedSubject,
    resultsPage, setResultsPage, RESULTS_PER_PAGE,
    isLoading, refreshData, handleDeleteResult, stats
  } = useStudentDashboard(userId);

  // Review state
  const [reviewResult, setReviewResult] = useState<ExamResult | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [reviewTopic, setReviewTopic] = useState<Topic | null>(null);

  const openReview = (result: ExamResult, qs: Question[], topic: Topic) => {
    setReviewResult(result);
    setReviewQuestions(qs);
    setReviewTopic(topic);
    setView('review');
  };

  const {
    examTopic, examQuestions, currentQ, setCurrentQ,
    selectedAnswers, timeLeft, examStarted,
    startExam, selectAnswer, submitExam, resetExam
  } = useExam(userId, (result, qs, topic) => {
    refreshData(userId);
    openReview(result, qs, topic);
  }, () => setView('exam'));

  const handleBack = () => {
    if (view === 'exam' && examStarted) {
      if (window.confirm('Are you sure you want to abandon the exam? Progress will not be saved.')) {
        resetExam();
        setView('dashboard');
      }
    } else {
      setView('dashboard');
    }
  };

  // openResultReview now awaits async getQuestionsByTopic
  const openResultReview = async (result: ExamResult) => {
    const qs = await getQuestionsByTopic(result.topicId);
    let topic = topics.find((t) => t.id === result.topicId) || null;

    // Fallback for orphaned results where the topic has been deleted
    if (!topic) {
      topic = {
        id: result.topicId,
        name: 'Deleted Topic',
        description: 'This topic has been removed.',
        icon: '🗑️',
        difficulty: 'Medium',
        subject: '',
        createdAt: result.completedAt,
        questionCount: qs.length,
      };
    }

    openReview(result, qs, topic);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const difficultyColors: Record<string, string> = {
    Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444'
  };

  return (
    <div className={styles.page}>
      <DashboardHeader
        view={view}
        onBack={handleBack}
        examStarted={examStarted}
        timeLeft={timeLeft}
        formatTime={formatTime}
        userAvatar={userAvatar}
        userName={userName}
        userEmail={userEmail}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        toggleTheme={toggleTheme}
        theme={theme}
        onLogout={handleLogout}
        styles={styles}
      />

      <main className={styles.main}>
        {view !== 'dashboard' && (
          <button 
            onClick={handleBack} 
            className={styles.bodyBackBtn}
          >
            ← Back to Dashboard
          </button>
        )}
        {/* ================== DASHBOARD VIEW ================== */}
        {view === 'dashboard' && (
          <div className={styles.dashContent}>
            <div className={styles.welcome}>
              <div>
                <h1 className={styles.welcomeTitle}>
                  Hello, {userName.split(' ')[0]}! 👋
                </h1>
                <p className={styles.welcomeSubtitle}>Ready to test your knowledge today?</p>
              </div>
            </div>

            <div className={styles.subjectBar}>
              <div className={styles.subjectScroll}>
                {['All', ...Array.from(new Set(topics.map(t => t.subject).filter(Boolean))).sort()].map((s) => (
                  <button
                    key={s}
                    className={`${styles.subjectBtn} ${selectedSubject === s ? styles.subjectBtnActive : ''}`}
                    onClick={() => setSelectedSubject(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.statsRow}>
              <StatCard
                icon="📋" value={stats.totalExams} label="Exams Taken"
                className={styles.statCard} iconClassName={styles.statIcon}
                infoClassName={styles.statInfo} valueClassName={styles.statValue}
                labelClassName={styles.statLabel}
                iconStyle={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}
              />
              <StatCard
                icon="📊" value={`${stats.avgPercent}%`} label="Avg Score"
                className={styles.statCard} iconClassName={styles.statIcon}
                infoClassName={styles.statInfo} valueClassName={styles.statValue}
                labelClassName={styles.statLabel}
                iconStyle={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
              />
              <StatCard
                icon="🏆" value={`${stats.bestPercent}%`} label="Best Score"
                className={styles.statCard} iconClassName={styles.statIcon}
                infoClassName={styles.statInfo} valueClassName={styles.statValue}
                labelClassName={styles.statLabel}
                iconStyle={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}
              />
              <StatCard
                icon="📚" value={stats.topicsCount} label="Topics"
                className={styles.statCard} iconClassName={styles.statIcon}
                infoClassName={styles.statInfo} valueClassName={styles.statValue}
                labelClassName={styles.statLabel}
                iconStyle={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}
              />
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ opacity: 0.6 }}>Loading topics...</p>
              </div>
            ) : (
              <>
                <section>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Available Topics</h2>
                    <div className={styles.searchBox}>
                      <span className={styles.searchIcon}>🔍</span>
                      <input
                        type="text"
                        placeholder="Search topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                      />
                    </div>
                  </div>

                  <div className={styles.topicsGrid}>
                    {topics
                      .filter(t => {
                        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            t.description.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;
                        return matchesSearch && matchesSubject;
                      })
                      .map((t) => (
                        <TopicCard
                          key={t.id} topic={t} myResults={myResults}
                          onStartExam={startExam} difficultyColors={difficultyColors}
                          styles={styles}
                        />
                      ))}

                    {topics.length === 0 && (
                      <div className={styles.emptyState}>
                        <span style={{ fontSize: '3rem' }}>📚</span>
                        <p>No topics available yet. Ask your admin to create some!</p>
                      </div>
                    )}

                    {topics.length > 0 && topics.filter(t => {
                      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;
                      return matchesSearch && matchesSubject;
                    }).length === 0 && (
                        <div className={styles.emptyState}>
                          <span style={{ fontSize: '3rem' }}>🔍</span>
                          <p>No topics match &quot;{searchQuery}&quot;</p>
                          <button onClick={() => setSearchQuery('')} className={styles.clearBtn}>Clear Search</button>
                        </div>
                      )}
                  </div>
                </section>

                {myResults.length > 0 && (
                  <section className={styles.resultsSection}>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>Recent Results</h2>
                      <div className={styles.resultsCount}>
                        Total: {myResults.length} records
                      </div>
                    </div>

                    <div className={styles.resultsList}>
                      {[...myResults]
                        .reverse()
                        .slice((resultsPage - 1) * RESULTS_PER_PAGE, resultsPage * RESULTS_PER_PAGE)
                        .map((r) => (
                          <ResultCard
                            key={r.id} result={r}
                            topic={topics.find(t => t.id === r.topicId)}
                            onReview={openResultReview}
                            onDelete={handleDeleteResult}
                            styles={styles}
                          />
                        ))}
                    </div>

                    <Pagination
                      currentPage={resultsPage}
                      totalItems={myResults.length}
                      itemsPerPage={RESULTS_PER_PAGE}
                      onPageChange={setResultsPage}
                      className={styles.pagination}
                      btnClassName={styles.pageBtn}
                      infoClassName={styles.pageInfo}
                    />
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* ================== EXAM VIEW ================== */}
        {view === 'exam' && examTopic && (
          <ExamView
            examTopic={examTopic}
            examQuestions={examQuestions}
            currentQ={currentQ}
            setCurrentQ={setCurrentQ}
            selectedAnswers={selectedAnswers}
            selectAnswer={selectAnswer}
            submitExam={submitExam}
            styles={styles}
          />
        )}

        {/* ================== REVIEW VIEW ================== */}
        {view === 'review' && reviewResult && reviewTopic && (
          <ReviewView
            reviewResult={reviewResult}
            reviewTopic={reviewTopic}
            reviewQuestions={reviewQuestions}
            formatTime={formatTime}
            onBackToDashboard={() => setView('dashboard')}
            styles={styles}
          />
        )}
      </main>
    </div>
  );
}
