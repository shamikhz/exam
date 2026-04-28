'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAny, loginWithoutPassword, register, getCurrentUser, seedDefaultData, checkUserExists, finalizeSocialLogin, type AuthState } from '@/lib/storage';
import { useTheme } from '@/lib/ThemeProvider';
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from './auth.module.css';

type Mode = 'login' | 'register';
type Role = 'student' | 'admin';

const SOCIAL_OPTIONS = [
  { id: 'google', label: 'Continue with Google', icon: '🌐', color: '#4285f4' },
  { id: 'github', label: 'Continue with GitHub', icon: '🐙', color: '#333' },
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
  // Optimized startup: Check for user before showing seeding state
  const [seeding, setSeeding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !getCurrentUser();
    }
    return true;
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      return;
    }

    // Heavy init (seeding) happens in the background only if needed
    const init = async () => {
      try {
        await seedDefaultData();
      } catch (err) {
        console.error("Failed to seed data:", err);
      } finally {
        setSeeding(false);
      }
    };
    init();

    const searchParams = new URLSearchParams(window.location.search);
    const initialRole = searchParams.get('role');
    const initialMode = searchParams.get('mode');

    if (initialRole === 'admin') {
      setRole('admin');
      setMode('login');
    } else if (initialMode === 'register') {
      setMode('register');
      if (initialRole === 'student' || !initialRole) {
        setRole('student');
      }
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

    if (mode === 'login') {
      const result = await loginAny(email.trim().toLowerCase(), password);
      if (!result) {
        setError('Incorrect email or password. Please try again.');
        setLoading(false);
        return;
      }
      redirectByRole(result);
    } else {
      const result = await register(name, email, password, role);
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
    if (!auth || !auth.app) {
      setError("Authentication is not initialized. Please check your connection.");
      return;
    }

    setSocialLoading(id);
    setError("");

    // Instant UI recovery: if the user returns to the main window, 
    // we assume the popup was closed or the process was interrupted.
    const handleFocus = () => {
      window.removeEventListener('focus', handleFocus);
      // Small delay to let Firebase catch up if it's actually succeeding
      setTimeout(() => {
        setSocialLoading(prev => prev === id ? null : prev);
      }, 500);
    };

    try {
      // Create a fresh provider instance for each attempt
      const provider = id === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      
      // Adding scopes explicitly can help with GitHub login issues
      if (id === 'github') {
        provider.addScope('read:user');
        provider.addScope('user:email');
      }

      console.log(`[Auth] Initiating ${id} popup...`);
      
      // Start listening for focus back after a short delay (to let the popup open first)
      setTimeout(() => {
        window.addEventListener('focus', handleFocus);
      }, 1000);

      const result = await signInWithPopup(auth, provider);
      
      // If we got here, success! Clear focus listener.
      window.removeEventListener('focus', handleFocus);
      
      console.log(`[Auth] Social login success for: ${result.user.email}`);

      const authState = await finalizeSocialLogin(result.user, role);
      redirectByRole(authState);
    } catch (err: any) {
      window.removeEventListener('focus', handleFocus);
      console.error(`[Auth] ${id} login error:`, err);
      
      // Ignore user-cancelled errors as they are expected behavior
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        return;
      }
      
      let msg = err.message || `Failed to sign in with ${id}.`;
      if (err.code === 'auth/popup-blocked') {
        msg = "The sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = `${id.charAt(0).toUpperCase() + id.slice(1)} sign-in is not enabled in Firebase Console.`;
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = "This domain is not authorized for Firebase Authentication. Please check your Firebase Console.";
      }
      
      setError(msg);
    } finally {
      setSocialLoading(null);
    }
  }

  if (seeding) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.spinner} style={{ margin: '0 auto 1rem' }} />
          <p style={{ opacity: 0.7 }}>Loading OptimaSkill...</p>
        </div>
      </div>
    );
  }

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
          <div className={styles.logoTextWrapper}>
            <span className={styles.logoText}>OptimaSkill</span>
            <span className={styles.logoTagline}>the best skill</span>
          </div>
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
                  "OptimaSkill helped me pass my certification exam on the first try. The explanations are incredible!"
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
                  <span className={styles.roleCardDesc}>Take exams &amp; learn</span>
                  {role === 'student' && <span className={styles.roleCheckmark}>✓</span>}
                </button>
                <button
                  id="role-admin"
                  onClick={() => selectRole('admin')}
                  className={`${styles.roleCard} ${styles.roleCardAdmin} ${role === 'admin' ? styles.roleCardActiveAdmin : ''}`}
                >
                  <span className={styles.roleCardIcon}>⚙️</span>
                  <span className={styles.roleCardName}>Admin</span>
                  <span className={styles.roleCardDesc}>Manage &amp; monitor</span>
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
                    type="button"
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
