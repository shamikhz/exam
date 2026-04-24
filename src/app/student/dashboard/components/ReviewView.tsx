'use client';

import React from 'react';
import { type ExamResult, type Topic, type Question } from '@/lib/storage';

interface ReviewViewProps {
  reviewResult: ExamResult;
  reviewTopic: Topic;
  reviewQuestions: Question[];
  formatTime: (secs: number) => string;
  onBackToDashboard: () => void;
  styles: any;
}

export function ReviewView({
  reviewResult,
  reviewTopic,
  reviewQuestions,
  formatTime,
  onBackToDashboard,
  styles
}: ReviewViewProps) {
  const scorePercent = Math.round((reviewResult.score / reviewResult.totalPoints) * 100);
  const isPassed = scorePercent >= 60;

  return (
    <div className={styles.reviewView}>
      {/* Score card */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreCircle} style={{
          background: isPassed
            ? 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
        }}>
          <div
            className={styles.scorePercent}
            style={{ color: isPassed ? '#10b981' : '#ef4444' }}
          >
            {scorePercent}%
          </div>
          <div className={styles.scoreLabel}>
            {isPassed ? '🎉 Passed!' : '😔 Failed'}
          </div>
        </div>
        <div className={styles.scoreMeta}>
          <div className={styles.scoreMetaItem}>
            <span className={styles.scoreMetaLabel}>Topic</span>
            <span className={styles.scoreMetaValue}>
              {reviewTopic.icon && (reviewTopic.icon.startsWith('data:') || reviewTopic.icon.startsWith('http')) ? (
                <img src={reviewTopic.icon} alt={reviewTopic.name} className={styles.reviewTopicImg} />
              ) : (
                reviewTopic.icon
              )} {reviewTopic.name}
            </span>
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
        <button id="back-to-dashboard" onClick={onBackToDashboard} className={styles.backToDashBtn}>
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
  );
}
