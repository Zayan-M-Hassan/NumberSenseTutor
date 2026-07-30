'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Settings } from '@/lib/types';

const STORAGE_KEY = 'number-sense-tutor-settings';

const DEFAULTS: Settings = {
  questionsPerSet: 10,
  theme: 'system',
};

type SettingsContextType = {
  settings: Settings;
  saveSettings: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) setSettings({ ...DEFAULTS, ...JSON.parse(item) });
    } catch {
      // Fall back to defaults.
    }
  }, []);

  const saveSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal.
      }
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
