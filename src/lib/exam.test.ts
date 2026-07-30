import { describe, expect, it } from 'vitest';
import {
  EXAM_LENGTH,
  STAR_POSITIONS,
  isStarPosition,
  scoreExam,
  scoreIfStoppedAtLastCorrect,
} from './exam';
import type { ExamAnswer } from './types';

const answer = (position: number, o: Partial<ExamAnswer> = {}): ExamAnswer => ({
  position,
  response: '1',
  correct: true,
  skipped: false,
  timeTaken: 5,
  ...o,
});

describe('star positions match every real paper checked', () => {
  it('is exactly every tenth question', () => {
    expect(STAR_POSITIONS).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
    expect(STAR_POSITIONS).toHaveLength(8);
  });

  it('identifies star slots', () => {
    expect(isStarPosition(10)).toBe(true);
    expect(isStarPosition(80)).toBe(true);
    expect(isStarPosition(11)).toBe(false);
    expect(isStarPosition(1)).toBe(false);
  });

  it('marks 8 of the 80 positions', () => {
    const count = Array.from({ length: EXAM_LENGTH }, (_, i) => i + 1).filter(isStarPosition).length;
    expect(count).toBe(8);
  });
});

describe('scoring', () => {
  it('awards +5 per correct answer', () => {
    const r = scoreExam([answer(1), answer(2), answer(3)]);
    expect(r.correct).toBe(3);
    expect(r.score).toBe(15);
  });

  it('deducts 4 per wrong answer', () => {
    const r = scoreExam([answer(1), answer(2, { correct: false })]);
    expect(r.score).toBe(5 - 4);
  });

  it('deducts 4 for a skip that sits before the last answer given', () => {
    const r = scoreExam([answer(1), answer(2, { skipped: true }), answer(3)]);
    expect(r.skippedPenalised).toBe(1);
    expect(r.score).toBe(5 + 5 - 4);
  });

  it('does NOT score anything past the last attempted question', () => {
    // Answered 1-3, then skipped 4 and 5 and stopped.
    const r = scoreExam([
      answer(1),
      answer(2),
      answer(3),
      answer(4, { skipped: true }),
      answer(5, { skipped: true }),
    ]);
    expect(r.lastAttempted).toBe(3);
    expect(r.skippedPenalised).toBe(0);
    expect(r.score).toBe(15);
  });

  it('counts every unreached question as an unscored tail', () => {
    const r = scoreExam([answer(1), answer(2)]);
    expect(r.unscoredTail).toBe(EXAM_LENGTH - 2);
    expect(r.score).toBe(10);
  });

  it('matches the plan verification: answer 1-40, skip 12 and 25, then stop', () => {
    const answers: ExamAnswer[] = [];
    for (let p = 1; p <= 40; p++) {
      answers.push(answer(p, { skipped: p === 12 || p === 25 }));
    }
    const r = scoreExam(answers);
    expect(r.correct).toBe(38);
    expect(r.skippedPenalised).toBe(2);
    expect(r.unscoredTail).toBe(40);
    // 38 correct x5, two penalised skips, nothing for 41-80.
    expect(r.score).toBe(38 * 5 - 2 * 4);
  });

  it('handles an empty paper', () => {
    const r = scoreExam([]);
    expect(r.score).toBe(0);
    expect(r.lastAttempted).toBe(0);
  });
});

describe('stopping strategy', () => {
  it('reports the score had you stopped at your last correct answer', () => {
    // Correct through 10, then three wrong.
    const answers: ExamAnswer[] = [];
    for (let p = 1; p <= 10; p++) answers.push(answer(p));
    for (let p = 11; p <= 13; p++) answers.push(answer(p, { correct: false }));

    expect(scoreExam(answers).score).toBe(50 - 12);
    expect(scoreIfStoppedAtLastCorrect(answers)).toBe(50);
  });
});
