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
        <div 
          className={styles.logoClickable} 
          onClick={onBack}
          style={{ cursor: view !== 'dashboard' ? 'pointer' : 'default' }}
        >
          <span className={styles.logo}>🎓</span>
          <div className={styles.logoTextWrapper}>
            <span className={styles.logoText}>OptimaSkill</span>
            <span className={styles.logoTagline}>the best skill</span>
          </div>
        </div>
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
