'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCurrentUser, logout,
  getTopics, saveTopic, deleteTopic,
  getQuestions, saveQuestion, deleteQuestion, getQuestionsByTopic,
  getResults, getUsers, deleteUser,
  generateId,
  type Topic, type Question,
} from '@/lib/storage';
import { useTheme } from '@/lib/ThemeProvider';
import styles from './dashboard.module.css';

type Tab = 'overview' | 'topics' | 'questions' | 'students';

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<ReturnType<typeof getResults>>([]);
  const [users, setUsers] = useState<ReturnType<typeof getUsers>>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedTopicView, setSelectedTopicView] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Topic form state
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ name: '', description: '', icon: '📚', difficulty: 'Easy' as Topic['difficulty'] });

  // Question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all');
  const [questionForm, setQuestionForm] = useState({
    topicId: '', text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'topic' | 'question' | 'student'; id: string } | null>(null);
  const [topicError, setTopicError] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') { router.replace('/auth'); return; }
    setUserName(user.name);
    setUserEmail(user.email);
    refreshData();
  }, [router]);

  function refreshData() {
    setTopics(getTopics());
    setQuestions(getQuestions());
    setResults(getResults());
    setUsers(getUsers());
  }

  function handleLogout() {
    logout();
    router.push('/auth');
  }

  // ---- Topic CRUD ----
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

    // Duplicate check
    const isDuplicate = topics.some(t => 
      t.name.toLowerCase() === topicForm.name.trim().toLowerCase() && 
      t.id !== editingTopic?.id
    );

    if (isDuplicate) {
      setTopicError(`A topic named "${topicForm.name.trim()}" already exists. Please choose a unique name.`);
      return;
    }

    const topic: Topic = {
      id: editingTopic?.id || generateId('topic'),
      name: topicForm.name.trim(),
      description: topicForm.description,
      icon: topicForm.icon,
      difficulty: topicForm.difficulty,
      createdAt: editingTopic?.createdAt || new Date().toISOString(),
    };
    saveTopic(topic);
    setShowTopicForm(false);
    refreshData();
  }

  function handleDeleteTopic(id: string) {
    deleteTopic(id);
    setDeleteConfirm(null);
    refreshData();
  }

  function handleDeleteStudent(id: string) {
    deleteUser(id);
    setDeleteConfirm(null);
    refreshData();
  }

  // ---- Question CRUD ----
  function openQuestionForm(q?: Question) {
    if (q) {
      setEditingQuestion(q);
      setQuestionForm({ topicId: q.topicId, text: q.text, options: [...q.options], correctAnswer: q.correctAnswer, explanation: q.explanation, points: q.points });
    } else {
      setEditingQuestion(null);
      setQuestionForm({ topicId: selectedTopicFilter !== 'all' ? selectedTopicFilter : (topics[0]?.id || ''), text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', points: 10 });
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
    saveQuestion(q);
    setShowQuestionForm(false);
    refreshData();
  }

  function handleDeleteQuestion(id: string) {
    deleteQuestion(id);
    setDeleteConfirm(null);
    refreshData();
  }

  const filteredQuestions = selectedTopicFilter === 'all'
    ? questions
    : questions.filter((q) => q.topicId === selectedTopicFilter);

  const totalPoints = results.reduce((acc, r) => acc + r.score, 0);
  const avgScore = results.length > 0 ? Math.round(totalPoints / results.length) : 0;
  const passRate = results.length > 0
    ? Math.round((results.filter((r) => (r.score / r.totalPoints) >= 0.6).length / results.length) * 100)
    : 0;

  const difficultyColors: Record<string, string> = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'topics', label: 'Topics', icon: '📚' },
    { id: 'questions', label: 'Questions', icon: '❓' },
    { id: 'students', label: 'Students', icon: '👥' },
  ];

  return (
    <div className={styles.layout}>
      {/* ---- Sidebar ---- */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <span>⚙️</span>
          <span className={styles.sidebarBrandText}>ExamTop Admin</span>
        </div>

        <nav className={styles.sidebarNav}>
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`sidebar-tab-${t.id}`}
              onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
              className={`${styles.sidebarLink} ${activeTab === t.id ? styles.sidebarLinkActive : ''}`}
            >
              <span className={styles.sidebarIcon}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarUser}>
            <div className={styles.avatarSmall}>{userName.charAt(0).toUpperCase()}</div>
            <div>
              <div className={styles.sidebarUserName}>{userName}</div>
              <div className={styles.sidebarUserRole}>Administrator</div>
            </div>
          </div>
          <button id="admin-logout" onClick={handleLogout} className={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* ---- Main ---- */}
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
                <div className={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
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
          {/* ==== OVERVIEW ==== */}
          {activeTab === 'overview' && (
            <div className={styles.tabContent}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statCardIcon} style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>📚</div>
                  <div className={styles.statCardInfo}>
                    <div className={styles.statCardValue}>{topics.length}</div>
                    <div className={styles.statCardLabel}>Total Topics</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardIcon} style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>❓</div>
                  <div className={styles.statCardInfo}>
                    <div className={styles.statCardValue}>{questions.length}</div>
                    <div className={styles.statCardLabel}>Questions</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardIcon} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>👥</div>
                  <div className={styles.statCardInfo}>
                    <div className={styles.statCardValue}>{users.filter((u) => u.role === 'student').length}</div>
                    <div className={styles.statCardLabel}>Students</div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardIcon} style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>📋</div>
                  <div className={styles.statCardInfo}>
                    <div className={styles.statCardValue}>{results.length}</div>
                    <div className={styles.statCardLabel}>Exams Taken</div>
                  </div>
                </div>
              </div>

              <div className={styles.overviewRow}>
                <div className={styles.overviewCard}>
                  <h3>Performance Summary</h3>
                  <div className={styles.perfMetrics}>
                    <div className={styles.perfMetric}>
                      <div className={styles.perfLabel}>Avg Score</div>
                      <div className={styles.perfValue} style={{ color: '#2563eb' }}>{avgScore} pts</div>
                    </div>
                    <div className={styles.perfMetric}>
                      <div className={styles.perfLabel}>Pass Rate</div>
                      <div className={styles.perfValue} style={{ color: '#10b981' }}>{passRate}%</div>
                    </div>
                    <div className={styles.perfMetric}>
                      <div className={styles.perfLabel}>Total Attempts</div>
                      <div className={styles.perfValue} style={{ color: '#7c3aed' }}>{results.length}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.overviewCard}>
                  <h3>Recent Topics</h3>
                  <div className={styles.topicList}>
                    {topics.slice(-4).map((t) => (
                      <div key={t.id} className={styles.topicListItem}>
                        <span>{t.icon}</span>
                        <div>
                          <div className={styles.topicListName}>{t.name}</div>
                          <div className={styles.topicListMeta}>{t.questionCount} questions</div>
                        </div>
                        <span className={styles.diffBadge} style={{ background: `${difficultyColors[t.difficulty]}20`, color: difficultyColors[t.difficulty] }}>
                          {t.difficulty}
                        </span>
                      </div>
                    ))}
                    {topics.length === 0 && <p className={styles.empty}>No topics yet. Create one!</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==== TOPICS ==== */}
          {activeTab === 'topics' && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <div className={styles.tabHeaderLeft}>
                  <h3>Manage Topics</h3>
                  <select
                    id="topics-tab-filter"
                    value={selectedTopicView}
                    onChange={(e) => setSelectedTopicView(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">All Topics</option>
                    {topics.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                  </select>
                </div>
                <button id="add-topic-btn" onClick={() => openTopicForm()} className={styles.addBtn}>
                  + Add Topic
                </button>
              </div>

              <div className={styles.topicsGrid}>
                {topics
                  .filter(t => selectedTopicView === 'all' || t.id === selectedTopicView)
                  .map((t) => (
                  <div key={t.id} className={styles.topicCard}>
                    <div className={styles.topicCardHeader}>
                      <span className={styles.topicCardIcon}>{t.icon}</span>
                      <span className={styles.diffBadge} style={{ background: `${difficultyColors[t.difficulty]}20`, color: difficultyColors[t.difficulty] }}>
                        {t.difficulty}
                      </span>
                    </div>
                    <h4 className={styles.topicCardName}>{t.name}</h4>
                    <p className={styles.topicCardDesc}>{t.description}</p>
                    <div className={styles.topicCardMeta}>
                      <span>❓ {t.questionCount} questions</span>
                      <div className={styles.topicCardActions}>
                        <button id={`edit-topic-${t.id}`} onClick={() => openTopicForm(t)} className={styles.editBtn}>✏️ Edit</button>
                        <button id={`delete-topic-${t.id}`} onClick={() => setDeleteConfirm({ type: 'topic', id: t.id })} className={styles.deleteBtn}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
                {topics.length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📚</div>
                    <p>No topics yet. Create your first topic!</p>
                    <button onClick={() => openTopicForm()} className={styles.addBtn}>+ Add Topic</button>
                  </div>
                )}
                {topics.length > 0 && selectedTopicView !== 'all' && 
                  topics.filter(t => t.id === selectedTopicView).length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <p>Topic not found.</p>
                    <button onClick={() => setSelectedTopicView('all')} className={styles.clearBtn}>Show All</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==== QUESTIONS ==== */}
          {activeTab === 'questions' && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <div className={styles.tabHeaderLeft}>
                  <h3>Manage Questions</h3>
                  <select
                    id="topic-filter"
                    value={selectedTopicFilter}
                    onChange={(e) => setSelectedTopicFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">All Topics</option>
                    {topics.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                  </select>
                </div>
                <button id="add-question-btn" onClick={() => openQuestionForm()} className={styles.addBtn}>
                  + Add Question
                </button>
              </div>

              <div className={styles.questionList}>
                {filteredQuestions.map((q, i) => {
                  const topic = topics.find((t) => t.id === q.topicId);
                  return (
                    <div key={q.id} className={styles.questionCard}>
                      <div className={styles.questionNum}>Q{i + 1}</div>
                      <div className={styles.questionBody}>
                        <div className={styles.questionMeta}>
                          <span className={styles.questionTopic}>{topic?.icon} {topic?.name}</span>
                          <span className={styles.questionPoints}>{q.points} pts</span>
                        </div>
                        <p className={styles.questionText}>{q.text}</p>
                        <div className={styles.questionOptions}>
                          {q.options.map((opt, idx) => (
                            <span key={idx} className={`${styles.questionOpt} ${idx === q.correctAnswer ? styles.questionOptCorrect : ''}`}>
                              {String.fromCharCode(65 + idx)}. {opt}
                            </span>
                          ))}
                        </div>
                        {q.explanation && <p className={styles.questionExpl}>💡 {q.explanation}</p>}
                      </div>
                      <div className={styles.questionActions}>
                        <button id={`edit-q-${q.id}`} onClick={() => openQuestionForm(q)} className={styles.editBtn}>✏️</button>
                        <button id={`delete-q-${q.id}`} onClick={() => setDeleteConfirm({ type: 'question', id: q.id })} className={styles.deleteBtn}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
                {filteredQuestions.length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>❓</div>
                    <p>No questions yet. Add your first question!</p>
                    <button onClick={() => openQuestionForm()} className={styles.addBtn}>+ Add Question</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==== STUDENTS ==== */}
          {activeTab === 'students' && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <h3>Student Records</h3>
              </div>
              <div className={styles.studentTable}>
                <div className={styles.tableHeader}>
                  <span>Name</span>
                  <span>Email</span>
                  <span>Exams Taken</span>
                  <span>Best Score</span>
                  <span>Actions</span>
                </div>
                {users.filter((u) => u.role === 'student').map((u) => {
                  const studentResults = results.filter((r) => r.studentId === u.id);
                  const bestScore = studentResults.length > 0
                    ? Math.max(...studentResults.map((r) => Math.round((r.score / r.totalPoints) * 100)))
                    : null;
                  return (
                    <div key={u.id} className={styles.tableRow}>
                      <div className={styles.studentName}>
                        <div className={styles.avatarSmall}>{u.name.charAt(0).toUpperCase()}</div>
                        {u.name}
                      </div>
                      <span className={styles.tableCell}>{u.email}</span>
                      <span className={styles.tableCell}>{studentResults.length}</span>
                      <span className={styles.tableCell}>
                        {bestScore !== null
                          ? <span style={{ color: bestScore >= 60 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{bestScore}%</span>
                          : <span className={styles.noData}>—</span>}
                      </span>
                      <span className={styles.tableCell}>
                        <button onClick={() => setDeleteConfirm({ type: 'student', id: u.id })} className={styles.deleteBtn}>🗑️</button>
                      </span>
                    </div>
                  );
                })}
                {users.filter((u) => u.role === 'student').length === 0 && (
                  <div className={styles.emptyState}>
                    <p>No students registered yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Topic Form Modal ---- */}
      {showTopicForm && (
        <div className={styles.modalOverlay} onClick={() => setShowTopicForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>{editingTopic ? 'Edit Topic' : 'New Topic'}</h3>
              <button onClick={() => setShowTopicForm(false)} className={styles.modalClose}>✕</button>
            </div>
            
            {topicError && (
              <div className={styles.toastError} style={{ margin: '1rem 1.5rem 0', borderRadius: '10px' }}>
                ⚠️ {topicError}
              </div>
            )}

            <form onSubmit={handleTopicSubmit} id="topic-form" className={styles.modalForm}>
              <div className={styles.inputBlock}>
                <label htmlFor="topic-name">Topic Name</label>
                <input id="topic-name" className={styles.inputField} placeholder="e.g. JavaScript Fundamentals" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} required />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="topic-desc">Description</label>
                <textarea id="topic-desc" className={`${styles.inputField} ${styles.textarea}`} placeholder="Describe what this topic covers..." value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} required />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputBlock}>
                  <label htmlFor="topic-icon">Icon (emoji)</label>
                  <input id="topic-icon" className={styles.inputField} value={topicForm.icon} onChange={(e) => setTopicForm({ ...topicForm, icon: e.target.value })} placeholder="📚" maxLength={4} />
                </div>
                <div className={styles.inputBlock}>
                  <label htmlFor="topic-difficulty">Difficulty</label>
                  <select id="topic-difficulty" className={styles.inputField} value={topicForm.difficulty} onChange={(e) => setTopicForm({ ...topicForm, difficulty: e.target.value as Topic['difficulty'] })}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalBtns}>
                <button type="button" onClick={() => setShowTopicForm(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" id="topic-form-submit" className={styles.submitBtnModal}>{editingTopic ? 'Update' : 'Create'} Topic</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Question Form Modal ---- */}
      {showQuestionForm && (
        <div className={styles.modalOverlay} onClick={() => setShowQuestionForm(false)}>
          <div className={`${styles.modal} ${styles.modalLg}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>{editingQuestion ? 'Edit Question' : 'New Question'}</h3>
              <button onClick={() => setShowQuestionForm(false)} className={styles.modalClose}>✕</button>
            </div>
            <form onSubmit={handleQuestionSubmit} id="question-form" className={styles.modalForm}>
              <div className={styles.inputBlock}>
                <label htmlFor="q-topic">Topic</label>
                <select id="q-topic" className={styles.inputField} value={questionForm.topicId} onChange={(e) => setQuestionForm({ ...questionForm, topicId: e.target.value })} required>
                  <option value="">Select a topic</option>
                  {topics.map((t) => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                </select>
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="q-text">Question Text</label>
                <textarea id="q-text" className={`${styles.inputField} ${styles.textarea}`} placeholder="Enter the question..." value={questionForm.text} onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} required />
              </div>
              <div className={styles.inputBlock}>
                <label>Answer Options <span className={styles.labelHint}>(mark the correct one)</span></label>
                {questionForm.options.map((opt, i) => (
                  <div key={i} className={styles.optionRow}>
                    <input
                      type="radio"
                      id={`correct-${i}`}
                      name="correctAnswer"
                      checked={questionForm.correctAnswer === i}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: i })}
                      className={styles.radio}
                    />
                    <label htmlFor={`correct-${i}`} className={styles.optionLetter}>{String.fromCharCode(65 + i)}</label>
                    <input
                      id={`option-${i}`}
                      className={styles.inputField}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => {
                        const opts = [...questionForm.options];
                        opts[i] = e.target.value;
                        setQuestionForm({ ...questionForm, options: opts });
                      }}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputBlock}>
                  <label htmlFor="q-explanation">Explanation (optional)</label>
                  <input id="q-explanation" className={styles.inputField} placeholder="Why is this answer correct?" value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} />
                </div>
                <div className={styles.inputBlock}>
                  <label htmlFor="q-points">Points</label>
                  <input id="q-points" type="number" min={1} max={100} className={styles.inputField} value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: Number(e.target.value) })} required />
                </div>
              </div>
              <div className={styles.modalBtns}>
                <button type="button" onClick={() => setShowQuestionForm(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" id="question-form-submit" className={styles.submitBtnModal}>{editingQuestion ? 'Update' : 'Create'} Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Delete Confirm Modal ---- */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modalSm} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteIcon}>🗑️</div>
            <h3 className={styles.deleteTitle}>Confirm Delete</h3>
            <p className={styles.deleteText}>
              Are you sure you want to delete this {deleteConfirm.type}?
              {deleteConfirm.type === 'topic' && ' All associated questions will also be deleted.'}
              {deleteConfirm.type === 'student' && ' All associated results will also be deleted.'}
            </p>
            <div className={styles.modalBtns}>
              <button onClick={() => setDeleteConfirm(null)} className={styles.cancelBtn}>Cancel</button>
              <button
                id="confirm-delete-btn"
                onClick={() => {
                  if (deleteConfirm.type === 'topic') handleDeleteTopic(deleteConfirm.id);
                  else if (deleteConfirm.type === 'question') handleDeleteQuestion(deleteConfirm.id);
                  else if (deleteConfirm.type === 'student') handleDeleteStudent(deleteConfirm.id);
                }}
                className={styles.dangerBtn}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
