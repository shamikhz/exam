import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service — OptimaPath',
  description: 'Read the terms and conditions governing your use of the OptimaPath platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navBrand}>
          <span className={styles.navBrandIcon}>⚡</span>
          <div className={styles.navTextWrapper}>
            <span className={styles.navBrandText}>OptimaPath</span>
            <span className={styles.navTagline}>the best path</span>
          </div>
        </Link>
        <Link href="/" className={styles.backBtn}>← Back to Home</Link>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Terms of Service</h1>
        <p className={styles.heroSubtitle}>
          Please read these terms carefully before using OptimaPath.
        </p>
      </div>

      {/* Content */}
      <div className={styles.container}>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
          <p className={styles.sectionText}>
            By accessing or using OptimaPath ("the Platform"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the platform. These terms apply to all 
            visitors, students, and administrators.
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Use of the Platform</h2>
          <p className={styles.sectionText}>
            You agree to use OptimaPath only for its intended educational purposes. You must not:
          </p>
          <ul className={styles.sectionList}>
            <li>Attempt to access another user's account or data without authorization.</li>
            <li>Use automated tools, bots, or scripts to manipulate exam results.</li>
            <li>Upload or share any content that is illegal, offensive, or violates intellectual property rights.</li>
            <li>Attempt to reverse-engineer, hack, or disrupt the platform's infrastructure.</li>
            <li>Share exam questions or answers in ways that violate academic integrity policies.</li>
          </ul>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>3. User Accounts</h2>
          <p className={styles.sectionText}>
            You are responsible for maintaining the security of your account credentials. 
            You must notify us immediately if you suspect unauthorized access to your account. 
            We reserve the right to suspend or terminate accounts that violate these terms. 
            Accounts are personal and may not be transferred to another person.
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Administrator Responsibilities</h2>
          <p className={styles.sectionText}>
            Administrators who use OptimaPath to manage students and create content are responsible for:
          </p>
          <ul className={styles.sectionList}>
            <li>Ensuring the accuracy and appropriateness of all exam content created on the platform.</li>
            <li>Protecting the privacy of student data accessed through the admin dashboard.</li>
            <li>Complying with applicable data protection regulations (e.g., GDPR, FERPA) when handling student information.</li>
            <li>Using the delete-student feature responsibly and only when legitimately required.</li>
          </ul>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Intellectual Property</h2>
          <p className={styles.sectionText}>
            All content on the OptimaPath platform — including the UI design, branding, default question sets, 
            and platform code — is the intellectual property of OptimaPath and its developers. 
            Content created by administrators (topics, questions) remains the property of the respective 
            administrator or institution. You grant OptimaPath a non-exclusive licence to store and display 
            your content for platform operation purposes.
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Disclaimer of Warranties</h2>
          <p className={styles.sectionText}>
            OptimaPath is provided "as is" without warranties of any kind. While we strive for 100% uptime 
            and data integrity, we cannot guarantee uninterrupted access to the platform. We are not liable 
            for any data loss, exam disruption, or damages resulting from technical failures, third-party 
            service outages (such as Firebase), or misuse of the platform.
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Modifications to Terms</h2>
          <p className={styles.sectionText}>
            We reserve the right to update these Terms of Service at any time. Continued use of the 
            platform after changes are published constitutes your acceptance of the updated terms. 
            We will notify users of significant changes via the platform or email where possible.
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Contact</h2>
          <p className={styles.sectionText}>
            For questions regarding these Terms of Service, please visit our{' '}
            <Link href="/contact" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Contact Us</Link>{' '}
            page or email <strong>legal@optimapath.app</strong>.
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
        <p className={styles.footerCopy}>© 2026 OptimaPath. All rights reserved.</p>
      </footer>
    </div>
  );
}
