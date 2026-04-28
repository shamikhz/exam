'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/ThemeProvider';
import { useDashboard } from '@/hooks/useDashboard';
import { useAdminDashboard, type Tab } from '@/hooks/useAdminDashboard';

import styles from './dashboard.module.css';

// Admin Dashboard Components
import { Sidebar } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { TopicsTab } from './components/TopicsTab';
import { QuestionsTab } from './components/QuestionsTab';
import { StudentsTab } from './components/StudentsTab';
import { Modals } from './components/Modals';

export default function AdminDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    userName, userEmail, userAvatar,
    isMenuOpen, setIsMenuOpen, handleLogout
  } = useDashboard('admin');

  const {
    activeTab, setActiveTab,
    topics, questions, results, users,
    isLoading,
    selectedTopicView, setSelectedTopicView,
    selectedTopicFilter, setSelectedTopicFilter,
    studentSearchQuery, setStudentSearchQuery,
    studentPage, setStudentPage, STUDENTS_PER_PAGE,

    showTopicForm, setShowTopicForm, editingTopic, topicForm, setTopicForm, topicError,
    openTopicForm, handleTopicSubmit, handleDeleteTopic,

    showQuestionForm, setShowQuestionForm, editingQuestion, questionForm, setQuestionForm, questionError,
    openQuestionForm, handleQuestionSubmit, handleDeleteQuestion,

    handleDeleteStudent,
    deleteConfirm, setDeleteConfirm,
    stats,
    filteredQuestions,
    isUploading, handleBulkUpload
  } = useAdminDashboard();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'topics', label: 'Topics', icon: '📚' },
    { id: 'questions', label: 'Questions', icon: '❓' },
    { id: 'students', label: 'Students', icon: '👥' },
  ];

  const difficultyColors: Record<string, string> = {
    Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444'
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSidebarOpen={setSidebarOpen}
        tabs={tabs}
        styles={styles}
      />

      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Open menu">☰</button>
            <div>
              <h2 className={styles.pageTitle}>
                {tabs.find((t) => t.id === activeTab)?.icon} {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
            </div>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.avatarGroup}>
              <button
                id="admin-avatar-btn"
                className={styles.avatarBtn}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="User menu"
              >
                <div className={styles.avatar}>
                  {userAvatar ? (
                    <img src={userAvatar} alt="" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>
              </button>

              {isMenuOpen && (
                <>
                  <div className={styles.overlay} style={{ background: 'transparent' }} onClick={() => setIsMenuOpen(false)} />
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownInfo}>
                      <div className={styles.dropdownName}>{userName}</div>
                      <div className={styles.dropdownEmail}>{userEmail}</div>
                    </div>
                    <Link href="/profile" className={styles.dropdownLink}>
                      <span className={styles.dropdownIcon}>👤</span>
                      Profile Settings
                    </Link>
                    <button onClick={toggleTheme} className={styles.dropdownLink}>
                      <span className={styles.dropdownIcon}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button onClick={handleLogout} className={`${styles.dropdownLink} ${styles.dropdownLogout}`}>
                      <span className={styles.dropdownIcon}>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ opacity: 0.6 }}>Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  stats={stats} topics={topics}
                  difficultyColors={difficultyColors} styles={styles}
                />
              )}

              {activeTab === 'topics' && (
                <TopicsTab
                  topics={topics} selectedTopicView={selectedTopicView}
                  setSelectedTopicView={setSelectedTopicView}
                  onAddTopic={() => openTopicForm()}
                  onEditTopic={openTopicForm}
                  onDeleteTopic={(id) => setDeleteConfirm({ type: 'topic', id })}
                  isUploading={isUploading}
                  uploadSuccess={uploadSuccess}
                  onBulkUpload={handleBulkUpload}
                  difficultyColors={difficultyColors} styles={styles}
                />
              )}

              {activeTab === 'questions' && (
                <QuestionsTab
                  topics={topics} filteredQuestions={filteredQuestions}
                  selectedTopicFilter={selectedTopicFilter}
                  setSelectedTopicFilter={setSelectedTopicFilter}
                  onAddQuestion={() => openQuestionForm()}
                  onEditQuestion={openQuestionForm}
                  onDeleteQuestion={(id) => setDeleteConfirm({ type: 'question', id })}
                  styles={styles}
                />
              )}

              {activeTab === 'students' && (
                <StudentsTab
                  users={users} results={results}
                  studentSearchQuery={studentSearchQuery}
                  setStudentSearchQuery={setStudentSearchQuery}
                  studentPage={studentPage} setStudentPage={setStudentPage}
                  STUDENTS_PER_PAGE={STUDENTS_PER_PAGE}
                  onDeleteStudent={(id) => setDeleteConfirm({ type: 'student', id })}
                  styles={styles}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Modals
        showTopicForm={showTopicForm} setShowTopicForm={setShowTopicForm}
        editingTopic={editingTopic} topicForm={topicForm}
        setTopicForm={setTopicForm} topicError={topicError}
        handleTopicSubmit={handleTopicSubmit}
        showQuestionForm={showQuestionForm} setShowQuestionForm={setShowQuestionForm}
        editingQuestion={editingQuestion} questionForm={questionForm}
        setQuestionForm={setQuestionForm} questionError={questionError}
        handleQuestionSubmit={handleQuestionSubmit}
        topics={topics}
        deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm}
        users={users} handleDeleteTopic={handleDeleteTopic}
        handleDeleteQuestion={handleDeleteQuestion}
        handleDeleteStudent={handleDeleteStudent}
        styles={styles}
      />
    </div>
  );
}
