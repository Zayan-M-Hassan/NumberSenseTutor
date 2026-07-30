'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Question } from '@/lib/types';

/**
 * Owns the order of questions in a practice set, and survives a reload.
 *
 * The original app kept the index in component state initialised to 0 and
 * served questions[0..9] in fixed order on every visit — you memorised
 * positions rather than tricks. Here a set draws unseen questions first, then
 * the least recently seen, and shuffles within each group.
 */

const key = (topicId: string) => `number-sense-tutor-session:${topicId}`;

type StoredSession = {
  ids: number[];
  index: number;
  size: number;
};

/** Fisher-Yates over a copy, seeded so a set is stable across a reload. */
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed || 1;
  const next = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildSet(questions: Question[], seenIds: number[], size: number, seed: number): number[] {
  const seen = new Set(seenIds);
  const unseen = questions.filter((q) => !seen.has(q.id));
  const already = questions.filter((q) => seen.has(q.id));
  // Unseen first, in shuffled order; top up from previously seen if needed.
  const pool = [...shuffle(unseen, seed), ...shuffle(already, seed + 7)];
  return pool.slice(0, Math.min(size, pool.length)).map((q) => q.id);
}

export function useSession(topicId: string, questions: Question[], size: number) {
  const [session, setSession] = useState<StoredSession | null>(null);

  const byId = useMemo(() => {
    const m = new Map<number, Question>();
    questions.forEach((q) => m.set(q.id, q));
    return m;
  }, [questions]);

  const persist = useCallback(
    (next: StoredSession | null) => {
      setSession(next);
      try {
        if (next) window.localStorage.setItem(key(topicId), JSON.stringify(next));
        else window.localStorage.removeItem(key(topicId));
      } catch {
        // Non-fatal: the set still runs, it just won't survive a reload.
      }
    },
    [topicId]
  );

  const start = useCallback(
    (seenIds: number[]) => {
      const ids = buildSet(questions, seenIds, size, Date.now() & 0x7fffffff);
      persist({ ids, index: 0, size });
    },
    [persist, questions, size]
  );

  // Restore an in-flight set, or leave `session` null so the caller can start one.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key(topicId));
      if (!raw) {
        setSession(null);
        return;
      }
      const parsed = JSON.parse(raw) as StoredSession;
      const valid =
        Array.isArray(parsed.ids) &&
        parsed.ids.length > 0 &&
        parsed.ids.every((id) => byId.has(id));
      setSession(valid ? parsed : null);
    } catch {
      setSession(null);
    }
    // Re-read only when the topic changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const advance = useCallback(() => {
    if (!session) return;
    persist({ ...session, index: session.index + 1 });
  }, [persist, session]);

  const finish = useCallback(() => persist(null), [persist]);

  const current = session && session.index < session.ids.length ? byId.get(session.ids[session.index]) ?? null : null;
  const done = !!session && session.index >= session.ids.length;

  return {
    session,
    current,
    done,
    position: session ? Math.min(session.index + 1, session.ids.length) : 0,
    total: session?.ids.length ?? size,
    start,
    advance,
    finish,
  };
}
