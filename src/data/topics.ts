import type { MathTopic, Topic, TopicSummary } from '@/lib/types';
import index from './topics/index.json';

/**
 * The topic index: id, name, summary and question count only. This is what the
 * home page loads — about 30 KB, against the 2.3 MB of the full bank.
 */
export function getTopicIndex(): TopicSummary[] {
  return index as TopicSummary[];
}

/** Practisable topics, i.e. everything that isn't a section heading. */
export function getPractisableTopics(): TopicSummary[] {
  return getTopicIndex().filter((t) => !t.section && t.questionCount > 0);
}

/**
 * The parts of the source syllabus. Topic ids look like "s2.1.4", so the
 * leading segment groups them. The order is the book's order, which is also
 * roughly the order the material appears on a test.
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

/** Load one topic in full — questions and lesson content. */
export async function getTopic(id: string): Promise<Topic | undefined> {
  if (!/^[a-z0-9.]+$/i.test(id)) return undefined;
  try {
    const mod = (await import(`./topics/${id}.json`)) as { default: MathTopic };
    const t = mod.default;
    return {
      id: t.id,
      name: t.title,
      summary: t.summary ?? t.title,
      content: t.content,
      questions: t.questions,
      ...(t.section ? { section: true } : {}),
    };
  } catch {
    return undefined;
  }
}
