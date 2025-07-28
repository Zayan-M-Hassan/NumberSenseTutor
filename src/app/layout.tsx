import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { SettingsProvider } from '@/hooks/use-settings.tsx';
import { AppBody } from '@/components/app-body';

export const metadata: Metadata = {
  title: 'Number Sense Tutor',
  description: 'An AI-powered app to improve your numerical estimation skills.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <SettingsProvider>
        <AppBody>{children}</AppBody>
      </SettingsProvider>
    </html>
  );
}
