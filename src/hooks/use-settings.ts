'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '@/lib/types';

const STORAGE_KEY = 'number-sense-tutor-settings';

const DEFAULT_SETTINGS: Settings = {
  questionsPerSet: 10,
  theme: 'system',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setSettings(JSON.parse(item));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${STORAGE_KEY}”:`, error);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const saveSettings = useCallback((newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...(settings ?? DEFAULT_SETTINGS), ...newSettings };
      setSettings(updatedSettings);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn(`Error setting localStorage key “${STORAGE_KEY}”:`, error);
    }
  }, [settings]);

  return {
    settings: settings ?? DEFAULT_SETTINGS,
    saveSettings,
  };
};
