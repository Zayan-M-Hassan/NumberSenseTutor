/**
 * Rewrites src/data/math-topics.json into the schema the app now expects:
 * typed answers (kind), required answer forms, content tags, per-topic
 * summaries, section flags, and de-duplicated questions.
 *
 * Run: npx tsx scripts/migrate-data.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseAnswer } from '../src/lib/answer';
import type { MathTopic, Question, QuestionKind, RequiredForm } from '../src/lib/types';

const SRC = path.join(__dirname, '../src/data/math-topics.json');
const raw = JSON.parse(fs.readFileSync(SRC, 'utf8')) as Array<
  Omit<MathTopic, 'questions'> & {
    questions: Array<{ id: number; text: string; answer: string; hasErrorRange?: boolean }>;
  }
>;

/* ---------- content tags, mirroring the buckets used to classify real tests ---------- */

const TAGS: Array<[string, RegExp]> = [
  ['arithmetic', /calculate \$?\d|\\times|\\div|multiply|product of/i],
  ['fractions', /\\frac|fraction|mixed number/i],
  ['percent', /percent|\\%|%/],
  ['money', /\\\$\d|\bcost\b|\bcents\b|dollars/i],
  ['remainders', /remainder|modulo|\\pmod/i],
  ['divisors', /gcd|lcm|divisors|relatively prime|factors of/i],
  ['bases', /base ?\{?\d|_\{?\d\}?\b|base-\d/i],
  ['repeating-decimals', /\.\.\.|repeating/i],
  ['sequences', /sequence|term of|fibonacci|arithmetic series|geometric series|sum of the/i],
  ['sets', /\\cup|\\cap|set [AB]\b|subset|distinct elements/i],
  ['statistics', /median|\bmode\b|\bmean\b|range of/i],
  ['probability', /probability|odds|dice|coin/i],
  ['algebra', /roots|quadratic|discriminant|solve for|find \$?[xyk]\b|coefficient/i],
  ['functions', /f\(x\)|f\^\{-1\}|inverse|g\(x\)/i],
  ['geometry', /triangle|circle|polygon|area|perimeter|circumference|angle|radius|diagonal/i],
  ['coordinate-geometry', /slope|midpoint|distance between|reflect|directrix|parabola|vertex/i],
  ['trigonometry', /\\sin|\\cos|\\tan|\\csc|\\sec|\\cot|arcsin|radians/i],
  ['logs-exponents', /\\log|\\ln|exponent|\^\{|square root|\\sqrt/i],
  ['complex', /\bi\^|imaginary|complex/i],
  ['matrices', /matrix|determinant/i],
  ['calculus', /\\lim|\\int|derivative|f'\(/i],
  ['conversions', /convert|feet|yards|miles|inches|acres|gallons|pounds|celsius|fahrenheit|vara|league/i],
  ['counting', /how many|combinations|permutations|\\binom/i],
  ['number-theory', /prime|perfect|abundant|deficient|units digit|roman/i],
];

function tagsFor(text: string, topicTitle: string): string[] {
  const hay = `${text} ${topicTitle}`;
  const found = TAGS.filter(([, re]) => re.test(hay)).map(([name]) => name);
  return found.length ? found : ['arithmetic'];
}

/* ---------- required answer form, stated inline the way real tests do ---------- */

function requiredFormFor(text: string, answer: string): RequiredForm | undefined {
  if (/\(mixed number\)/i.test(text)) return 'mixed';
  if (/\(proper fraction\)/i.test(text)) return 'properFraction';
  if (/\(fraction\)/i.test(text)) return 'fraction';
  if (/\(decimal\)/i.test(text)) return 'decimal';
  const base = text.match(/base[- ]?(\d+)\s*$/i);
  if (base) return { base: parseInt(base[1], 10) };
  if (/roman numeral/i.test(text)) return 'roman';
  // Infer from the answer's own shape for the topics that demand it.
  if (/^-?\d+\s+\d+\/\d+$/.test(answer.trim())) return 'mixed';
  return undefined;
}

/** Append the form directive to the question text, as real papers do. */
function withFormDirective(text: string, form: RequiredForm | undefined): string {
  if (!form) return text;
  if (/\((mixed number|fraction|proper fraction|decimal)\)/i.test(text)) return text;
  const label =
    form === 'mixed'
      ? '(mixed number)'
      : form === 'fraction'
        ? '(fraction)'
        : form === 'properFraction'
          ? '(proper fraction)'
          : form === 'decimal'
            ? '(decimal)'
            : null;
  return label ? `${text.replace(/\s*$/, '')} ${label}` : text;
}

/* ---------- summaries for topic cards ---------- */

function summarise(content: string, title: string): string {
  const plain = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\$[^$]*\$/g, '')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const sentence = plain.split(/(?<=[.!?])\s/)[0] ?? '';
  const s = sentence.length > 20 && sentence.length < 180 ? sentence : plain.slice(0, 150);
  return s.trim() || title;
}

/* ---------- migrate ---------- */

let removedDupes = 0;
let fixedCorrupt = 0;

const migrated: MathTopic[] = raw.map((t) => {
  const seen = new Set<string>();
  const questions: Question[] = [];

  for (const q of t.questions) {
    const answer = String(q.answer).trim();

    // One generation artefact sits in the bank where an answer should be.
    if (/not a trick question|calculation needed/i.test(answer)) {
      fixedCorrupt++;
      continue;
    }
    if (seen.has(q.text)) {
      removedDupes++;
      continue;
    }
    seen.add(q.text);

    const parsed = parseAnswer(answer);
    const kind: QuestionKind = q.hasErrorRange
      ? 'approximate'
      : parsed.kind === 'categorical' || parsed.kind === 'infinite'
        ? 'categorical'
        : 'exact';

    const form = kind === 'approximate' ? undefined : requiredFormFor(q.text, answer);

    questions.push({
      id: questions.length + 1,
      text: withFormDirective(q.text, form),
      answer,
      kind,
      ...(form ? { requiredForm: form } : {}),
      tags: tagsFor(q.text, t.title),
      ...(q.hasErrorRange ? { hasErrorRange: true } : {}),
    });
  }

  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    content: t.content,
    summary: summarise(t.content, t.title),
    generation_guideline: t.generation_guideline,
    ...(questions.length === 0 ? { section: true } : {}),
    questions,
  };
});

fs.writeFileSync(SRC, JSON.stringify(migrated, null, 2) + '\n');

console.log('migrated topics:', migrated.length);
console.log('questions:', migrated.reduce((n, t) => n + t.questions.length, 0));
console.log('duplicates removed:', removedDupes);
console.log('corrupt answers removed:', fixedCorrupt);
console.log('sections flagged:', migrated.filter((t) => t.section).map((t) => t.id).join(' '));
console.log('with requiredForm:', migrated.reduce((n, t) => n + t.questions.filter((q) => q.requiredForm).length, 0));
console.log('approximate:', migrated.reduce((n, t) => n + t.questions.filter((q) => q.kind === 'approximate').length, 0));
console.log('categorical:', migrated.reduce((n, t) => n + t.questions.filter((q) => q.kind === 'categorical').length, 0));
