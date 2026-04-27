import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard — OptimaSkill',
  description: 'Administrator login portal for OptimaSkill. Manage exam topics, questions, and monitor student performance.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
