'use client';

import React from 'react';
import { type Topic, type Question } from '@/lib/storage';

interface QuestionsTabProps {
  topics: Topic[];
  filteredQuestions: Question[];
  selectedTopicFilter: string;
  setSelectedTopicFilter: (val: string) => void;
  onAddQuestion: () => void;
  onEditQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  styles: any;
}

export function QuestionsTab({
  topics,
  filteredQuestions,
  selectedTopicFilter,
  setSelectedTopicFilter,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  styles
}: QuestionsTabProps) {
  return (
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
        <button id="add-question-btn" onClick={onAddQuestion} className={styles.addBtn}>
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
                <button id={`edit-q-${q.id}`} onClick={() => onEditQuestion(q)} className={styles.editBtn}>✏️</button>
                <button id={`delete-q-${q.id}`} onClick={() => onDeleteQuestion(q.id)} className={styles.deleteBtn}>🗑️</button>
              </div>
            </div>
          );
        })}
        {filteredQuestions.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>❓</div>
            <p>No questions yet. Add your first question!</p>
            <button onClick={onAddQuestion} className={styles.addBtn}>+ Add Question</button>
          </div>
        )}
      </div>
    </div>
  );
}
