'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Progress, SessionRecord, TopicProgress, TopicStatus } from '@/lib/types';

const STORAGE_KEY = 'number-sense-tutor-progress';
const SCHEMA_VERSION = 2;

export const emptyTopicProgress = (): TopicProgress => ({
  overall: { attempted: 0, correct: 0 },
  currentSet: { questionsAttempted: 0, questionsCorrect: 0, totalTime: 0 },
  completedSets: 0,
  seenQuestionIds: [],
});

const EMPTY: Progress = { v: SCHEMA_VERSION, topics: {}, history: [] };

/**
 * Migrate a v1 payload. The original stored no version and no seen-question
 * list, and its completedSets counts were inflated by a double increment, so
 * they are not carried forward — attempts and correct counts are.
 */
function migrate(raw: unknown): Progress {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const data = raw as Partial<Progress> & { topics?: Record<string, Partial<TopicProgress>> };
  if (data.v === SCHEMA_VERSION && data.topics) {
    return {
      v: SCHEMA_VERSION,
      topics: data.topics as Record<string, TopicProgress>,
      history: data.history ?? [],
    };
  }
  const topics: Record<string, TopicProgress> = {};
  for (const [id, t] of Object.entries(data.topics ?? {})) {
    topics[id] = {
      overall: { attempted: t.overall?.attempted ?? 0, correct: t.overall?.correct ?? 0 },
      currentSet: t.currentSet ?? { questionsAttempted: 0, questionsCorrect: 0, totalTime: 0 },
      completedSets: 0,
      seenQuestionIds: [],
    };
  }
  return { v: SCHEMA_VERSION, topics, history: [] };
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      setProgress(item ? migrate(JSON.parse(item)) : EMPTY);
    } catch {
      setProgress(EMPTY);
    }
  }, []);

  const save = useCallback((next: Progress) => {
    setProgress(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage full or blocked — keep the in-memory copy and carry on.
    }
  }, []);

  const getTopicProgress = useCallback(
    (topicId: string): TopicProgress => progress?.topics[topicId] ?? emptyTopicProgress(),
    [progress]
  );

  /** Record one answer. Nothing here touches completedSets. */
  const recordAnswer = useCallback(
    (topicId: string, args: { questionId: number; isCorrect: boolean; timeTaken: number }) => {
      const current = progress ?? EMPTY;
      const t = current.topics[topicId] ?? emptyTopicProgress();
      const seen = t.seenQuestionIds.includes(args.questionId)
        ? t.seenQuestionIds
        : [...t.seenQuestionIds, args.questionId];

      save({
        ...current,
        topics: {
          ...current.topics,
          [topicId]: {
            overall: {
              attempted: t.overall.attempted + 1,
              correct: t.overall.correct + (args.isCorrect ? 1 : 0),
            },
            currentSet: {
              questionsAttempted: t.currentSet.questionsAttempted + 1,
              questionsCorrect: t.currentSet.questionsCorrect + (args.isCorrect ? 1 : 0),
              totalTime: t.currentSet.totalTime + args.timeTaken,
            },
            completedSets: t.completedSets,
            seenQuestionIds: seen,
          },
        },
      });
    },
    [progress, save]
  );

  /** Close out a finished set: bump the counter once and log it to history. */
  const completeSet = useCallback(
    (topicId: string) => {
      const current = progress ?? EMPTY;
      const t = current.topics[topicId] ?? emptyTopicProgress();
      if (t.currentSet.questionsAttempted === 0) return;

      const record: SessionRecord = {
        date: new Date().toISOString(),
        topicId,
        attempted: t.currentSet.questionsAttempted,
        correct: t.currentSet.questionsCorrect,
        totalTime: t.currentSet.totalTime,
      };

      save({
        ...current,
        topics: {
          ...current.topics,
          [topicId]: {
            ...t,
            completedSets: t.completedSets + 1,
            currentSet: { questionsAttempted: 0, questionsCorrect: 0, totalTime: 0 },
          },
        },
        history: [...current.history, record].slice(-500),
      });
    },
    [progress, save]
  );

  /** Discard an unfinished set without counting it. */
  const resetCurrentSet = useCallback(
    (topicId: string) => {
      const current = progress ?? EMPTY;
      const t = current.topics[topicId] ?? emptyTopicProgress();
      save({
        ...current,
        topics: {
          ...current.topics,
          [topicId]: {
            ...t,
            currentSet: { questionsAttempted: 0, questionsCorrect: 0, totalTime: 0 },
          },
        },
      });
    },
    [progress, save]
  );

  const clearProgress = useCallback(() => save(EMPTY), [save]);

  return {
    progress: progress ?? EMPTY,
    loaded: progress !== null,
    getTopicProgress,
    recordAnswer,
    completeSet,
    resetCurrentSet,
    clearProgress,
  };
}

/**
 * A topic counts as completed only once every question in it has been seen and
 * overall accuracy is at least 80%. The original marked a 250-question topic
 * "Completed" after a single set of ten.
 */
export function topicStatus(p: TopicProgress, questionCount: number): TopicStatus {
  if (p.overall.attempted === 0) return 'Not Started';
  const seenAll = questionCount > 0 && p.seenQuestionIds.length >= questionCount;
  const accuracy = p.overall.correct / p.overall.attempted;
  if (seenAll && accuracy >= 0.8) return 'Completed';
  return 'In Progress';
}

/** How far through the topic's own material you are, 0-100. */
export function topicCoverage(p: TopicProgress, questionCount: number): number {
  if (!questionCount) return 0;
  return Math.min(100, Math.round((p.seenQuestionIds.length / questionCount) * 100));
}
