import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/ThemeProvider';

export const metadata: Metadata = {
  title: {
    default: 'ExamPro — Online Exam Platform',
    template: '%s | ExamPro',
  },
  description:
    'ExamPro is a modern online examination platform for students and administrators. Manage topics, questions, and track performance with ease.',
  keywords: ['online exam', 'quiz platform', 'student assessment', 'e-learning', 'exam management'],
  authors: [{ name: 'ExamPro Team' }],
  openGraph: {
    title: 'ExamPro — Online Exam Platform',
    description: 'A modern online examination platform for students and administrators.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Prevent flash of unstyled theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('exam_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored || (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
