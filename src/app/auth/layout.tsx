import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication — OptimaSkill',
  description: 'Sign in or create a new account on OptimaSkill. Choose your role as a student or admin to get started.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
