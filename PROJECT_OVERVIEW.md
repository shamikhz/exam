# OptimaSkill — Project Overview

**OptimaSkill** is a premium, high-performance online examination platform designed to provide a seamless experience for both educators (Admins) and learners (Students). Formerly known as ExamTop, the platform has been rebranded and optimized for speed, security, and scalability.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router architecture)
- **Library**: [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety and robust development.
- **Styling**: **Vanilla CSS with CSS Modules**. The design system follows the **60-30-10 color rule** and features:
  - Sleek Dark/Light modes.
  - Glassmorphism effects.
  - Dynamic animations and transitions.
  - Fully responsive layouts.

### Backend & Infrastructure
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (NoSQL Cloud Database).
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Managing user sessions, Google/GitHub social logins, and traditional email/password).
- **Storage**: [Firebase Storage](https://firebase.google.com/docs/storage) for user avatars and topic icons.
- **Deployment**: [Netlify](https://www.netlify.com/) with automated CI/CD.

---

## 🛠 Key Features

### For Students
- **Interactive Exam Engine**: Real-time timed exams with instant feedback.
- **Progress Tracking**: Personal dashboard to view exam history and performance analytics.
- **Profile Management**: Custom avatars, bios, and location settings.
- **Retake System**: Ability to retake exams to improve scores.

### For Admins
- **Content Management**: Full CRUD (Create, Read, Update, Delete) for Topics and Questions.
- **User Management**: Overview of registered students and their activity.
- **Advanced Dashboard**: High-level stats on platform usage and content density.

### Platform Extras
- **Sequential IDs**: Unlike standard Firebase random IDs, OptimaSkill uses a custom sequential numbering system (e.g., `topic-1`, `student-2`) for better readability.
- **Production-Ready Security**: Strict Firestore Security Rules to protect user data.
- **Legal Compliance**: Integrated Privacy Policy, Terms of Service, and Contact modules.

---

## 📁 Directory Structure

- `/src/app`: Next.js pages and layouts.
- `/src/components`: Reusable UI components.
- `/src/hooks`: Custom React hooks for business logic (decoupled from UI).
- `/src/lib`: Core utilities (Firebase config, storage wrappers).
- `/public`: Static assets.

---

**Tagline**: *OptimaSkill — the best skill*
