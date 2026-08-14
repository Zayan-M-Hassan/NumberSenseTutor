import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import { SettingsProvider } from '@/hooks/use-settings';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Analytics } from '@vercel/analytics/react';

const question = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-question',
  weight: ['400', '600'],
});

const ui = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ui',
  weight: ['400', '500', '600'],
});

const data = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-data',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Number Sense Tutor',
  description:
    'Drill the UIL and TMSCA number sense tricks. 80 questions, 10 minutes, no scratch paper.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${question.variable} ${ui.variable} ${data.variable}`}
    >
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-background font-sans text-ink antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SettingsProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
          </SettingsProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
