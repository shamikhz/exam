'use client';

import React, { useState, useRef } from 'react';
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
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const isSwiped = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    
    // Only allow swiping left to reveal, or right to hide if already swiped
    if (diff < 0) {
      // Swiping left
      const newOffset = isSwiped.current ? Math.max(-50, -50 + diff) : Math.max(-50, diff);
      setSwipeOffset(newOffset);
    } else if (diff > 0 && isSwiped.current) {
      // Swiping right to close
      const newOffset = Math.min(0, -50 + diff);
      setSwipeOffset(newOffset);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (swipeOffset < -25) {
      setSwipeOffset(-50);
      isSwiped.current = true;
    } else {
      setSwipeOffset(0);
      isSwiped.current = false;
    }
    touchStartX.current = null;
  };

  const pct = Math.round((result.score / result.totalPoints) * 100);

  return (
    <div className={styles.resultCard}>
      <div 
        className={styles.resultContent}
        style={{ 
          transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined,
          transition: isDragging ? 'none' : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.resultLeft}>
          {topic?.icon && (topic.icon.startsWith('data:') || topic.icon.startsWith('http')) ? (
            <img src={topic.icon} alt={topic.name} className={styles.resultImg} />
          ) : (
            <span className={styles.resultIcon}>{topic?.icon || '📋'}</span>
          )}
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
          </div>
        </div>
      </div>
      
      <div className={styles.resultActionsUnder}>
        <button
          onClick={() => {
            onDelete(result.id);
            setSwipeOffset(0);
            isSwiped.current = false;
          }}
          className={styles.deleteResultBtn}
          title="Delete Result"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
