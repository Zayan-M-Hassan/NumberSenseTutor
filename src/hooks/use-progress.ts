
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Progress, TopicProgress, TopicProgressSet, Question } from '@/lib/types';
import { useSettings } from './use-settings';

const STORAGE_KEY = 'number-sense-tutor-progress';

const createDefaultTopicProgress = (): TopicProgress => ({
  overall: { attempted: 0, correct: 0 },
  currentSet: { questionsAttempted: 0, questionsCorrect: 0, totalTime: 0 },
  completedSets: 0,
  currentQuestion: null,
  questionIndex: 0,
});

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

  const startNewSet = useCallback((topicId: string) => {
    if (!progress) return;
    
    const topicProgress = progress.topics[topicId] || createDefaultTopicProgress();

    const newProgress: Progress = {
        ...progress,
        topics: {
            ...progress.topics,
            [topicId]: {
                ...topicProgress,
                currentSet: { questionsAttempted: 0, questionsCorrect: 0, totalTime: 0 },
                currentQuestion: null,
                questionIndex: topicProgress.currentSet.questionsAttempted > 0 ? topicProgress.questionIndex : 0,
            }
        }
    };
    if (topicProgress.currentSet.questionsAttempted >= settings.questionsPerSet) {
        newProgress.topics[topicId].completedSets += 1;
    }
    saveProgress(newProgress);
  }, [progress, saveProgress, settings.questionsPerSet]);

  const setCurrentQuestion = useCallback((topicId: string, question: Question, questionIndex: number) => {
    if (!progress) return;
    
    const topicProgress = progress.topics[topicId] || createDefaultTopicProgress();

    const newProgress: Progress = {
        ...progress,
        topics: {
            ...progress.topics,
            [topicId]: {
                ...topicProgress,
                currentQuestion: question,
                questionIndex: questionIndex,
            }
        }
    };
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  const updateTopicProgress = useCallback((topicId: string, { isCorrect, timeTaken }: { isCorrect: boolean, timeTaken: number }): TopicProgress => {
    if (!progress) return createDefaultTopicProgress();

    const currentTopicProgress = progress.topics[topicId] || createDefaultTopicProgress();
    
    const newCurrentSet: TopicProgressSet = {
        questionsAttempted: currentTopicProgress.currentSet.questionsAttempted + 1,
        questionsCorrect: currentTopicProgress.currentSet.questionsCorrect + (isCorrect ? 1 : 0),
        totalTime: currentTopicProgress.currentSet.totalTime + timeTaken,
    };

    let newCompletedSets = currentTopicProgress.completedSets;
    if (newCurrentSet.questionsAttempted >= settings.questionsPerSet) {
        newCompletedSets += 1;
    }
    
    const newQuestionIndex = currentTopicProgress.questionIndex + 1;

    const updatedTopicProgress: TopicProgress = {
        ...currentTopicProgress,
        overall: {
            attempted: currentTopicProgress.overall.attempted + 1,
            correct: currentTopicProgress.overall.correct + (isCorrect ? 1 : 0),
        },
        currentSet: newCurrentSet,
        completedSets: newCompletedSets,
        currentQuestion: null,
        questionIndex: newQuestionIndex,
    };

    const newProgress: Progress = {
      ...progress,
      topics: {
        ...progress.topics,
        [topicId]: updatedTopicProgress,
      },
    };
    saveProgress(newProgress);
    return updatedTopicProgress;
  }, [progress, saveProgress, settings.questionsPerSet]);

  const getTopicProgress = useCallback((topicId: string): TopicProgress => {
    return progress?.topics[topicId] || createDefaultTopicProgress();
  }, [progress]);
  
  const clearProgress = useCallback(() => {
    saveProgress(DEFAULT_PROGRESS);
  }, [saveProgress]);

  return {
    progress: progress ?? DEFAULT_PROGRESS,
    getTopicProgress,
    updateTopicProgress,
    clearProgress,
    startNewSet,
    setCurrentQuestion
  };
};
