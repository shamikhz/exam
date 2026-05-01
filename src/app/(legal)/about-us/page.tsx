import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'About Us — OptimaSkill',
  description: 'Learn more about OptimaSkill, our mission, and our commitment to excellence in online examination.',
};

export default function AboutUsPage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navBrand}>
          <span className={styles.navBrandIcon}>⚡</span>
          <div className={styles.navTextWrapper}>
            <span className={styles.navBrandText}>OptimaSkill</span>
            <span className={styles.navTagline}>the best skill</span>
          </div>
        </Link>
        <Link href="/" className={styles.backBtn}>← Back to Home</Link>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBadge}>✨ Our Story</div>
        <h1 className={styles.heroTitle}>Empowering Education</h1>
        <p className={styles.heroSubtitle}>
          We are on a mission to redefine the online testing experience for students and educators worldwide.
        </p>
      </div>

      {/* Content */}
      <div className={styles.container}>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Who We Are</h2>
          <p className={styles.sectionText}>
            OptimaSkill is a cutting-edge online examination platform designed to make assessments seamless, 
            secure, and insightful. Founded by a team of educators and tech enthusiasts, we believe that 
            technology should enhance learning, not complicate it.
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Our Mission</h2>
          <p className={styles.sectionText}>
            Our mission is to provide an accessible, reliable, and powerful platform where:
          </p>
          <ul className={styles.sectionList}>
            <li><strong>Educators</strong> can create challenging exams with ease and get deep insights into student performance.</li>
            <li><strong>Students</strong> can take exams in a distraction-free, responsive environment that respects their learning pace.</li>
            <li><strong>Institutions</strong> can maintain academic integrity while scaling their testing capabilities.</li>
          </ul>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Why Choose OptimaSkill?</h2>
          <p className={styles.sectionText}>
            We built OptimaSkill with three core pillars in mind:
          </p>
          <ul className={styles.sectionList}>
            <li><strong>Simplicity</strong> — An intuitive UI that requires zero training to get started.</li>
            <li><strong>Performance</strong> — Built on modern web technologies like Next.js for lightning-fast page loads.</li>
            <li><strong>Security</strong> — Enterprise-grade security powered by Firebase to keep your data safe.</li>
          </ul>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Join Our Journey</h2>
          <p className={styles.sectionText}>
            Whether you are a student looking to sharpen your skills or an administrator managing a large 
            cohort, OptimaSkill is built for you. We are constantly evolving and adding new features 
            based on feedback from our community.
          </p>
        </div>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Get in Touch</h2>
          <p className={styles.sectionText}>
            Have questions or want to collaborate? We'd love to hear from you. Visit our{' '}
            <Link href="/contact" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Contact Us</Link>{' '}
            page to get in touch with our team.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/about-us">About Us</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Term & Condition</Link>
          <Link href="/contact">Contact Us</Link>
        </div>
        <p className={styles.footerCopy}>© 2026 OptimaSkill. All rights reserved.</p>
      </footer>
    </div>
  );
}
