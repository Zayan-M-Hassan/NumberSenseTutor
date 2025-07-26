'use client';

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from 'react';
import type { Settings } from '@/lib/types';

const STORAGE_KEY = 'number-sense-tutor-settings';

const DEFAULT_SETTINGS: Settings = {
  questionsPerSet: 10,
  theme: 'system',
  colorTheme: 'theme-default',
};

type SettingsContextType = {
  settings: Settings;
  saveSettings: (newSettings: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsedSettings = JSON.parse(item);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${STORAGE_KEY}”:`, error);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const saveSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      try {
        const updatedSettings = {
          ...(settings ?? DEFAULT_SETTINGS),
          ...newSettings,
        };
        setSettings(updatedSettings);
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedSettings)
        );
      } catch (error)
        {
        console.warn(
          `Error setting localStorage key “${STORAGE_KEY}”:`,
          error
        );
      }
    },
    [settings]
  );

  const value = {
    settings: settings ?? DEFAULT_SETTINGS,
    saveSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
