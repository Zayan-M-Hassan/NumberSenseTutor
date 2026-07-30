/**
 * Answer parsing and grading for UIL/TMSCA number sense.
 *
 * The original app did `Number(question.answer)` and compared with `===`.
 * A fifth of the question bank stores answers that aren't plain numbers
 * ("3/4", "35 1/16", "infinity", "Perfect"), so `Number()` produced NaN and
 * every one of those questions was unwinnable. Nothing outside this module
 * should coerce an answer to a number.
 *
 * Grading rules are taken from real UIL tests (2024/2025 district, regional
 * and state papers):
 *
 *  - Answer keys list every acceptable form side by side — "4/3, 1 1/3" —
 *    so equivalent notations must all be accepted.
 *  - Except: "If an answer is of the type like 2/3 it cannot be written as a
 *    repeating decimal." A decimal only satisfies a rational answer when that
 *    fraction terminates in base 10.
 *  - Starred problems "require approximate integral answers; any answer ...
 *    within five percent of the exact answer will be scored correct".
 *    Both halves matter: integral AND within 5%.
 *  - Some questions state a required form inline — "(mixed number)",
 *    "(fraction)" — and then only that form counts.
 */

import type { QuestionKind, RequiredForm } from './types';

/* ------------------------------------------------------------------ *
 * Parsed answers
 * ------------------------------------------------------------------ */

export type ParsedAnswer =
  | {
      kind: 'numeric';
      value: number;
      /** Present when the value is exactly a ratio of integers. */
      rational?: { num: number; den: number };
      /** True when the value cannot be written as a finite decimal. */
      irrational: boolean;
      display: string;
    }
  /** Symbolic algebra: derivative and limit answers like "2x", "9x^2-4x+1". */
  | { kind: 'expression'; canonical: string; display: string }
  /** "16+16i" */
  | { kind: 'complex'; re: number; im: number; display: string }
  | { kind: 'categorical'; value: string; display: string }
  | { kind: 'infinite'; sign: 1 | -1; display: string }
  | { kind: 'unknown'; raw: string };

export type AnswerForm =
  | 'integer'
  | 'decimal'
  | 'fraction'
  | 'mixed'
  | 'percent'
  | 'symbolic'
  | 'word';

export type ParsedInput =
  | { ok: true; value: number; form: AnswerForm; rational?: { num: number; den: number } }
  | { ok: false };

