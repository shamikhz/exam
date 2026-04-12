'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/ThemeProvider';
import styles from './page.module.css';

const features = [
  { icon: '🎯', title: 'Smart Assessments', desc: 'Adaptive quizzes that challenge and grow with learners.' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Instant score breakdowns and detailed performance insights.' },
  { icon: '🔐', title: 'Secure & Reliable', desc: 'Role-based access ensuring data privacy at every step.' },
  { icon: '🌙', title: 'Dark & Light Mode', desc: 'Comfortable study sessions any time of day or night.' },
  { icon: '📱', title: 'Fully Responsive', desc: 'Seamless experience on desktop, tablet, and mobile.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Powered by Next.js for near-instant page loads.' },
];

const stats = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Topics' },
  { value: '15K+', label: 'Questions' },
  { value: '98%', label: 'Satisfaction' },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.page}>
      {/* ---- Navbar ---- */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navBrand}>
          <span className={styles.navLogo}>⚡</span>
          <span className={styles.navTitle}>ExamTop</span>
        </div>
        <div className={styles.navActions}>
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link href="/auth" id="nav-signin" className={styles.navBtnSecondary}>Sign In</Link>
          <Link href="/auth" id="nav-getstarted" className={styles.navBtnPrimary}>Get Started →</Link>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🎓 The Future of Online Testing</div>
          <h1 className={styles.heroTitle}>
            Elevate Learning with{' '}
            <span className={styles.heroGradientText}>Smart Exams</span>
          </h1>
          <p className={styles.heroSubtitle}>
            A powerful, beautiful exam platform for educators and students.
            Create, manage, and take exams with confidence — anytime, anywhere.
          </p>
          <div className={styles.heroCTA}>
            <Link href="/auth" id="hero-student-cta" className={styles.heroBtnPrimary}>
              🎓 Get Started Free
            </Link>
            <Link href="/auth" id="hero-admin-cta" className={styles.heroBtnOutline}>
              Sign In →
            </Link>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.mockCard}>
            <div className={styles.mockHeader}>
              <span className={styles.mockDot} style={{ background: '#ef4444' }} />
              <span className={styles.mockDot} style={{ background: '#f59e0b' }} />
              <span className={styles.mockDot} style={{ background: '#10b981' }} />
              <span className={styles.mockTitle}>React &amp; Next.js — Q5 of 10</span>
            </div>
            <div className={styles.mockBody}>
              <p className={styles.mockQuestion}>Pages are Server Components by default in Next.js 15 App Router.</p>
              <div className={styles.mockOptions}>
                {['True ✓', 'False', 'Only in production', 'Only with TypeScript'].map((opt, i) => (
                  <div key={i} className={`${styles.mockOption} ${i === 0 ? styles.mockOptionCorrect : ''}`}>
                    <span className={styles.mockOptLetter}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </div>
                ))}
              </div>
              <div className={styles.mockProgress}>
                <div className={styles.mockProgressBar} style={{ width: '50%' }} />
              </div>
            </div>
          </div>
          <div className={styles.floatBadge1}>🏆 Score: 85%</div>
          <div className={styles.floatBadge2}>⏱ 4:32 left</div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Why ExamTop?</span>
          <h2 className={styles.sectionTitle}>Everything you need to run great exams</h2>
          <p className={styles.sectionSubtitle}>
            Purpose-built tools for admins and students — from question creation to final results.
          </p>
        </div>
        <div className={styles.featureGrid}>
          {features.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Panels CTA ---- */}
      <section className={styles.panels}>
        <div className={styles.panelCard} id="panel-student">
          <div className={styles.panelIcon}>🎓</div>
          <h2 className={styles.panelTitle}>Student Panel</h2>
          <p className={styles.panelDesc}>
            Browse topics, take timed exams, review answers, and track your learning journey through an intuitive dashboard.
          </p>
          <ul className={styles.panelList}>
            <li>✅ Browse available exam topics</li>
            <li>✅ Take timed, scored exams</li>
            <li>✅ Review answers with explanations</li>
            <li>✅ Track your progress over time</li>
          </ul>
          <Link href="/auth" className={styles.panelBtn} id="panel-student-btn">
            Get Started →
          </Link>
        </div>

        <div className={`${styles.panelCard} ${styles.panelCardAccent}`} id="panel-admin">
          <div className={styles.panelIcon}>⚙️</div>
          <h2 className={styles.panelTitle}>Admin Panel</h2>
          <p className={styles.panelDesc}>
            Create and manage topics, write questions, set difficulty levels, and gain insights through rich analytics dashboards.
          </p>
          <ul className={styles.panelList}>
            <li>✅ Create &amp; manage exam topics</li>
            <li>✅ Add questions with explanations</li>
            <li>✅ Monitor student performance</li>
            <li>✅ Export and manage data</li>
          </ul>
          <Link href="/auth" className={styles.panelBtnWhite} id="panel-admin-btn">
            Admin Access →
          </Link>
        </div>
      </section>

    </div>
  );
}
