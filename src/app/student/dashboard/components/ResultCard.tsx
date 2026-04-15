'use client';

import React from 'react';
import { type ExamResult, type Topic } from '@/lib/storage';

interface ResultCardProps {
  result: ExamResult;
  topic?: Topic;
  onReview: (result: ExamResult) => void;
  onDelete: (id: string) => void;
  styles: any;
}

export function ResultCard({
  result,
  topic,
  onReview,
  onDelete,
  styles
}: ResultCardProps) {
  const pct = Math.round((result.score / result.totalPoints) * 100);

  return (
    <div className={styles.resultCard}>
      <div className={styles.resultLeft}>
        <span className={styles.resultIcon}>{topic?.icon || '📋'}</span>
        <div>
          <div className={styles.resultTopic}>{topic?.name || 'Unknown Topic'}</div>
          <div className={styles.resultDate}>
            {new Date(result.completedAt).toLocaleDateString()} at {new Date(result.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div className={styles.resultRight}>
        <div className={styles.scoreInfo}>
          <div className={styles.resultScore} style={{ color: pct >= 60 ? '#10b981' : '#ef4444' }}>
            {pct}%
          </div>
          <div className={styles.resultPts}>{result.score}/{result.totalPoints} pts</div>
        </div>
        <div className={styles.resultActions}>
          <button
            id={`review-result-${result.id}`}
            onClick={() => onReview(result)}
            className={styles.reviewBtn}
            title="Review Answers"
          >
            Review
          </button>
          <button
            onClick={() => onDelete(result.id)}
            className={styles.deleteResultBtn}
            title="Delete Result"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