const WORD_ALIASES: Record<string, string> = {
  inf: 'infinity',
  infinite: 'infinity',
  '∞': 'infinity',
  undef: 'undefined',
  dne: 'undefined',
  'does not exist': 'undefined',
  y: 'yes',
  n: 'no',
  t: 'true',
  f: 'false',
};

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function reduce(num: number, den: number) {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

/** A fraction is writable as a finite decimal iff its denominator is 2^a * 5^b. */
export function terminates(den: number): boolean {
  let d = Math.abs(den);
  if (d === 0) return false;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/** Strip formatting noise: commas, currency, whitespace, LaTeX wrappers. */
function clean(raw: string): string {
  return String(raw)
    .replace(/\$/g, '')
    .replace(/\\[a-zA-Z]+/g, (m) => (m === '\\pi' ? 'pi' : m === '\\infty' ? 'infinity' : ' '))
    .replace(/[{}]/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Unicode vulgar fractions that show up in typed input. */
const VULGAR: Record<string, [number, number]> = {
  '½': [1, 2], '⅓': [1, 3], '⅔': [2, 3], '¼': [1, 4], '¾': [3, 4],
  '⅕': [1, 5], '⅖': [2, 5], '⅗': [3, 5], '⅘': [4, 5], '⅙': [1, 6],
  '⅚': [5, 6], '⅛': [1, 8], '⅜': [3, 8], '⅝': [5, 8], '⅞': [7, 8],
};

function expandVulgar(s: string): string {
  for (const [glyph, [n, d]] of Object.entries(VULGAR)) {
    if (s.includes(glyph)) s = s.replace(glyph, `${s.match(/\d\s*$/) ? '' : ''} ${n}/${d}`).trim();
  }
  return s.replace(/\s+/g, ' ');
}

/* ------------------------------------------------------------------ *
 * parseAnswer — reads the authored answer string from the question bank
 * ------------------------------------------------------------------ */

export function parseAnswer(raw: string): ParsedAnswer {
  const original = String(raw).trim();
  const s = expandVulgar(clean(original));
  if (!s) return { kind: 'unknown', raw: original };

  const lower = s.toLowerCase();

  // Infinity, with sign.
  if (/^[+-]?\s*(infinity|inf)$/.test(lower)) {
    return { kind: 'infinite', sign: lower.startsWith('-') ? -1 : 1, display: original };
  }

  // Complex numbers: "16+16i", "-3i", "2 - 5i".
  const complex = parseComplex(s);
  if (complex) return { ...complex, display: original };

  const numeric = parseNumericLiteral(s);
  if (numeric) {
    return {
      kind: 'numeric',
      value: numeric.value,
      rational: numeric.rational,
      irrational: numeric.irrational,
      display: original,
    };
  }

  // Ordinals: "11th", "7th" — compared as words.
  if (/^\d+(st|nd|rd|th)$/i.test(s)) {
    return { kind: 'categorical', value: s.toLowerCase(), display: original };
  }

  // Anything alphabetic left over is a word answer: "Perfect", "Yes", "clockwise".
  if (/^[a-z][a-z\s'-]*$/i.test(s)) {
    return { kind: 'categorical', value: normaliseWord(s), display: original };
  }

  // Symbolic algebra — derivative and limit answers: "2x", "9x^2-4x+1",
  // "1/(2√x)", "a/b". Any leftover free variable lands here.
  if (/[a-z]/i.test(s)) {
    return { kind: 'expression', canonical: canonicalExpression(s), display: original };
  }

  // Intervals and set-builder answers: "[1, 3]".
  if (/^[[({].*[\])}]$/.test(s)) {
    return { kind: 'categorical', value: s.replace(/\s+/g, '').toLowerCase(), display: original };
  }

  return { kind: 'unknown', raw: original };
}

function parseComplex(
  s: string
): { kind: 'complex'; re: number; im: number } | null {
  const t = s.replace(/\s+/g, '');
  if (!/i$/.test(t) && !/i[^a-z]/.test(t)) return null;
  if (!/^[-+]?[\d./]*(?:[-+][\d./]*)?i$/.test(t)) return null;
  const m = t.match(/^([-+]?[\d./]+)?([-+][\d./]*)?i$/);
  if (!m) return null;
  // "16+16i" -> re 16, im 16 ; "-3i" -> re 0, im -3
  if (m[2] !== undefined) {
    const re = evaluateExpression(m[1] ?? '0');
    const imRaw = m[2] === '+' ? '1' : m[2] === '-' ? '-1' : m[2];
    const im = evaluateExpression(imRaw);
    if (re === null || im === null) return null;
    return { kind: 'complex', re, im };
  }
  const raw = m[1] ?? '1';
  const im = evaluateExpression(raw === '+' ? '1' : raw === '-' ? '-1' : raw);
  if (im === null) return null;
  return { kind: 'complex', re: 0, im };
}

/** Normalise a symbolic expression so equivalent spellings compare equal. */
export function canonicalExpression(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/√/g, 'sqrt')
    .replace(/∛/g, 'cbrt')
    .replace(/π/g, 'pi')
    .replace(/\*/g, '')
    .replace(/^\+/, '');
}

function normaliseWord(s: string): string {
  const t = s.toLowerCase().trim().replace(/\s+/g, ' ');
  return WORD_ALIASES[t] ?? t;
}

/**
 * Parse any numeric literal shape: integer, decimal, fraction, mixed number,
 * percent, and the symbolic constants that appear in the bank (pi, radicals).
 */
function parseNumericLiteral(
  s: string
): { value: number; rational?: { num: number; den: number }; irrational: boolean } | null {
  const t = s.trim();

  // Percent, including mixed-number percents: "85.6%", "42 6/7%", "1 1/4%".
  const pct = t.match(/^(.+?)\s*%$/);
  if (pct) {
    const inner = parseNumericLiteral(pct[1]);
    if (!inner) return null;
    const rational = inner.rational ? reduce(inner.rational.num, inner.rational.den * 100) : undefined;
    return { value: inner.value / 100, rational, irrational: inner.irrational };
  }

  // Mixed number: "35 1/16", "-2 3/4"
  const mixed = t.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const whole = parseInt(mixed[1], 10);
    const n = parseInt(mixed[2], 10);
    const d = parseInt(mixed[3], 10);
    if (d === 0) return null;
    const sign = mixed[1].startsWith('-') ? -1 : 1;
    const num = sign * (Math.abs(whole) * d + n);
    return { value: num / d, rational: reduce(num, d), irrational: false };
  }

  // Plain fraction: "3/4", "-19/24"
  const frac = t.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
  if (frac) {
    const n = parseInt(frac[1], 10);
    const d = parseInt(frac[2], 10);
    if (d === 0) return null;
    return { value: n / d, rational: reduce(n, d), irrational: false };
  }

  // Repeating decimal notation in stored data: "0.333..."
  if (/\.\.\.$/.test(t)) {
    const v = parseFloat(t.replace(/\.\.\.$/, ''));
    return Number.isFinite(v) ? { value: v, irrational: true } : null;
  }

  // Integer or terminating decimal.
  if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) {
    const v = parseFloat(t);
    if (!Number.isFinite(v)) return null;
    const decimals = (t.split('.')[1] ?? '').length;
    const den = Math.pow(10, decimals);
    return { value: v, rational: reduce(Math.round(v * den), den), irrational: false };
  }

  // Anything else closed-form: "2sqrt(3)", "1/e", "(e^2-1)/2", "∛6", "4/√5".
  const evaluated = evaluateExpression(t);
  if (evaluated !== null) {
    if (isRationalExpression(t)) {
      // A pure arithmetic expression such as "(3+4)/2" is still rational, but
      // recovering exact num/den is not worth it — treat as terminating only
      // when the value itself has a short decimal form.
      const asStr = String(evaluated);
      if (/^-?\d+(\.\d{1,12})?$/.test(asStr)) {
        const decimals = (asStr.split('.')[1] ?? '').length;
        const den = Math.pow(10, decimals);
        return {
          value: evaluated,
          rational: reduce(Math.round(evaluated * den), den),
          irrational: false,
        };
      }
      return { value: evaluated, irrational: false };
    }
    return { value: evaluated, irrational: true };
  }

  return null;
}

/**
 * Evaluate a closed-form arithmetic expression over the constants that appear
 * in the bank: "2sqrt(3)", "√2", "-pi", "pi/2", "1/e", "(e^2-1)/2", "∛(1/4)",
 * "4/√5". Recursive descent, no eval — the input is data, not code.
 *
 * Returns null if the expression contains a free variable (that's a symbolic
 * answer, handled separately) or fails to parse.
 */
function evaluateExpression(input: string): number | null {
  const src = input
    .replace(/√/g, 'sqrt')
    .replace(/∛/g, 'cbrt')
    .replace(/π/g, 'pi')
    .replace(/\s+/g, '')
    .toLowerCase();

  if (!src) return null;
  // Only digits, operators, parens and the known constant/function names.
  if (!/^[-+*/^().\d]*(?:(?:sqrt|cbrt|ln|log|pi|e)[-+*/^().\d]*)*$/.test(src)) return null;

  let i = 0;
  const peek = () => src[i];
  const eat = (c: string) => {
    if (src[i] === c) {
      i++;
      return true;
    }
    return false;
  };

  function parseExpr(): number | null {
    let left = parseTerm();
    if (left === null) return null;
    for (;;) {
      if (eat('+')) {
        const r = parseTerm();
        if (r === null) return null;
        left += r;
      } else if (eat('-')) {
        const r = parseTerm();
        if (r === null) return null;
        left -= r;
      } else return left;
    }
  }

  function parseTerm(): number | null {
    let left = parseUnary();
    if (left === null) return null;
    for (;;) {
      if (eat('*')) {
        const r = parseUnary();
        if (r === null) return null;
        left *= r;
      } else if (eat('/')) {
        const r = parseUnary();
        if (r === null || r === 0) return null;
        left /= r;
      } else if (/[\d(a-z]/.test(peek() ?? '')) {
        // Implicit multiplication: "2sqrt(3)", "2pi".
        const r = parseUnary();
        if (r === null) return null;
        left *= r;
      } else return left;
    }
  }

  function parseUnary(): number | null {
    if (eat('-')) {
      const v = parseUnary();
      return v === null ? null : -v;
    }
    if (eat('+')) return parseUnary();
    return parsePower();
  }

  function parsePower(): number | null {
    const base = parseAtom();
    if (base === null) return null;
    if (eat('^')) {
      const exp = parseUnary();
      if (exp === null) return null;
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseAtom(): number | null {
    if (eat('(')) {
      const v = parseExpr();
      if (v === null || !eat(')')) return null;
      return v;
    }
    if (src.startsWith('sqrt', i)) {
      i += 4;
      const v = parseAtom();
      return v === null || v < 0 ? null : Math.sqrt(v);
    }
    if (src.startsWith('cbrt', i)) {
      i += 4;
      const v = parseAtom();
      return v === null ? null : Math.cbrt(v);
    }
    if (src.startsWith('ln', i)) {
      i += 2;
      const v = parseAtom();
      return v === null || v <= 0 ? null : Math.log(v);
    }
    if (src.startsWith('log', i)) {
      i += 3;
      const v = parseAtom();
      return v === null || v <= 0 ? null : Math.log10(v);
    }
    if (src.startsWith('pi', i)) {
      i += 2;
      return Math.PI;
    }
    if (src[i] === 'e' && !/\d/.test(src[i + 1] ?? '')) {
      i++;
      return Math.E;
    }
    const m = /^\d*\.?\d+/.exec(src.slice(i));
    if (m) {
      i += m[0].length;
      return parseFloat(m[0]);
    }
    return null;
  }

  const value = parseExpr();
  if (value === null || i !== src.length || !Number.isFinite(value)) return null;
  return value;
}

/** True when the expression evaluates exactly (no irrational constants). */
function isRationalExpression(s: string): boolean {
  return !/(sqrt|cbrt|pi|√|∛|π)/i.test(s) && !/\be\b/i.test(s);
}

/* ------------------------------------------------------------------ *
 * parseInput — reads what the user typed
 * ------------------------------------------------------------------ */

export function parseInput(raw: string): ParsedInput {
  const original = String(raw).trim();
  if (!original) return { ok: false };
  const s = expandVulgar(clean(original));
  if (!s) return { ok: false };

  const lower = s.toLowerCase();
  if (/^[+-]?\s*(infinity|inf|∞)$/.test(lower)) {
    return { ok: true, value: lower.startsWith('-') ? -Infinity : Infinity, form: 'word' };
  }

  if (/^[a-z][a-z\s'-]*$/i.test(s)) {
    return { ok: true, value: NaN, form: 'word' };
  }

  const SYMBOLIC = /(sqrt|cbrt|ln|log|pi|π|√|∛|\be\b|[a-z])/i;
  const form: AnswerForm = /%$/.test(s)
    ? 'percent'
    : /^\s*[+-]?\d+\s+\d+\s*\/\s*\d+\s*$/.test(s)
      ? 'mixed'
      : SYMBOLIC.test(s)
        ? 'symbolic'
        : /\//.test(s)
          ? 'fraction'
          : /\./.test(s)
            ? 'decimal'
            : 'integer';

  const parsed = parseNumericLiteral(s);
  if (!parsed) return { ok: false };
  return { ok: true, value: parsed.value, form, rational: parsed.rational };
}

/** The literal word the user typed, normalised for comparison. */
export function inputWord(raw: string): string {
  return normaliseWord(clean(String(raw)));
}

/* ------------------------------------------------------------------ *
 * Grading
 * ------------------------------------------------------------------ */

export type GradeOptions = {
  kind: QuestionKind;
  requiredForm?: RequiredForm;
};

export type GradeResult = {
  correct: boolean;
  /** Why it was rejected, for feedback the user can learn from. */
  reason?: 'wrong-value' | 'repeating-decimal' | 'not-integral' | 'wrong-form' | 'unparseable';
  /** Human-readable statement of the expected answer. */
  expected: string;
};

const EPSILON = 1e-9;

function closeEnough(a: number, b: number): boolean {
  if (a === b) return true;
  const scale = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) <= EPSILON * scale;
}

/**
 * The accepted range for a starred (approximate) question: integers within
 * 5% of the exact value. Real answer keys print exactly this, e.g. "450 - 496".
 */
export function approximateRange(value: number): { lo: number; hi: number } {
  const margin = Math.abs(value) * 0.05;
  return { lo: Math.ceil(value - margin), hi: Math.floor(value + margin) };
}

export function describeAnswer(parsed: ParsedAnswer, kind: QuestionKind): string {
  if (parsed.kind === 'unknown') return parsed.raw;
  if (parsed.kind === 'infinite') return parsed.sign < 0 ? '-infinity' : 'infinity';
  if (parsed.kind === 'categorical') return parsed.display;
  if (parsed.kind === 'expression' || parsed.kind === 'complex') return parsed.display;
  if (kind === 'approximate') {
    const { lo, hi } = approximateRange(parsed.value);
    if (hi < lo) return `within 5% of ${parsed.display}`;
    return `${lo.toLocaleString()} to ${hi.toLocaleString()} (exact: ${parsed.display})`;
  }
  return parsed.display;
}

function matchesForm(form: AnswerForm, required: RequiredForm | undefined): boolean {
  if (!required) return true;
  if (typeof required === 'object') return true; // base-N handled by the caller
  switch (required) {
    case 'mixed':
      return form === 'mixed' || form === 'integer';
    case 'fraction':
    case 'properFraction':
      return form === 'fraction' || form === 'mixed';
    case 'decimal':
      return form === 'decimal' || form === 'integer' || form === 'percent';
    case 'roman':
    case 'arabic':
      return true;
    default:
      return true;
  }
}

export function gradeAnswer(
  userInput: string,
  answer: string,
  options: GradeOptions
): GradeResult {
  const parsed = parseAnswer(answer);
  const expected = describeAnswer(parsed, options.kind);

  if (parsed.kind === 'unknown') {
    // Fall back to a literal string comparison rather than failing everything.
    const ok = clean(userInput).toLowerCase() === clean(parsed.raw).toLowerCase();
    return { correct: ok, reason: ok ? undefined : 'unparseable', expected };
  }

  // Word answers: "Perfect", "Yes", "infinity", "11th", "[1, 3]".
  if (parsed.kind === 'categorical') {
    const typed = inputWord(userInput);
    const squash = (x: string) => x.replace(/\s+/g, '');
    const ok = typed === parsed.value || squash(typed) === squash(parsed.value);
    return { correct: ok, reason: ok ? undefined : 'wrong-value', expected };
  }

  if (parsed.kind === 'infinite') {
    const w = inputWord(userInput);
    const neg = /^-/.test(clean(userInput));
    const ok = w.replace(/^-/, '') === 'infinity' && (neg ? parsed.sign === -1 : parsed.sign === 1);
    return { correct: ok, reason: ok ? undefined : 'wrong-value', expected };
  }

  // Symbolic algebra: compare canonical spellings.
  if (parsed.kind === 'expression') {
    const ok = canonicalExpression(clean(userInput)) === parsed.canonical;
    return { correct: ok, reason: ok ? undefined : 'wrong-value', expected };
  }

  if (parsed.kind === 'complex') {
    const other = parseComplex(expandVulgar(clean(userInput)));
    if (other) {
      const ok = closeEnough(other.re, parsed.re) && closeEnough(other.im, parsed.im);
      return { correct: ok, reason: ok ? undefined : 'wrong-value', expected };
    }
    // A purely real answer typed against a complex expected value.
    const asReal = parseInput(userInput);
    const ok = asReal.ok && parsed.im === 0 && closeEnough(asReal.value, parsed.re);
    return { correct: ok, reason: ok ? undefined : 'wrong-value', expected };
  }

  const input = parseInput(userInput);
  if (!input.ok || Number.isNaN(input.value)) {
    return { correct: false, reason: 'unparseable', expected };
  }

  // Starred problems: "approximate integral answers ... within five percent".
  if (options.kind === 'approximate') {
    const { lo, hi } = approximateRange(parsed.value);
    // When no integer lies within 5% (small non-integer answers, e.g. an
    // estimate of 4.5), the integral requirement is unsatisfiable — fall back
    // to plain 5% tolerance rather than making the question unwinnable.
    if (hi < lo) {
      const ok = Math.abs(input.value - parsed.value) <= Math.abs(parsed.value) * 0.05;
      return { correct: ok, reason: ok ? undefined : 'wrong-value', expected };
    }
    if (!Number.isInteger(input.value)) {
      return { correct: false, reason: 'not-integral', expected };
    }
    const ok = input.value >= lo && input.value <= hi;
    return { correct: ok, reason: ok ? undefined : 'wrong-value', expected };
  }

  // A required form overrides equivalence.
  if (!matchesForm(input.form, options.requiredForm)) {
    return { correct: false, reason: 'wrong-form', expected };
  }

  // "If an answer is of the type like 2/3 it cannot be written as a repeating
  // decimal." Reject decimal input whenever the true answer has no finite
  // decimal representation.
  const answerTerminates = parsed.rational ? terminates(parsed.rational.den) : !parsed.irrational;
  if ((input.form === 'decimal' || input.form === 'integer') && !answerTerminates) {
    return { correct: false, reason: 'repeating-decimal', expected };
  }

  const ok = closeEnough(input.value, parsed.value);
  return { correct: ok, reason: ok ? undefined : 'wrong-value', expected };
}
