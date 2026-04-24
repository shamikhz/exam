'use client';

import React from 'react';
import { type Topic } from '@/lib/storage';

interface TopicsTabProps {
  topics: Topic[];
  selectedTopicView: string;
  setSelectedTopicView: (val: string) => void;
  onAddTopic: () => void;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
  difficultyColors: Record<string, string>;
  styles: any;
}

export function TopicsTab({
  topics,
  selectedTopicView,
  setSelectedTopicView,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  difficultyColors,
  styles
}: TopicsTabProps) {
  const filteredTopics = topics.filter(t => selectedTopicView === 'all' || t.id === selectedTopicView);

  return (
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
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon && (t.icon.startsWith('data:') || t.icon.startsWith('http')) ? '🖼️' : t.icon} {t.name}
              </option>
            ))}
          </select>
        </div>
        <button id="add-topic-btn" onClick={onAddTopic} className={styles.addBtn}>
          + Add Topic
        </button>
      </div>

      <div className={styles.topicsGrid}>
        {filteredTopics.map((t) => (
          <div key={t.id} className={styles.topicCard}>
            <div className={styles.topicCardHeader}>
              {t.icon && (t.icon.startsWith('data:') || t.icon.startsWith('http')) ? (
                <img src={t.icon} alt={t.name} className={styles.topicCardImg} />
              ) : (
                <span className={styles.topicCardIcon}>{t.icon}</span>
              )}
              <span className={styles.diffBadge} style={{ background: `${difficultyColors[t.difficulty]}20`, color: difficultyColors[t.difficulty] }}>
                {t.difficulty}
              </span>
            </div>
            <h4 className={styles.topicCardName}>{t.name}</h4>
            <p className={styles.topicCardDesc}>{t.description}</p>
            <div className={styles.topicCardMeta}>
              <span>❓ {t.questionCount} questions</span>
              <div className={styles.topicCardActions}>
                <button id={`edit-topic-${t.id}`} onClick={() => onAddTopic()} className={styles.editBtn}>✏️ Edit</button>
                <button id={`delete-topic-${t.id}`} onClick={() => onDeleteTopic(t.id)} className={styles.deleteBtn}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
        {topics.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <p>No topics yet. Create your first topic!</p>
            <button onClick={onAddTopic} className={styles.addBtn}>+ Add Topic</button>
          </div>
        )}
        {topics.length > 0 && selectedTopicView !== 'all' && filteredTopics.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <p>Topic not found.</p>
            <button onClick={() => setSelectedTopicView('all')} className={styles.clearBtn}>Show All</button>
          </div>
        )}
      </div>
    </div>
  );
}
