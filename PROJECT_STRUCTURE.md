# Project Structure Overview

This document outlines the detailed directory and file structure of the OptimaSkill platform to help developers understand where every file is located.

## Root Directory (`/`)

```text
/
├── public/                 # Static assets served directly (images, icons, manifest, service worker)
│   ├── file.svg
│   ├── globe.svg
│   ├── logo.png
│   ├── manifest.json
│   ├── next.svg
│   ├── sw.js
│   ├── vercel.svg
│   └── window.svg
├── src/                    # Main application source code (see detailed breakdown below)
├── .env.local              # Environment variables (local, do not commit)
├── .gitignore              # Files and folders ignored by Git
├── AGENTS.md               # Instructions and rules for AI agents
├── CLAUDE.md               # Claude-specific instructions
├── DATABASE_SCHEMA.md      # Documentation of the Firestore database structure
├── PROJECT_OVERVIEW.md     # High-level overview of the project and its goals
├── PROJECT_STRUCTURE.md    # Documentation of the project structure
├── PWA_INSTALLATION_GUIDE.md # Guide on how the PWA setup works
├── README.md               # Standard project readme
├── eslint.config.mjs       # ESLint configuration for code quality
├── firebase.json           # Firebase project configuration
├── firestore.rules         # Firestore security rules
├── netlify.toml            # Netlify deployment configuration
├── next-env.d.ts           # Next.js TypeScript declarations
├── next.config.ts          # Next.js configuration settings
├── package-lock.json       # Exact versions of npm dependencies
├── package.json            # Project dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration (used by Tailwind/CSS processing)
└── tsconfig.json           # TypeScript compiler configuration
```

## Source Directory (`/src`)

The `/src` folder contains all the main application code, organized using Next.js App Router conventions.

```text
src/
├── app/
│   ├── (legal)/                     # Route group for legal pages
│   │   ├── about-us/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── privacy-policy/
│   │   │   └── page.tsx
│   │   ├── terms-of-service/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── legal.module.css
│   ├── admin/                       # Admin panel routes
│   │   ├── dashboard/
│   │   │   ├── components/          # Admin-specific dashboard components
│   │   │   │   ├── Modals.tsx
│   │   │   │   ├── OverviewTab.tsx
│   │   │   │   ├── QuestionsTab.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── StudentsTab.tsx
│   │   │   │   └── TopicsTab.tsx
│   │   │   ├── dashboard.module.css
│   │   │   └── page.tsx
│   │   ├── admin.module.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                         # Next.js API Routes (Backend logic)
│   │   ├── delete-user/
│   │   │   └── route.ts
│   │   └── save-result/             # (Empty/Pending implementation)
│   ├── auth/                        # Authentication pages
│   │   ├── auth.module.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── profile/                     # User profile management page
│   │   ├── page.tsx
│   │   └── profile.module.css
│   ├── student/                     # Student panel routes
│   │   ├── dashboard/
│   │   │   ├── components/          # Student-specific dashboard components
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── ExamView.tsx
│   │   │   │   ├── ResultCard.tsx
│   │   │   │   ├── ReviewView.tsx
│   │   │   │   └── TopicCard.tsx
│   │   │   ├── dashboard.module.css
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── student.module.css
│   ├── favicon.ico                  # Application favicon
│   ├── globals.css                  # Global CSS styles and variables
│   ├── layout.tsx                   # Root layout wrapping all pages (providers, SW registration)
│   ├── page.module.css              # CSS module for the landing page
│   └── page.tsx                     # Main landing page
│
├── components/                      # Reusable UI components
│   ├── dashboard/                   # (Empty) Shared dashboard components
│   └── ui/                          # Generic UI components
│       ├── Pagination.tsx
│       └── StatCard.tsx
│
├── hooks/                           # Custom React Hooks
│   ├── useAdminDashboard.ts         # Logic/state for the admin dashboard
│   ├── useDashboard.ts              # Shared logic between dashboards
│   └── useStudentDashboard.ts       # Logic/state for the student dashboard
│
└── lib/                             # Shared libraries, utilities, and integrations
    ├── ThemeProvider.tsx            # Context provider for dark/light mode
    ├── firebase.ts                  # Firebase Client SDK initialization
    ├── firebaseAdmin.ts             # Firebase Admin SDK initialization
    └── storage.ts                   # Utility functions for DB/Storage
```

## Key Architectural Concepts

1. **Next.js App Router**: The project uses the `src/app` directory for routing. Folders define routes, and `page.tsx` makes the route publicly accessible. Folders in parentheses like `(legal)` are route groups that don't affect the URL path.
2. **CSS Modules**: Many components and pages use CSS modules (e.g., `page.module.css`, `dashboard.module.css`) to scope CSS to that specific file, preventing global style conflicts.
3. **Custom Hooks**: Complex state and data-fetching (especially from Firebase) are separated from UI components using custom hooks in `src/hooks`.
4. **Firebase Integration**: The `lib` folder contains the setup for both the client-side (`firebase.ts`) and server-side (`firebaseAdmin.ts`) interactions with Firebase Auth and Firestore.
