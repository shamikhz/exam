'use client';

import React from 'react';
import { type Topic, type Question } from '@/lib/storage';

interface ExamViewProps {
  examTopic: Topic;
  examQuestions: Question[];
  currentQ: number;
  setCurrentQ: (idx: number) => void;
  selectedAnswers: number[];
  selectAnswer: (idx: number) => void;
  submitExam: () => void;
  styles: any;
}

export function ExamView({
  examTopic,
  examQuestions,
  currentQ,
  setCurrentQ,
  selectedAnswers,
  selectAnswer,
  submitExam,
  styles
}: ExamViewProps) {
  return (
    <div className={styles.examView}>
      {/* Progress */}
      <div className={styles.OptimaSkillgress}>
        <div className={styles.OptimaSkillgressInfo}>
          <span>
            {examTopic.icon && (examTopic.icon.startsWith('data:') || examTopic.icon.startsWith('http')) ? (
              <img src={examTopic.icon} alt={examTopic.name} className={styles.examTopicImg} />
            ) : (
              examTopic.icon
            )} {examTopic.name}
          </span>
          <span>Question {currentQ + 1} of {examQuestions.length}</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${((currentQ + 1) / examQuestions.length) * 100}%` }}
          />
        </div>
        <div className={styles.qDots}>
          {examQuestions.map((_, i) => (
            <button
              key={i}
              id={`q-dot-${i}`}
              onClick={() => setCurrentQ(i)}
              className={`${styles.qDot} ${i === currentQ ? styles.qDotActive : selectedAnswers[i] > -1 ? styles.qDotAnswered : ''}`}
              aria-label={`Question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className={styles.questionCard}>
        <div className={styles.questionHeader}>
          <span className={styles.questionNum}>Q{currentQ + 1}</span>
          <span className={styles.questionPoints}>{examQuestions[currentQ].points} pts</span>
        </div>
        <p className={styles.questionText}>{examQuestions[currentQ].text}</p>

        <div className={styles.optionsList}>
          {examQuestions[currentQ].options.map((opt, i) => (
            <button
              key={i}
              id={`option-${i}`}
              onClick={() => selectAnswer(i)}
              className={`${styles.optionBtn} ${selectedAnswers[currentQ] === i ? styles.optionBtnSelected : ''}`}
            >
              <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        <div className={styles.examNavRow}>
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className={styles.navBtn}
          >
            ← Prev
          </button>

          {currentQ < examQuestions.length - 1 ? (
            <button
              id="next-question"
              onClick={() => setCurrentQ(currentQ + 1)}
              className={styles.navBtnPrimary}
            >
              Next →
            </button>
          ) : (
            <button
              id="submit-exam"
              onClick={submitExam}
              className={styles.submitExamBtn}
            >
              Submit Exam ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
