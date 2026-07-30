import type { ExamQuestion } from './types';
import type { PooledQuestion } from '@/data/topics';
import { EXAM_LENGTH, QUARTILE_TAGS, isStarPosition } from './exam';

/**
 * Assemble an 80-question paper from the pool.
 *
 * Content is weighted by quartile the way real papers are, and the starred
 * problems land on positions 10, 20, ... 80 — the eight slots they occupy on
 * every real paper checked.
 */
export function buildPaper(pool: PooledQuestion[], rand: () => number = Math.random): ExamQuestion[] {
  const exact = pool.filter((q) => q.k !== 'approximate');
  const approximate = pool.filter((q) => q.k === 'approximate');

  const used = new Set<string>();
  const uid = (q: PooledQuestion) => `${q.tid}:${q.i}`;

  const take = (from: PooledQuestion[], tags: string[]): PooledQuestion | null => {
    const preferred = from.filter((q) => !used.has(uid(q)) && q.g.some((t) => tags.includes(t)));
    const fallback = from.filter((q) => !used.has(uid(q)));
    const source = preferred.length ? preferred : fallback;
    if (!source.length) return null;
    const q = source[Math.floor(rand() * source.length)];
    used.add(uid(q));
    return q;
  };

  const paper: ExamQuestion[] = [];
  for (let position = 1; position <= EXAM_LENGTH; position++) {
    const tags = QUARTILE_TAGS[Math.floor((position - 1) / 20)];
    const picked = isStarPosition(position)
      ? (take(approximate, tags) ?? take(exact, tags))
      : take(exact, tags);
    if (!picked) continue;
    paper.push({
      id: picked.i,
      text: picked.t,
      answer: picked.a,
      kind: picked.k,
      ...(picked.f ? { requiredForm: picked.f } : {}),
      tags: picked.g,
      topicId: picked.tid,
      topicName: picked.tn,
      position,
    });
  }
  return paper;
}
