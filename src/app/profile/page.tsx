'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, updateUserProfile, getUsers } from '@/lib/storage';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('student');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    const auth = getCurrentUser();
    if (!auth) {
      router.replace('/auth');
      return;
    }

    const allUsers = getUsers();
    const user = allUsers.find(u => u.id === auth.userId);
    
    if (user) {
      setUserName(user.name);
      setRole(user.role);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
      });
    }
    setLoading(false);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    const updated = updateUserProfile({
      name: formData.name,
      phone: formData.phone,
      location: formData.location,
      bio: formData.bio,
    });

    if (updated) {
      setUserName(updated.name);
      setSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) return null;

  const dashboardLink = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href={dashboardLink} className={styles.backBtn}>
            ← Back to Dashboard
          </Link>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Manage your personal information and account settings.</p>
        </header>

        <main className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLarge}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>{userName}</h2>
              <span className={styles.profileRole}>{role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputBlock}>
              <label className={styles.label} htmlFor="name">Full Name</label>
              <input
                id="name"
                className={styles.inputField}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className={styles.inputBlock}>
              <label className={styles.label} htmlFor="email">Email Address (Read Only)</label>
              <input
                id="email"
                className={styles.inputField}
                type="email"
                value={formData.email}
                disabled
              />
            </div>

            <div className={styles.inputBlock}>
              <label className={styles.label} htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                className={styles.inputField}
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className={styles.inputBlock}>
              <label className={styles.label} htmlFor="location">Location</label>
              <input
                id="location"
                className={styles.inputField}
                type="text"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className={styles.inputBlockFull}>
              <div className={styles.inputBlock}>
                <label className={styles.label} htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  className={`${styles.inputField} ${styles.textarea}`}
                  placeholder="Tell us a little about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.inputBlockFull}>
              {success && (
                <div className={styles.successMsg}>
                  ✅ Profile updated successfully! Changes are synced.
                </div>
              )}
              
              <div className={styles.actions}>
                <Link href={dashboardLink} className={styles.cancelBtn}>
                  Cancel
                </Link>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
