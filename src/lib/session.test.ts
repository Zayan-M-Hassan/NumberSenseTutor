import { describe, expect, it } from 'vitest';
import { buildSet } from '@/hooks/use-session';
import type { Question } from './types';

const q = (id: number): Question => ({
  id,
  text: `Q${id}`,
  answer: String(id),
  kind: 'exact',
});

const bank = Array.from({ length: 200 }, (_, i) => q(i + 1));

describe('buildSet', () => {
  it('draws exactly the requested size', () => {
    expect(buildSet(bank, [], 20, 1)).toHaveLength(20);
    expect(buildSet(bank, [], 10, 1)).toHaveLength(10);
    expect(buildSet(bank, [], 80, 1)).toHaveLength(80);
  });

  it('takes the whole topic when the size is 0 (endless)', () => {
    expect(buildSet(bank, [], 0, 1)).toHaveLength(bank.length);
  });

  it('never repeats a question inside one set', () => {
    const ids = buildSet(bank, [], 80, 7);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('serves unseen questions before repeating any', () => {
    // 190 already seen, so a 20-question set must start with the 10 unseen.
    const seen = bank.slice(0, 190).map((x) => x.id);
    const ids = buildSet(bank, seen, 20, 3);
    const firstTen = ids.slice(0, 10);
    expect(firstTen.every((id) => id > 190)).toBe(true);
    expect(new Set(firstTen).size).toBe(10);
  });

  it('still fills a set once everything has been seen', () => {
    const seen = bank.map((x) => x.id);
    expect(buildSet(bank, seen, 20, 5)).toHaveLength(20);
  });

  it('caps at the pool size when the topic is smaller than the set', () => {
    const small = bank.slice(0, 6);
    expect(buildSet(small, [], 20, 1)).toHaveLength(6);
  });

  it('gives a different order on a different seed', () => {
    expect(buildSet(bank, [], 40, 1)).not.toEqual(buildSet(bank, [], 40, 999));
  });

  it('is stable for the same seed, so a reload resumes the same set', () => {
    expect(buildSet(bank, [], 40, 42)).toEqual(buildSet(bank, [], 40, 42));
  });
});
