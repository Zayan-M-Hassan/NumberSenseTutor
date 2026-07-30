import fs from 'node:fs';
import path from 'node:path';
import type { MathTopic } from './types';

/**
 * Loads the full question bank for tests and scripts.
 *
 * Read from disk rather than imported: at 128,000 questions the bank is ~26 MB
 * and must never end up in a bundle. Application code uses `src/data/topics.ts`,
 * which serves a 30 KB index and fetches questions as static assets.
 */
let cached: MathTopic[] | null = null;

export function loadBank(): MathTopic[] {
  if (cached) return cached;
  const file = path.join(process.cwd(), 'src/data/math-topics.json');
  cached = JSON.parse(fs.readFileSync(file, 'utf8')) as MathTopic[];
  return cached;
}
