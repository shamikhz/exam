'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../legal.module.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Simulate sending (replace with real email API like EmailJS / Resend in production)
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
    setForm({ name: '', email: '', subject: '', message: '' });
  }

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
        <div className={styles.heroBadge}>💬 Get in Touch</div>
        <h1 className={styles.heroTitle}>Contact Us</h1>
        <p className={styles.heroSubtitle}>
          Have a question, feedback, or need help? We'd love to hear from you.
        </p>
      </div>

      {/* Content */}
      <div className={styles.container}>

        {/* Contact cards */}
        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>📧</div>
            <div className={styles.contactCardTitle}>Email Support</div>
            <div className={styles.contactCardText}>
              For general inquiries and support, reach us directly at:
            </div>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>🔒</div>
            <div className={styles.contactCardTitle}>Privacy & Legal</div>
            <div className={styles.contactCardText}>
              For privacy requests, data deletion, or legal matters:
            </div>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>🐛</div>
            <div className={styles.contactCardTitle}>Report a Bug</div>
            <div className={styles.contactCardText}>
              Found something broken? Report issues on our GitHub repository.
            </div>
          </div>

          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>⏱️</div>
            <div className={styles.contactCardTitle}>Response Time</div>
            <div className={styles.contactCardText}>
              We aim to respond to all inquiries within 24–48 business hours.
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>✉️ Send Us a Message</h2>

          {sent && (
            <div className={styles.successMsg}>
              ✅ Message sent! We'll get back to you within 24–48 hours.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.inputBlock}>
                <label htmlFor="contact-name">Full Name</label>
                <input
                  id="contact-name"
                  type="text"
                  className={styles.inputField}
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.inputBlock}>
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  className={styles.inputField}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.inputBlock}>
              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                type="text"
                className={styles.inputField}
                placeholder="How can we help?"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>

            <div className={styles.inputBlock}>
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                className={styles.textareaField}
                placeholder="Tell us more about your question or issue..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={sending}>
              {sending ? '⏳ Sending...' : '🚀 Send Message'}
            </button>
          </form>
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
