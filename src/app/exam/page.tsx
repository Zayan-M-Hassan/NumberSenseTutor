import { getPractisableTopics, getTopic } from '@/data/topics';
import { EXAM_LENGTH, QUARTILE_TAGS, isStarPosition } from '@/lib/exam';
import type { ExamQuestion, Question } from '@/lib/types';
import { ExamRunner } from '@/components/exam-runner';

export const metadata = { title: 'Full test — 80 questions, 10 minutes' };

type Pooled = Question & { topicId: string; topicName: string };

/**
 * Assemble a paper on the server: 80 questions, weighted by quartile the way
 * real papers are, with starred problems in the eight slots they always occupy.
 */
async function buildPaper(): Promise<ExamQuestion[]> {
  const exact: Pooled[] = [];
  const approximate: Pooled[] = [];

  for (const t of getPractisableTopics()) {
    const topic = await getTopic(t.id);
    if (!topic) continue;
    for (const q of topic.questions) {
      const entry = { ...q, topicId: topic.id, topicName: topic.name };
      if (q.kind === 'approximate') approximate.push(entry);
      else exact.push(entry);
    }
  }

  const rand = () => Math.random();
  const shuffled = <T,>(a: T[]) => [...a].sort(() => rand() - 0.5);

  const usedIds = new Set<string>();
  const uid = (q: Pooled) => `${q.topicId}:${q.id}`;

  const take = (pool: Pooled[], tags: string[]): Pooled | null => {
    const preferred = pool.filter(
      (q) => !usedIds.has(uid(q)) && q.tags?.some((tag) => tags.includes(tag))
    );
    const fallback = pool.filter((q) => !usedIds.has(uid(q)));
    const from = preferred.length ? preferred : fallback;
    if (!from.length) return null;
    const q = from[Math.floor(rand() * from.length)];
    usedIds.add(uid(q));
    return q;
  };

  const starPool = shuffled(approximate);
  const paper: ExamQuestion[] = [];

  for (let position = 1; position <= EXAM_LENGTH; position++) {
    const quartile = Math.floor((position - 1) / 20);
    const tags = QUARTILE_TAGS[quartile];
    const picked = isStarPosition(position)
      ? take(starPool, tags) ?? take(exact, tags)
      : take(exact, tags);
    if (!picked) continue;
    paper.push({ ...picked, position });
  }

  return paper;
}

export default async function ExamPage() {
  const paper = await buildPaper();
  return <ExamRunner paper={paper} />;
}
