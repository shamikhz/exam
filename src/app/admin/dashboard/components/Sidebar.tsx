'use client';

import React from 'react';

interface SidebarProps {
  sidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  setSidebarOpen: (open: boolean) => void;
  tabs: { id: string; label: string; icon: string }[];
  styles: any;
}

export function Sidebar({
  sidebarOpen,
  activeTab,
  setActiveTab,
  setSidebarOpen,
  tabs,
  styles
}: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.sidebarBrand}>
        <span>⚙️</span>
        <span className={styles.sidebarBrandText}>OptimaPath Admin</span>
      </div>

      <nav className={styles.sidebarNav}>
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`sidebar-tab-${t.id}`}
            onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
            className={`${styles.sidebarLink} ${activeTab === t.id ? styles.sidebarLinkActive : ''}`}
          >
            <span className={styles.sidebarIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
