/**
 * Expands every practisable topic to TARGET questions using the per-topic
 * generators, keeping the existing hand-authored questions first.
 *
 * Every generated answer is validated through the real grader before it is
 * accepted: it must parse, and it must grade itself as correct. Anything that
 * fails is dropped rather than written to the bank — the original bank was
 * hand-authored without that check and 20% of it was unusable.
 *
 * Run: npx tsx scripts/expand-bank.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { gradeAnswer, parseAnswer } from '../src/lib/answer';
import type { MathTopic, Question } from '../src/lib/types';
import { Rng, type Generator } from './gen/helpers';
import { S1 } from './gen/s1';
import { S2 } from './gen/s2';
import { S3 } from './gen/s3';
import { S4 } from './gen/s4';
import { S5 } from './gen/s5';

const TARGET = Number(process.env.TARGET ?? 1000);
const SRC = path.join(__dirname, '../src/data/math-topics.json');

const GENERATORS: Record<string, Generator> = { ...S1, ...S2, ...S3, ...S4, ...S5 };

const topics = JSON.parse(fs.readFileSync(SRC, 'utf8')) as MathTopic[];

/** A generated question is only kept if the grader agrees with it. */
function valid(q: { text: string; answer: string; kind?: string }): boolean {
  if (!q.text || !q.answer) return false;
  if (q.answer.length > 40) return false;
  if (/NaN|Infinity|undefined|null/.test(q.answer)) return false;
  const parsed = parseAnswer(q.answer);
  if (parsed.kind === 'unknown') return false;
  const kind = (q.kind ?? 'exact') as 'exact' | 'approximate' | 'categorical';
  // Feeding an answer back to itself must grade as correct.
  return gradeAnswer(q.answer, q.answer, { kind: kind === 'approximate' ? 'exact' : kind }).correct;
}

const report: Array<{ id: string; title: string; before: number; after: number; short: boolean }> = [];
let rejected = 0;

for (const topic of topics) {
  if (topic.section || topic.questions.length === 0) continue;

  const gen = GENERATORS[topic.id];
  const before = topic.questions.length;

  if (!gen) {
    report.push({ id: topic.id, title: topic.title, before, after: before, short: true });
    continue;
  }

  const seen = new Set(topic.questions.map((q) => q.text));
  const out: Question[] = topic.questions.map((q, i) => ({ ...q, id: i + 1 }));

  // Seed from the topic id so reruns are reproducible per topic.
  const seed = [...topic.id].reduce((a, c) => a + c.charCodeAt(0) * 7919, 104729);
  const rng = new Rng(seed);

  let attempts = 0;
  const maxAttempts = TARGET * 200;
  while (out.length < TARGET && attempts < maxAttempts) {
    attempts++;
    let made;
    try {
      made = gen.make(rng);
    } catch {
      continue;
    }
    if (!made) continue;
    if (seen.has(made.text)) continue;
    if (!valid(made)) {
      rejected++;
      continue;
    }
    seen.add(made.text);
    out.push({
      id: out.length + 1,
      text: made.text,
      answer: made.answer,
      kind: made.kind ?? 'exact',
      ...(made.requiredForm ? { requiredForm: made.requiredForm } : {}),
      tags: gen.tags,
      ...(made.kind === 'approximate' ? { hasErrorRange: true } : {}),
    });
  }

  topic.questions = out;
  report.push({
    id: topic.id,
    title: topic.title,
    before,
    after: out.length,
    short: out.length < TARGET,
  });
}

fs.writeFileSync(SRC, JSON.stringify(topics, null, 2) + '\n');

const total = topics.reduce((n, t) => n + t.questions.length, 0);
const short = report.filter((x) => x.short);

console.log(`target per topic: ${TARGET}`);
console.log(`topics expanded:  ${report.length - short.length} of ${report.length}`);
console.log(`total questions:  ${total.toLocaleString()}`);
console.log(`rejected by grader: ${rejected.toLocaleString()}`);

if (short.length) {
  console.log(`\nBELOW TARGET (${short.length}):`);
  for (const s of short) {
    console.log(`  ${s.id.padEnd(9)} ${String(s.after).padStart(5)}  ${s.title}`);
  }
} else {
  console.log('\nEvery practisable topic reached the target.');
}
