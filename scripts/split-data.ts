/**
 * Splits the single 1 MB math-topics.json into one file per topic plus a small
 * index. The home page previously shipped the entire question bank — every
 * question and every lesson — to the browser before you picked a topic.
 *
 * Run: npx tsx scripts/split-data.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import type { MathTopic, TopicSummary } from '../src/lib/types';

const SRC = path.join(__dirname, '../src/data/math-topics.json');
const OUT = path.join(__dirname, '../src/data/topics');

const topics = JSON.parse(fs.readFileSync(SRC, 'utf8')) as MathTopic[];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const index: TopicSummary[] = topics.map((t) => ({
  id: t.id,
  name: t.title,
  summary: t.summary ?? t.title,
  questionCount: t.questions.length,
  ...(t.section ? { section: true } : {}),
}));

for (const t of topics) {
  fs.writeFileSync(path.join(OUT, `${t.id}.json`), JSON.stringify(t));
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2) + '\n');

const indexBytes = fs.statSync(path.join(OUT, 'index.json')).size;
const totalBytes = fs.statSync(SRC).size;
console.log('topics written:', topics.length);
console.log('index size:', (indexBytes / 1024).toFixed(1), 'KB');
console.log('full bank was:', (totalBytes / 1024).toFixed(0), 'KB');
console.log('home page payload reduced by:', (100 * (1 - indexBytes / totalBytes)).toFixed(1) + '%');
