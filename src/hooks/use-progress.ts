'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Progress, TopicProgress } from '@/lib/types';
import { useSettings } from './use-settings';

const STORAGE_KEY = 'number-sense-tutor-progress';

const DEFAULT_PROGRESS: Progress = {
  topics: {},
};

export const useProgress = () => {
  const { settings } = useSettings();
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        setProgress(JSON.parse(item));
      } else {
        setProgress(DEFAULT_PROGRESS);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${STORAGE_KEY}”:`, error);
      setProgress(DEFAULT_PROGRESS);
    }
  }, []);

  const saveProgress = useCallback((newProgress: Progress) => {
    try {
      setProgress(newProgress);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.warn(`Error setting localStorage key “${STORAGE_KEY}”:`, error);
    }
  }, []);

  const updateTopicProgress = useCallback((topicId: string, { isCorrect }: { isCorrect: boolean }) => {
    if (!progress) return;

    const currentTopicProgress = progress.topics[topicId] || { attempted: 0, correct: 0, completedSets: 0 };
    
    const newAttempted = currentTopicProgress.attempted + 1;
    const newCorrect = currentTopicProgress.correct + (isCorrect ? 1 : 0);
    
    let newCompletedSets = currentTopicProgress.completedSets;
    if (newAttempted > 0 && newAttempted % settings.questionsPerSet === 0) {
        // Only increment if we are landing on a multiple of questionsPerSet
        if((currentTopicProgress.attempted % settings.questionsPerSet) !== 0) {
            newCompletedSets += 1;
        }
    }

    const updatedTopicProgress: TopicProgress = {
      attempted: newAttempted,
      correct: newCorrect,
      completedSets: newCompletedSets,
    };

    const newProgress: Progress = {
      ...progress,
      topics: {
        ...progress.topics,
        [topicId]: updatedTopicProgress,
      },
    };
    saveProgress(newProgress);
  }, [progress, saveProgress, settings.questionsPerSet]);

  const getTopicProgress = useCallback((topicId: string): TopicProgress => {
    return progress?.topics[topicId] || { attempted: 0, correct: 0, completedSets: 0 };
  }, [progress]);
  
  const clearProgress = useCallback(() => {
    saveProgress(DEFAULT_PROGRESS);
  }, [saveProgress]);

  return {
    progress: progress ?? DEFAULT_PROGRESS,
    getTopicProgress,
    updateTopicProgress,
    clearProgress,
  };
};
