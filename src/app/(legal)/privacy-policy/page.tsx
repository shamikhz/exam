import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy — ExamTop',
  description: 'Learn how ExamTop collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navBrand}>
          <span className={styles.navBrandIcon}>⚡</span> ExamTop
        </Link>
        <Link href="/" className={styles.backBtn}>← Back to Home</Link>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Privacy Policy</h1>
        <p className={styles.heroSubtitle}>
          We take your privacy seriously. Here's exactly how we handle your data.
        </p>
      </div>

      {/* Content */}
      <div className={styles.container}>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
          <p className={styles.sectionText}>
            When you use ExamTop, we may collect the following types of information:
          </p>
          <ul className={styles.sectionList}>
            <li><strong>Account information</strong> — your name and email address when you register.</li>
            <li><strong>Authentication data</strong> — if you sign in via Google or GitHub, we receive your public profile (name, email, avatar).</li>
            <li><strong>Usage data</strong> — exam topics you access, questions you answer, scores, and time taken.</li>
            <li><strong>Device information</strong> — browser type, IP address, and operating system for security purposes.</li>
          </ul>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>2. How We Use Your Information</h2>
          <p className={styles.sectionText}>
            Your information is used solely to provide and improve the ExamTop experience:
          </p>
          <ul className={styles.sectionList}>
            <li>To create and manage your personal account.</li>
            <li>To track your exam performance and learning progress.</li>
            <li>To allow administrators to monitor student activity on their platform.</li>
            <li>To send important service updates and security notifications.</li>
            <li>To improve platform features and fix technical issues.</li>
          </ul>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Data Storage</h2>
          <p className={styles.sectionText}>
            All user data is stored securely using <strong>Firebase Firestore</strong> (Google Cloud Platform), 
            which is encrypted at rest and in transit. Authentication is handled by <strong>Firebase Authentication</strong>. 
            We do not store passwords in plain text — all authentication is managed through Firebase's 
            industry-standard security infrastructure.
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Data Sharing</h2>
          <p className={styles.sectionText}>
            We <strong>never sell</strong> your personal information to third parties. Your data may be 
            shared only in the following limited circumstances:
          </p>
          <ul className={styles.sectionList}>
            <li>With your platform administrator (who can see your exam scores and results).</li>
            <li>With Firebase / Google Cloud as our infrastructure provider.</li>
            <li>When required by law or legal process.</li>
          </ul>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Cookies</h2>
          <p className={styles.sectionText}>
            ExamTop uses minimal cookies and browser localStorage to maintain your login session. 
            We do not use tracking cookies or third-party advertising cookies. You can clear your 
            session at any time by signing out or clearing your browser data.
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Your Rights</h2>
          <p className={styles.sectionText}>
            You have full control over your data. You can:
          </p>
          <ul className={styles.sectionList}>
            <li>Access and update your profile at any time in the Profile Settings page.</li>
            <li>Request complete deletion of your account and all associated data.</li>
            <li>Export your exam history from your student dashboard.</li>
            <li>Contact us at any time with privacy-related questions or requests.</li>
          </ul>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Contact Us</h2>
          <p className={styles.sectionText}>
            If you have any questions about this Privacy Policy or how your data is handled, 
            please reach out via our <Link href="/contact" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Contact Us</Link> page 
            or email us directly at <strong>privacy@examtop.app</strong>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/contact">Contact Us</Link>
        </div>
        <p className={styles.footerCopy}>© 2026 ExamTop. All rights reserved.</p>
      </footer>
    </div>
  );
}
