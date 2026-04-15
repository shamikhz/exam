'use client';

import React from 'react';
import { type Topic, type ExamResult } from '@/lib/storage';

interface TopicCardProps {
  topic: Topic;
  myResults: ExamResult[];
  onStartExam: (topic: Topic) => void;
  difficultyColors: Record<string, string>;
  styles: any;
}

export function TopicCard({
  topic,
  myResults,
  onStartExam,
  difficultyColors,
  styles
}: TopicCardProps) {
  const topicResults = myResults.filter((r) => r.topicId === topic.id);
  const lastResult = topicResults[topicResults.length - 1];
  const lastPercent = (lastResult && lastResult.totalPoints > 0) 
    ? Math.round((lastResult.score / lastResult.totalPoints) * 100) 
    : null;

  return (
    <div className={styles.topicCard}>
      <div className={styles.topicCardTop}>
        <span className={styles.topicIcon}>{topic.icon}</span>
        <span className={styles.diffBadge} style={{ background: `${difficultyColors[topic.difficulty]}20`, color: difficultyColors[topic.difficulty] }}>
          {topic.difficulty}
        </span>
      </div>
      <h3 className={styles.topicName}>{topic.name}</h3>
      <p className={styles.topicDesc}>{topic.description}</p>
      <div className={styles.topicMeta}>
        <span className={styles.topicQCount}>❓ {topic.questionCount} questions</span>
        {lastPercent !== null && (
          <span className={styles.topicLastScore} style={{ color: lastPercent >= 60 ? '#10b981' : '#ef4444' }}>
            Last: {lastPercent}%
          </span>
        )}
      </div>
      <button
        id={`start-exam-${topic.id}`}
        onClick={() => onStartExam(topic)}
        className={styles.startBtn}
        disabled={!topic.questionCount}
      >
        {topic.questionCount ? (lastPercent !== null ? '🔄 Retake Exam' : '▶ Start Exam') : '📭 No Questions'}
      </button>
    </div>
  );
}
