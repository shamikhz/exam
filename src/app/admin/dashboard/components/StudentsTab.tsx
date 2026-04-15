'use client';

import React from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { type User, type ExamResult } from '@/lib/storage';

interface StudentsTabProps {
  users: User[];
  results: ExamResult[];
  studentSearchQuery: string;
  setStudentSearchQuery: (val: string) => void;
  studentPage: number;
  setStudentPage: (val: number | ((p: number) => number)) => void;
  STUDENTS_PER_PAGE: number;
  onDeleteStudent: (id: string) => void;
  styles: any;
}

export function StudentsTab({
  users,
  results,
  studentSearchQuery,
  setStudentSearchQuery,
  studentPage,
  setStudentPage,
  STUDENTS_PER_PAGE,
  onDeleteStudent,
  styles
}: StudentsTabProps) {
  const filteredStudents = users
    .filter((u) => u.role === 'student')
    .filter((u) => 
      u.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );
  
  const currentStudents = filteredStudents.slice(
    (studentPage - 1) * STUDENTS_PER_PAGE,
    studentPage * STUDENTS_PER_PAGE
  );

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderLeft}>
          <h3>Student Records</h3>
          <div className={styles.adminSearchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input 
              type="text" 
              placeholder="Search name or email..." 
              value={studentSearchQuery}
              onChange={(e) => {
                setStudentSearchQuery(e.target.value);
                setStudentPage(1);
              }}
              className={styles.adminSearchInput}
            />
          </div>
        </div>
        <div className={styles.resultsCount}>
          Total: {filteredStudents.length} students
        </div>
      </div>

      <div className={styles.studentTable}>
        <div className={styles.tableHeader}>
          <span>Name</span>
          <span>Email</span>
          <span>Exams Taken</span>
          <span>Best Score</span>
          <span>Actions</span>
        </div>
        {currentStudents.map((u) => {
          const studentResults = results.filter((r) => r.studentId === u.id);
          const bestScore = studentResults.length > 0
            ? Math.max(...studentResults.map((r) => Math.round((r.score / r.totalPoints) * 100)))
            : null;
          return (
            <div key={u.id} className={styles.tableRow}>
              <div className={styles.studentName}>
                <div className={styles.avatarSmall}>{u.name.charAt(0).toUpperCase()}</div>
                {u.name}
              </div>
              <span className={styles.tableCell}>{u.email}</span>
              <span className={styles.tableCell}>{studentResults.length}</span>
              <span className={styles.tableCell}>
                {bestScore !== null
                  ? <span style={{ color: bestScore >= 60 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{bestScore}%</span>
                  : <span className={styles.noData}>—</span>}
              </span>
              <span className={styles.tableCell}>
                <button onClick={() => onDeleteStudent(u.id)} className={styles.deleteBtn}>🗑️</button>
              </span>
            </div>
          );
        })}
        
        {filteredStudents.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <p>{studentSearchQuery ? `No students match "${studentSearchQuery}"` : 'No students registered yet.'}</p>
            {studentSearchQuery && <button onClick={() => setStudentSearchQuery('')} className={styles.clearBtn}>Clear Search</button>}
          </div>
        )}
      </div>

      <Pagination 
        currentPage={studentPage}
        totalItems={filteredStudents.length}
        itemsPerPage={STUDENTS_PER_PAGE}
        onPageChange={setStudentPage}
        className={styles.pagination}
        btnClassName={styles.pageBtn}
        infoClassName={styles.pageInfo}
      />
    </div>
  );
}
