'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { type Topic } from '@/lib/storage';

interface OverviewTabProps {
  stats: {
    topicsCount: number;
    questionsCount: number;
    studentsCount: number;
    examsCount: number;
    avgScore: number;
    passRate: number;
    subjectsCount: number;
  };
  topics: Topic[];
  difficultyColors: Record<string, string>;
  styles: any;
}

export function OverviewTab({
  stats,
  topics,
  difficultyColors,
  styles
}: OverviewTabProps) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid}>
        <StatCard 
          icon="📚" value={stats.topicsCount} label="Total Topics"
          className={styles.statCard} iconClassName={styles.statCardIcon}
          infoClassName={styles.statCardInfo} valueClassName={styles.statCardValue}
          labelClassName={styles.statCardLabel}
          iconStyle={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}
        />
        <StatCard 
          icon="❓" value={stats.questionsCount} label="Questions"
          className={styles.statCard} iconClassName={styles.statCardIcon}
          infoClassName={styles.statCardInfo} valueClassName={styles.statCardValue}
          labelClassName={styles.statCardLabel}
          iconStyle={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}
        />
        <StatCard 
          icon="👥" value={stats.studentsCount} label="Students"
          className={styles.statCard} iconClassName={styles.statCardIcon}
          infoClassName={styles.statCardInfo} valueClassName={styles.statCardValue}
          labelClassName={styles.statCardLabel}
          iconStyle={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
        />
        <StatCard 
          icon="🏷️" value={stats.subjectsCount} label="Total Subjects"
          className={styles.statCard} iconClassName={styles.statCardIcon}
          infoClassName={styles.statCardInfo} valueClassName={styles.statCardValue}
          labelClassName={styles.statCardLabel}
          iconStyle={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}
        />
        <StatCard 
          icon="📋" value={stats.examsCount} label="Exams Taken"
          className={styles.statCard} iconClassName={styles.statCardIcon}
          infoClassName={styles.statCardInfo} valueClassName={styles.statCardValue}
          labelClassName={styles.statCardLabel}
          iconStyle={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}
        />
      </div>

      <div className={styles.overviewRow}>
        <div className={styles.overviewCard}>
          <h3>Performance Summary</h3>
          <div className={styles.perfMetrics}>
            <div className={styles.perfMetric}>
              <div className={styles.perfLabel}>Avg Score</div>
              <div className={styles.perfValue} style={{ color: '#2563eb' }}>{stats.avgScore} pts</div>
            </div>
            <div className={styles.perfMetric}>
              <div className={styles.perfLabel}>Pass Rate</div>
              <div className={styles.perfValue} style={{ color: '#10b981' }}>{stats.passRate}%</div>
            </div>
            <div className={styles.perfMetric}>
              <div className={styles.perfLabel}>Total Attempts</div>
              <div className={styles.perfValue} style={{ color: '#7c3aed' }}>{stats.examsCount}</div>
            </div>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <h3>Recent Topics</h3>
          <div className={styles.topicList}>
            {topics.slice(-4).map((t) => (
              <div key={t.id} className={styles.topicListItem}>
                {t.icon && (t.icon.startsWith('data:') || t.icon.startsWith('http')) ? (
                  <img src={t.icon} alt={t.name} className={styles.topicListImg} />
                ) : (
                  <span>{t.icon}</span>
                )}
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
  );
}
