import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { loadBank } from './test-bank';
import { gradeAnswer, parseAnswer } from './answer';
import { buildPaper } from './build-paper';
import { EXAM_LENGTH, isStarPosition } from './exam';
import type { PooledQuestion } from '@/data/topics';

const bank = loadBank();
const practisable = bank.filter((t) => !t.section && t.questions.length > 0);

describe('bank size', () => {
  it('every practisable topic holds at least 1,000 questions', () => {
    const short = practisable
      .filter((t) => t.questions.length < 1000)
      .map((t) => `${t.id} (${t.questions.length})`);
    expect(short).toEqual([]);
  });

  it('holds 128,000 questions across 128 topics', () => {
    expect(practisable).toHaveLength(128);
    expect(practisable.reduce((n, t) => n + t.questions.length, 0)).toBe(128000);
  });

  it('has no duplicate question text within any topic', () => {
    const dupes: string[] = [];
    for (const t of practisable) {
      const seen = new Set<string>();
      for (const q of t.questions) {
        if (seen.has(q.text)) dupes.push(`${t.id}: ${q.text.slice(0, 40)}`);
        seen.add(q.text);
      }
    }
    expect(dupes.slice(0, 5)).toEqual([]);
  });

  it('gives every question a unique id within its topic', () => {
    for (const t of practisable) {
      expect(new Set(t.questions.map((q) => q.id)).size).toBe(t.questions.length);
    }
  });
});

describe('every answer in the bank is gradeable', () => {
  it('parses, and grades itself correct', () => {
    const unparseable: string[] = [];
    const ungradeable: string[] = [];
    for (const t of practisable) {
      for (const q of t.questions) {
        if (parseAnswer(q.answer).kind === 'unknown') {
          unparseable.push(`${t.id}: ${q.answer}`);
          continue;
        }
        const kind = q.kind === 'approximate' ? 'exact' : q.kind;
        if (!gradeAnswer(q.answer, q.answer, { kind }).correct) {
          ungradeable.push(`${t.id}: ${q.answer}`);
        }
      }
    }
    expect(unparseable.slice(0, 10)).toEqual([]);
    expect(ungradeable.slice(0, 10)).toEqual([]);
  });

  it('never stores NaN, Infinity or undefined as an answer', () => {
    const bad: string[] = [];
    for (const t of practisable) {
      for (const q of t.questions) {
        if (/NaN|Infinity|undefined|null/.test(q.answer)) bad.push(`${t.id}: ${q.answer}`);
      }
    }
    expect(bad.slice(0, 10)).toEqual([]);
  });
});

describe('runtime data artifacts', () => {
  const root = process.cwd();

  it('writes a question file per practisable topic', () => {
    const missing = practisable
      .map((t) => t.id)
      .filter((id) => !fs.existsSync(path.join(root, 'public/topics', `${id}.json`)));
    expect(missing).toEqual([]);
  });

  it('keeps the home-page index small', () => {
    const size = fs.statSync(path.join(root, 'src/data/topics/index.json')).size;
    expect(size).toBeLessThan(100 * 1024);
  });

  it('never bundles the full bank into the app', () => {
    // src/data/topics.ts is what the app imports; it must not pull in the bank.
    const src = fs.readFileSync(path.join(root, 'src/data/topics.ts'), 'utf8');
    expect(src).not.toMatch(/math-topics\.json/);
  });
});

describe('exam paper assembly', () => {
  const pool = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public/exam-pool.json'), 'utf8')
  ) as PooledQuestion[];

  // Deterministic sequence so the assertions are stable.
  const seeded = () => {
    let s = 12345;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  };

  it('builds a full 80-question paper', () => {
    const paper = buildPaper(pool, seeded());
    expect(paper).toHaveLength(EXAM_LENGTH);
    expect(paper.map((q) => q.position)).toEqual(
      Array.from({ length: EXAM_LENGTH }, (_, i) => i + 1)
    );
  });

  it('puts approximate questions only on the eight star positions', () => {
    const paper = buildPaper(pool, seeded());
    for (const q of paper) {
      if (q.kind === 'approximate') expect(isStarPosition(q.position)).toBe(true);
    }
    const starred = paper.filter((q) => isStarPosition(q.position) && q.kind === 'approximate');
    expect(starred.length).toBeGreaterThanOrEqual(7);
  });

  it('never repeats a question within one paper', () => {
    const paper = buildPaper(pool, seeded());
    const ids = paper.map((q) => `${q.topicId}:${q.id}`);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('produces a different paper on a different seed', () => {
    const a = buildPaper(pool, seeded()).map((q) => q.text);
    let s = 999;
    const other = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    const b = buildPaper(pool, other).map((q) => q.text);
    expect(a).not.toEqual(b);
  });

  it('every pooled question is gradeable', () => {
    const bad = pool
      .filter((q) => parseAnswer(q.a).kind === 'unknown')
      .map((q) => `${q.tid}: ${q.a}`);
    expect(bad.slice(0, 10)).toEqual([]);
  });
});
