/**
 * Read-only audit of the question bank. Run: npx tsx scripts/audit.ts
 */
import { approximateRange, parseAnswer } from '../src/lib/answer';
import data from '../src/data/math-topics.json';
import type { MathTopic } from '../src/lib/types';

const topics = data as unknown as MathTopic[];

let starred = 0;
const emptyRange: Array<{ t: string; text: string; a: string }> = [];
const starNonNumeric: Array<{ t: string; a: string }> = [];
const suspiciousExactStar: Array<{ t: string; a: string }> = [];
const corrupt: Array<{ t: string; a: string; text: string }> = [];
const dupes: Array<{ t: string; text: string }> = [];

for (const t of topics) {
  const seen = new Set<string>();
  for (const q of t.questions) {
    const a = String(q.answer);
    const p = parseAnswer(a);

    if (seen.has(q.text)) dupes.push({ t: t.id, text: q.text });
    seen.add(q.text);

    // Answers that are clearly generation artefacts rather than answers.
    if (/^[A-Z][a-z].*\.\s|not a trick question|calculation needed/i.test(a)) {
      corrupt.push({ t: t.id, a, text: q.text });
    }

    if (q.hasErrorRange) {
      starred++;
      if (p.kind !== 'numeric') {
        starNonNumeric.push({ t: t.id, a });
        continue;
      }
      const { lo, hi } = approximateRange(p.value);
      // UIL starred answers must be integral. If no integer lies within 5%,
      // the question cannot be graded as approximate at all.
      if (hi < lo) emptyRange.push({ t: t.id, text: q.text, a });
      // A starred problem whose answer is a small exact integer is almost
      // certainly mis-tagged: estimation questions have messy answers.
      if (Number.isInteger(p.value) && Math.abs(p.value) < 20) {
        suspiciousExactStar.push({ t: t.id, a });
      }
    }
  }
}

console.log('=== QUESTION BANK AUDIT ===');
console.log('topics:', topics.length, '| questions:', topics.reduce((n, t) => n + t.questions.length, 0));
console.log('empty topics (section headers):', topics.filter((t) => !t.questions.length).map((t) => t.id).join(' '));
console.log('\nstarred/approximate questions:', starred);
console.log('  non-numeric answer:', starNonNumeric.length, starNonNumeric.slice(0, 5).map((x) => x.a).join(', '));
console.log('  NO INTEGER within 5% (ungradeable as approximate):', emptyRange.length);
emptyRange.slice(0, 10).forEach((x) => console.log('     ', x.t, JSON.stringify(x.a), '::', x.text.slice(0, 60)));
console.log('  suspicious: small exact integer marked approximate:', suspiciousExactStar.length);
console.log('\ncorrupt answers:', corrupt.length);
corrupt.slice(0, 5).forEach((x) => console.log('     ', x.t, JSON.stringify(x.a.slice(0, 60)), '::', x.text.slice(0, 50)));
console.log('\nduplicate question texts:', dupes.length);
