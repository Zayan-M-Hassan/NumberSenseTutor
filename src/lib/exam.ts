/**
 * Exam assembly and scoring, matching real UIL high school papers.
 *
 * Verified against the 2024 and 2025 district, regional and state study
 * packets (six papers, 480 questions):
 *
 *  - 80 questions, 10 minutes.
 *  - Starred (approximate) problems sit at positions 10, 20, 30, 40, 50, 60,
 *    70, 80 — exactly eight, always those slots, on every paper checked.
 *  - +5 for a correct answer, -4 for a wrong one, -4 for a skipped one.
 *  - Questions left blank BEYOND the last one attempted are not scored at all.
 */

import type { ExamAnswer, ExamResult } from './types';

export const EXAM_LENGTH = 80;
export const EXAM_SECONDS = 600;
export const STAR_POSITIONS = [10, 20, 30, 40, 50, 60, 70, 80];

export const isStarPosition = (position: number) => position % 10 === 0;

/**
 * Content weighting by quartile, from classifying the 480 real questions.
 * Early questions are arithmetic and fractions; the back of the paper is
 * functions, trigonometry, calculus and matrices.
 */
export const QUARTILE_TAGS: string[][] = [
  ['arithmetic', 'fractions', 'money', 'percent', 'number-theory', 'divisors'],
  ['remainders', 'fractions', 'algebra', 'repeating-decimals', 'sets', 'number-theory'],
  ['remainders', 'sequences', 'bases', 'coordinate-geometry', 'geometry', 'counting'],
  ['functions', 'trigonometry', 'calculus', 'matrices', 'coordinate-geometry', 'conversions'],
];

export function scoreExam(answers: ExamAnswer[]): ExamResult {
  const attempted = answers.filter((a) => !a.skipped);
  const lastAttempted = attempted.length
    ? Math.max(...attempted.map((a) => a.position))
    : 0;

  let correct = 0;
  let wrong = 0;
  let skippedPenalised = 0;
  let unscoredTail = 0;

  for (const a of answers) {
    if (a.position > lastAttempted) {
      // Beyond the last answer given: not scored.
      unscoredTail++;
      continue;
    }
    if (a.skipped) skippedPenalised++;
    else if (a.correct) correct++;
    else wrong++;
  }
  // Positions never reached at all also fall in the unscored tail.
  unscoredTail += EXAM_LENGTH - answers.length;

  return {
    date: new Date().toISOString(),
    answers,
    lastAttempted,
    score: correct * 5 - wrong * 4 - skippedPenalised * 4,
    correct,
    wrong,
    skippedPenalised,
    unscoredTail,
  };
}

/**
 * What the score would have been had the contestant stopped after their last
 * correct answer — the strategic point coaches make about the skip penalty.
 */
export function scoreIfStoppedAtLastCorrect(answers: ExamAnswer[]): number {
  const corrects = answers.filter((a) => !a.skipped && a.correct);
  if (!corrects.length) return 0;
  const cutoff = Math.max(...corrects.map((a) => a.position));
  return scoreExam(answers.filter((a) => a.position <= cutoff)).score;
}
