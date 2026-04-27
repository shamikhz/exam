import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard — OptimaPath',
  description: 'Student login portal for OptimaPath. Browse topics, take timed exams, and track your learning progress.',
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
