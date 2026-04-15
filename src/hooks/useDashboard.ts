'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout as storageLogout } from '@/lib/storage';

export function useDashboard(requiredRole: 'admin' | 'student') {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== requiredRole) {
      router.replace('/auth');
      return;
    }
    setUserName(user.name);
    setUserEmail(user.email);
    setUserAvatar(user.avatar || null);
    setUserId(user.userId);
  }, [router, requiredRole]);

  function handleLogout() {
    storageLogout();
    router.push('/auth');
  }

  return {
    userName,
    userEmail,
    userAvatar,
    userId,
    isMenuOpen,
    setIsMenuOpen,
    handleLogout
  };
}
