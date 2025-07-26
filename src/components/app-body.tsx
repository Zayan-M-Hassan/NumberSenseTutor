'use client';

import { useSettings } from '@/hooks/use-settings';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function AppBody({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme, setTheme]);

  return (
    <body
      className={cn(
        'min-h-screen bg-background font-body antialiased',
        settings.colorTheme
      )}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme={settings.theme}
        enableSystem
        disableTransitionOnChange
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </ThemeProvider>
    </body>
  );
}
