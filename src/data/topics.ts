import type { Question, TopicSummary } from '@/lib/types';
import index from './topics/index.json';

/** A topic's lesson and metadata — no questions. Safe to render on the server. */
export type TopicLesson = {
  id: string;
  title: string;
  content: string;
  summary: string;
  questionCount: number;
  starredCount: number;
  section?: boolean;
};

/**
 * The topic index: id, name, summary and question count only — about 30 KB
 * against the 26 MB bank. Questions are never bundled; the browser fetches
 * `/topics/{id}.json` for the topic it actually needs.
 */
export function getTopicIndex(): TopicSummary[] {
  return index as TopicSummary[];
}

export function getPractisableTopics(): TopicSummary[] {
  return getTopicIndex().filter((t) => !t.section && t.questionCount > 0);
}

/**
 * The parts of the source syllabus. Topic ids look like "s2.1.4", so the
 * leading segment groups them.
 */
export const SECTIONS: Array<{ key: string; title: string; blurb: string }> = [
  {
    key: 's1',
    title: 'Multiplication tricks',
    blurb: 'Shortcuts that replace a long multiplication with a single step.',
  },
  {
    key: 's2',
    title: 'Memorization',
    blurb: 'The numbers and formulas you are expected to already know cold.',
  },
  {
    key: 's3',
    title: 'Miscellaneous',
    blurb: 'Bases, remainders, logs and sets — the middle of the test.',
  },
  {
    key: 's4',
    title: 'Advanced',
    blurb: 'The back forty: Fibonacci, phi, and the harder approximations.',
  },
  {
    key: 's5',
    title: 'Contest coverage',
    blurb: 'Types that appear on real papers but were missing from the book.',
  },
];

export function sectionOf(id: string): string {
  return id.split('.')[0];
}

/** Load one topic's lesson. Server-side; contains no questions. */
export async function getLesson(id: string): Promise<TopicLesson | undefined> {
  if (!/^[a-z0-9.]+$/i.test(id)) return undefined;
  try {
    const mod = (await import(`./lessons/${id}.json`)) as { default: TopicLesson };
    return mod.default;
  } catch {
    return undefined;
  }
}

/** Fetch a topic's questions in the browser. Cached by the HTTP layer. */
export async function fetchQuestions(id: string): Promise<Question[]> {
  const res = await fetch(`/topics/${id}.json`);
  if (!res.ok) throw new Error(`Could not load questions for ${id}`);
  return (await res.json()) as Question[];
}

/** Compact shape used by the exam pool asset. */
export type PooledQuestion = {
  i: number;
  t: string;
  a: string;
  k: Question['kind'];
  f?: Question['requiredForm'];
  g: string[];
  tid: string;
  tn: string;
};

export async function fetchExamPool(): Promise<PooledQuestion[]> {
  const res = await fetch('/exam-pool.json');
  if (!res.ok) throw new Error('Could not load the exam pool');
  return (await res.json()) as PooledQuestion[];
}
