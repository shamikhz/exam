import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Legal | OptimaPath',
    template: '%s | OptimaPath',
  },
  description: 'Legal information and policies for the OptimaPath platform.',
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
