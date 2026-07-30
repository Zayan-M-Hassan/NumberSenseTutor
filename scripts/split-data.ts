/**
 * Derives the runtime data from src/data/math-topics.json.
 *
 * At 1,000 questions per topic the bank is ~26 MB, so questions must never be
 * bundled into a page: a practice page that serialised its topic would ship
 * ~200 KB of JSON per route. Instead:
 *
 *   public/topics/{id}.json   questions only — fetched by the browser, cached
 *   public/exam-pool.json     a sample across all topics, for exam assembly
 *   src/data/lessons/{id}.json  lesson HTML only — server-rendered, no questions
 *   src/data/topics/index.json  id, name, summary, count — the home page
 *
 * Run: npx tsx scripts/split-data.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import type { MathTopic, TopicSummary } from '../src/lib/types';

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src/data/math-topics.json');
const PUBLIC_TOPICS = path.join(ROOT, 'public/topics');
const LESSONS = path.join(ROOT, 'src/data/lessons');
const INDEX_DIR = path.join(ROOT, 'src/data/topics');

/** How many questions per topic go into the shared exam pool. */
const EXAM_SAMPLE = 40;

const topics = JSON.parse(fs.readFileSync(SRC, 'utf8')) as MathTopic[];

for (const dir of [PUBLIC_TOPICS, LESSONS, INDEX_DIR]) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

const index: TopicSummary[] = [];
const examPool: unknown[] = [];

for (const t of topics) {
  index.push({
    id: t.id,
    name: t.title,
    summary: t.summary ?? t.title,
    questionCount: t.questions.length,
    ...(t.section ? { section: true } : {}),
  });

  // Lesson: content only, no questions.
  fs.writeFileSync(
    path.join(LESSONS, `${t.id}.json`),
    JSON.stringify({
      id: t.id,
      title: t.title,
      content: t.content,
      summary: t.summary ?? t.title,
      questionCount: t.questions.length,
      starredCount: t.questions.filter((q) => q.kind === 'approximate').length,
      ...(t.section ? { section: true } : {}),
    })
  );

  if (t.section || t.questions.length === 0) continue;

  // Questions: a static asset the browser fetches.
  fs.writeFileSync(path.join(PUBLIC_TOPICS, `${t.id}.json`), JSON.stringify(t.questions));

  // Exam pool: an evenly spaced sample so it covers each topic's variants.
  const step = Math.max(1, Math.floor(t.questions.length / EXAM_SAMPLE));
  let taken = 0;
  for (let i = 0; i < t.questions.length && taken < EXAM_SAMPLE; i += step, taken++) {
    const q = t.questions[i];
    examPool.push({
      i: q.id,
      t: q.text,
      a: q.answer,
      k: q.kind,
      ...(q.requiredForm ? { f: q.requiredForm } : {}),
      g: q.tags ?? [],
      tid: t.id,
      tn: t.title,
    });
  }
}

fs.writeFileSync(path.join(INDEX_DIR, 'index.json'), JSON.stringify(index, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'public/exam-pool.json'), JSON.stringify(examPool));

const kb = (p: string) => (fs.statSync(p).size / 1024).toFixed(0);
const totalQuestions = topics.reduce((n, t) => n + t.questions.length, 0);

console.log('topics:', topics.length, '| questions:', totalQuestions.toLocaleString());
console.log('index.json:      ', kb(path.join(INDEX_DIR, 'index.json')), 'KB (home page)');
console.log('exam-pool.json:  ', kb(path.join(ROOT, 'public/exam-pool.json')), 'KB (fetched by /exam)');
console.log('per-topic question file: ~' + kb(path.join(PUBLIC_TOPICS, 's1.1.json')) + ' KB (fetched on demand)');
console.log('exam pool size:  ', examPool.length.toLocaleString(), 'questions');
