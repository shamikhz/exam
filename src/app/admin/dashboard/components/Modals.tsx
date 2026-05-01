'use client';

import React from 'react';
import { type Topic, type Question, type User } from '@/lib/storage';

interface ModalsProps {
  // Topic Modal
  showTopicForm: boolean;
  setShowTopicForm: (show: boolean) => void;
  editingTopic: Topic | null;
  topicForm: { name: string; description: string; icon: string; difficulty: string; subject: string };
  setTopicForm: (form: any) => void;
  topicError: string;
  handleTopicSubmit: (e: React.FormEvent) => void;
  
  // Question Modal
  showQuestionForm: boolean;
  setShowQuestionForm: (show: boolean) => void;
  editingQuestion: Question | null;
  questionForm: { topicId: string; text: string; options: string[]; correctAnswer: number; explanation: string; points: number };
  setQuestionForm: (form: any) => void;
  questionError: string;
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
  showQuestionForm, setShowQuestionForm, editingQuestion, questionForm, setQuestionForm, questionError, handleQuestionSubmit, topics,
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
                <label htmlFor="topic-subject">Subject</label>
                <input 
                  id="topic-subject" 
                  className={styles.inputField} 
                  placeholder="e.g. Computer Science, Mathematics" 
                  value={topicForm.subject} 
                  onChange={(e) => setTopicForm({ ...topicForm, subject: e.target.value })} 
                  list="subject-list"
                  required 
                />
                <datalist id="subject-list">
                  {Array.from(new Set(topics.map(t => t.subject).filter(Boolean))).sort().map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="topic-desc">Description</label>
                <textarea id="topic-desc" className={`${styles.inputField} ${styles.textarea}`} placeholder="Describe what this topic covers..." value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} required />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputBlock}>
                  <label htmlFor="topic-icon">Topic Icon</label>
                  <div className={styles.fileInputContainer}>
                    <input 
                      type="file" 
                      id="topic-icon" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Image is too large. Please select an image smaller than 2MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTopicForm((prev: any) => ({ ...prev, icon: reader.result as string }));
                          };
                          reader.onerror = () => {
                            alert('Failed to read file. Please try again.');
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className={styles.fileInput}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="topic-icon" className={styles.fileInputLabel}>
                      {topicForm.icon && (topicForm.icon.startsWith('data:') || topicForm.icon.startsWith('http')) ? (
                        <div className={styles.iconPreview}>
                          <img src={topicForm.icon} alt="Topic Icon" />
                          <span>Change Image</span>
                        </div>
                      ) : (
                        <div className={styles.iconPlaceholder}>
                          <span className={styles.placeholderIcon}>🖼️</span>
                          <span>{topicForm.icon || 'Select Topic Image'}</span>
                        </div>
                      )}
                    </label>
                  </div>
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

            {questionError && (
              <div className={styles.toastError} style={{ margin: '1rem 1.5rem 0', borderRadius: '10px' }}>
                ⚠️ {questionError}
              </div>
            )}

            <form onSubmit={handleQuestionSubmit} id="question-form" className={styles.modalForm}>
              <div className={styles.inputBlock}>
                <label htmlFor="q-topic">Topic</label>
                <select id="q-topic" className={styles.inputField} value={questionForm.topicId} onChange={(e) => setQuestionForm({ ...questionForm, topicId: e.target.value })} required>
                  <option value="">Select a topic</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon && (t.icon.startsWith('data:') || t.icon.startsWith('http')) ? '🖼️' : t.icon} {t.name}
                    </option>
                  ))}
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
