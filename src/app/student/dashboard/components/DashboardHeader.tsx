'use client';

import React from 'react';
import Link from 'next/link';

interface DashboardHeaderProps {
  view: string;
  onBack: () => void;
  examStarted: boolean;
  timeLeft: number;
  formatTime: (secs: number) => string;
  userAvatar: string | null;
  userName: string;
  userEmail: string;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  toggleTheme: () => void;
  theme: string | undefined;
  onLogout: () => void;
  styles: any;
}

export function DashboardHeader({
  view,
  onBack,
  examStarted,
  timeLeft,
  formatTime,
  userAvatar,
  userName,
  userEmail,
  isMenuOpen,
  setIsMenuOpen,
  toggleTheme,
  theme,
  onLogout,
  styles
}: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <span className={styles.logo}>🎓</span>
        <span className={styles.logoText}>OptimaPath</span>
        {view !== 'dashboard' && (
          <button onClick={onBack} className={styles.backBtn}>
            ← Back
          </button>
        )}
      </div>
      <div className={styles.headerRight}>
        {view === 'exam' && examStarted && (
          <div className={`${styles.timer} ${timeLeft < 60 ? styles.timerWarning : ''}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
        
        <div className={styles.avatarGroup}>
          <button 
            id="student-avatar-btn"
            className={styles.avatarBtn} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="User menu"
          >
            <div className={styles.avatar}>
              {userAvatar ? (
                <img src={userAvatar} alt="" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
          </button>

          {isMenuOpen && (
            <>
              <div className={styles.overlay} style={{ background: 'transparent', zIndex: 90 }} onClick={() => setIsMenuOpen(false)} />
              <div className={styles.userDropdown}>
                <div className={styles.dropdownInfo}>
                  <div className={styles.dropdownName}>{userName}</div>
                  <div className={styles.dropdownEmail}>{userEmail}</div>
                </div>
                <Link href="/profile" className={styles.dropdownLink}>
                  <span className={styles.dropdownIcon}>👤</span>
                  Profile Settings
                </Link>
                <button onClick={toggleTheme} className={styles.dropdownLink}>
                  <span className={styles.dropdownIcon}>{theme === 'dark' ? '☀️' : '🌙'}</span>
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={onLogout} className={`${styles.dropdownLink} ${styles.dropdownLogout}`}>
                  <span className={styles.dropdownIcon}>🚪</span>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
