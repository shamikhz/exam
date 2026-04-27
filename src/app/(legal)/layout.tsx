import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Legal | OptimaSkill',
    template: '%s | OptimaSkill',
  },
  description: 'Legal information and policies for the OptimaSkill platform.',
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
