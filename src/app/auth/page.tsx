'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAny, register, getCurrentUser, seedDefaultData, type AuthState } from '@/lib/storage';
import { useTheme } from '@/lib/ThemeProvider';
import styles from './auth.module.css';

type Mode = 'login' | 'register';
type Role = 'student' | 'admin';

const SOCIAL_OPTIONS = [
  { id: 'google', label: 'Continue with Google', icon: '🌐', color: '#4285f4' },
  { id: 'github', label: 'Continue with GitHub', icon: '🐙', color: '#333' },
  { id: 'microsoft', label: 'Continue with Microsoft', icon: '🪟', color: '#00a4ef' },
];

export default function AuthPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('student');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  useEffect(() => {
    seedDefaultData();
    const user = getCurrentUser();
    if (user) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    }
  }, [router]);

  function resetForm() {
    setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setError('');
  }

  function switchMode(m: Mode) {
    setMode(m);
    resetForm();
  }

  function selectRole(r: Role) {
    setRole(r);
    if (r === 'admin') {
      setMode('login');
      resetForm();
    }
  }

  function redirectByRole(auth: AuthState) {
    router.push(auth.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim()) { setError('Please enter your full name.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    if (mode === 'login') {
      const result = loginAny(email.trim().toLowerCase(), password);
      if (!result) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }
      redirectByRole(result);
    } else {
      const result = register(name, email, password, role);
      if (typeof result === 'string') {
        setError(result);
        setLoading(false);
        return;
      }
      redirectByRole(result);
    }
    setLoading(false);
  }

  async function handleSocial(id: string) {
    setSocialLoading(id);
    await new Promise((r) => setTimeout(r, 1000));
    // For demo: auto-create/login a guest account tied to that provider
    const email = `${id}-demo@examapp.com`;
    const existing = loginAny(email, 'social-auth-demo');
    if (existing) {
      redirectByRole(existing);
    } else {
      const result = register(`${id.charAt(0).toUpperCase() + id.slice(1)} User`, email, 'social-auth-demo', role);
      if (typeof result !== 'string') redirectByRole(result);
    }
    setSocialLoading(null);
  }

  const fillDemo = () => {
    if (mode === 'login') {
      setEmail(role === 'admin' ? 'admin@examapp.com' : 'student@examapp.com');
      setPassword(role === 'admin' ? 'admin123' : 'student123');
    }
  };

  return (
    <div className={styles.page}>
      {/* Background decorations */}
      <div className={styles.bgBlob1} aria-hidden="true" />
      <div className={styles.bgBlob2} aria-hidden="true" />
      <div className={styles.bgGrid} aria-hidden="true" />

      {/* Top bar */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>ExamTop</span>
        </Link>
        <button id="auth-theme-toggle" onClick={toggleTheme} className={styles.themeBtn} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main content */}
      <main className={styles.main}>
        {/* Left: branding */}
        <aside className={styles.brand}>
          <div className={styles.brandInner}>
            <div className={styles.brandTagline}>
              <span className={styles.brandBadge}>✨ Trusted by 10,000+ learners</span>
            </div>
            <h1 className={styles.brandTitle}>
              {mode === 'login' ? 'Welcome\nback!' : 'Join the\nlearning\nrevolution.'}
            </h1>
            <p className={styles.brandDesc}>
              {mode === 'login'
                ? 'Sign in to access your personalized dashboard, track progress, and continue your learning journey.'
                : 'Create your free account and unlock access to hundreds of expert-crafted exam topics and smart analytics.'}
            </p>

            {/* Testimonial card */}
            <div className={styles.testimonial}>
              <div className={styles.testimonialAvatar}>👩‍💻</div>
              <div className={styles.testimonialBody}>
                <p className={styles.testimonialText}>
                  "ExamTop helped me pass my certification exam on the first try. The explanations are incredible!"
                </p>
                <div className={styles.testimonialAuthor}>Sarah K. — Software Engineer</div>
              </div>
            </div>

            {/* Stats */}
            <div className={styles.brandStats}>
              {[
                { v: '10K+', l: 'Students' },
                { v: '500+', l: 'Topics' },
                { v: '98%', l: 'Pass Rate' },
              ].map((s) => (
                <div key={s.l} className={styles.brandStat}>
                  <span className={styles.brandStatValue}>{s.v}</span>
                  <span className={styles.brandStatLabel}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right: auth card */}
        <div className={styles.cardWrap}>
          <div className={styles.card}>

            {/* Mode tabs */}
            <div className={styles.modeTabs}>
              <button
                id="tab-login"
                onClick={() => switchMode('login')}
                className={`${styles.modeTab} ${mode === 'login' ? styles.modeTabActive : ''}`}
              >
                Sign In
              </button>
              {role === 'student' && (
                <button
                  id="tab-register"
                  onClick={() => switchMode('register')}
                  className={`${styles.modeTab} ${mode === 'register' ? styles.modeTabActive : ''}`}
                >
                  Create Account
                </button>
              )}
            </div>

            {/* Role selector cards */}
            <div className={styles.roleSection}>
              <p className={styles.roleLabel}>I am a</p>
              <div className={styles.roleCards}>
                <button
                  id="role-student"
                  onClick={() => selectRole('student')}
                  className={`${styles.roleCard} ${role === 'student' ? styles.roleCardActive : ''}`}
                >
                  <span className={styles.roleCardIcon}>🎓</span>
                  <span className={styles.roleCardName}>Student</span>
                  <span className={styles.roleCardDesc}>Take exams & learn</span>
                  {role === 'student' && <span className={styles.roleCheckmark}>✓</span>}
                </button>
                <button
                  id="role-admin"
                  onClick={() => selectRole('admin')}
                  className={`${styles.roleCard} ${styles.roleCardAdmin} ${role === 'admin' ? styles.roleCardActiveAdmin : ''}`}
                >
                  <span className={styles.roleCardIcon}>⚙️</span>
                  <span className={styles.roleCardName}>Admin</span>
                  <span className={styles.roleCardDesc}>Manage & monitor</span>
                  {role === 'admin' && <span className={styles.roleCheckmark}>✓</span>}
                </button>
              </div>
            </div>

            {/* Social sign-in options — hidden for admin */}
            {role === 'student' && (
              <div className={styles.socialSection}>
                {SOCIAL_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    id={`social-${s.id}`}
                    onClick={() => handleSocial(s.id)}
                    className={styles.socialBtn}
                    disabled={socialLoading !== null}
                  >
                    {socialLoading === s.id ? (
                      <span className={styles.spinnerSm} />
                    ) : (
                      <span className={styles.socialIcon}>{s.icon}</span>
                    )}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Divider — hidden for admin */}
            {role === 'student' && (
              <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerText}>or {mode === 'login' ? 'sign in' : 'sign up'} with email</span>
                <span className={styles.dividerLine} />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} id="auth-form" className={styles.form} noValidate>
              {mode === 'register' && (
                <div className={styles.inputBlock}>
                  <label htmlFor="auth-name">Full Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    className={styles.inputField}
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div className={styles.inputBlock}>
                <label htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  className={styles.inputField}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className={styles.inputBlock}>
                <div className={styles.labelRow}>
                  <label htmlFor="auth-password">Password</label>
                  {mode === 'login' && (
                    <button type="button" className={styles.forgotLink} onClick={fillDemo}>
                      Use demo account →
                    </button>
                  )}
                </div>
                <div className={styles.inputWrap}>
                  <input
                    id="auth-password"
                    type={showPass ? 'text' : 'password'}
                    className={styles.inputField}
                    placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPass((p) => !p)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className={styles.inputBlock}>
                  <label htmlFor="auth-confirm">Confirm Password</label>
                  <input
                    id="auth-confirm"
                    type={showPass ? 'text' : 'password'}
                    className={styles.inputField}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {error && (
                <div className={styles.errorBox} role="alert">
                  ⚠️ {error}
                </div>
              )}

              <button
                id="auth-submit"
                type="submit"
                className={`${styles.submitBtn} ${role === 'admin' ? styles.submitBtnAdmin : styles.submitBtnStudent}`}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : mode === 'login' ? (
                  `Sign In as ${role === 'admin' ? 'Admin' : 'Student'}`
                ) : (
                  `Create ${role === 'admin' ? 'Admin' : 'Student'} Account`
                )}
              </button>
            </form>

            {/* Demo hint */}
            {mode === 'login' && (
              <div className={styles.demoHint}>
                <span className={styles.demoHintIcon}>💡</span>
                <span>
                  Demo: <strong>{role === 'admin' ? 'admin@examapp.com / admin123' : 'student@examapp.com / student123'}</strong>
                </span>
              </div>
            )}

            {/* Switch mode — hidden for admin */}
            {role === 'student' && (
              <p className={styles.switchText}>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  id="switch-mode"
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className={styles.switchBtn}
                >
                  {mode === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
