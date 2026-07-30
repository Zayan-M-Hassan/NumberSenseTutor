import { parseAnswer } from '../src/lib/answer';
import data from '../src/data/math-topics.json';
import type { MathTopic } from '../src/lib/types';

const topics = data as unknown as MathTopic[];
const bad: Array<{ t: string; title: string; a: string }> = [];
topics.forEach((t) =>
  t.questions.forEach((q) => {
    if (parseAnswer(String(q.answer)).kind === 'unknown')
      bad.push({ t: t.id, title: t.title, a: String(q.answer) });
  })
);

console.log('total unparseable:', bad.length);
const byTopic: Record<string, { title: string; vals: string[] }> = {};
bad.forEach((b) => {
  byTopic[b.t] = byTopic[b.t] || { title: b.title, vals: [] };
  byTopic[b.t].vals.push(b.a);
});
Object.entries(byTopic).forEach(([k, v]) =>
  console.log(
    k.padEnd(9),
    String(v.vals.length).padStart(4),
    v.title.slice(0, 34).padEnd(36),
    [...new Set(v.vals)].slice(0, 6).join(' | ')
  )
);
