'use client';

import React from 'react';
import { type Topic, type Question, type User } from '@/lib/storage';

interface ModalsProps {
  // Topic Modal
  showTopicForm: boolean;
  setShowTopicForm: (show: boolean) => void;
  editingTopic: Topic | null;
  topicForm: { name: string; description: string; icon: string; difficulty: string };
  setTopicForm: (form: any) => void;
  topicError: string;
  handleTopicSubmit: (e: React.FormEvent) => void;
  
  // Question Modal
  showQuestionForm: boolean;
  setShowQuestionForm: (show: boolean) => void;
  editingQuestion: Question | null;
  questionForm: { topicId: string; text: string; options: string[]; correctAnswer: number; explanation: string; points: number };
  setQuestionForm: (form: any) => void;
  handleQuestionSubmit: (e: React.FormEvent) => void;
  topics: Topic[];
  
  // Delete Modal
  deleteConfirm: { type: 'topic' | 'question' | 'student'; id: string } | null;
  setDeleteConfirm: (confirm: any) => void;
  users: User[];
  handleDeleteTopic: (id: string) => void;
  handleDeleteQuestion: (id: string) => void;
  handleDeleteStudent: (id: string) => void;
  
  styles: any;
}

export function Modals({
  showTopicForm, setShowTopicForm, editingTopic, topicForm, setTopicForm, topicError, handleTopicSubmit,
  showQuestionForm, setShowQuestionForm, editingQuestion, questionForm, setQuestionForm, handleQuestionSubmit, topics,
  deleteConfirm, setDeleteConfirm, users, handleDeleteTopic, handleDeleteQuestion, handleDeleteStudent,
  styles
}: ModalsProps) {
  return (
    <>
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
                <select id="q-topic" className={styles.inputField} value={questionForm.topicId} onChange={(e) => setTopicForm({ ...questionForm, topicId: e.target.value })} required>
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
              {deleteConfirm.type === 'student' ? (
                <>Are you sure you want to delete student <strong>{users.find(u => u.id === deleteConfirm.id)?.name}</strong>?</>
              ) : deleteConfirm.type === 'topic' ? (
                <>Are you sure you want to delete topic <strong>{topics.find(t => t.id === deleteConfirm.id)?.name}</strong>?</>
              ) : (
                <>Are you sure you want to delete this {deleteConfirm.type}?</>
              )}
              <br />
              {deleteConfirm.type === 'topic' && ' All associated questions will also be deleted.'}
              {deleteConfirm.type === 'student' && ' All associated results will also be deleted.'}
              <br />
              This action cannot be undone.
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
    </>
  );
}
