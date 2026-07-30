/**
 * Generates question sets for the content types that appear on real UIL tests
 * but were absent or thin in the bank.
 *
 * Every answer here is COMPUTED, not authored. That is the whole point: the
 * original bank was written by hand and a fifth of its answers were unusable.
 *
 * Conversion factors are calibrated against real 2025 answer keys:
 *   1 vara            = 25/27 yards   (42,925 varas -> 39,745 yd, key 37,759-41,732)
 *   1 league of land  = 4,428.4 acres (4 3/4 leagues -> 21,035 ac, key 19,984-22,086)
 *   1 ft/s            = 15/22 mph     (440 ft/s -> 300 mph, key 300)
 *
 * Run: npx tsx scripts/generate-questions.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import type { MathTopic, Question } from '../src/lib/types';

const SRC = path.join(__dirname, '../src/data/math-topics.json');

/* ---------- deterministic pseudo-random, so reruns are reproducible ---------- */
let seed = 20250730;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)];
const int = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

/** Render p/q as the reduced string the answer key would print. */
function frac(p: number, q: number): string {
  if (q < 0) { p = -p; q = -q; }
  const g = gcd(p, q);
  p /= g; q /= g;
  if (q === 1) return String(p);
  return `${p}/${q}`;
}

type Gen = { id: string; slug: string; title: string; content: string; guideline: string; tags: string[]; make: () => { text: string; answer: string; kind?: 'exact' | 'approximate' } };

const P = (s: string) => `<p class="mb-4">${s}</p>`;

const GENERATORS: Gen[] = [
  /* -------------------------------------------------- systems of equations */
  {
    id: 's5.1.1', slug: 'systems-of-equations', title: 'Systems of Two Linear Equations',
    tags: ['algebra'],
    content:
      P('Number sense systems are built to collapse in one step. Look first for a variable whose coefficients are equal and opposite — adding the equations eliminates it immediately.') +
      P('For $ax + by = c$ and $dx - by = e$, adding gives $(a+d)x = c + e$, so $x = \\frac{c+e}{a+d}$. Substitute back only if the question asks for the other variable.') +
      P('If neither variable cancels directly, check whether one equation is a small multiple of the other before doing any real work.'),
    guideline: 'Generate a 2x2 linear system whose solution is a small rational number.',
    make: () => {
      const a = int(2, 9), b = int(1, 6), d = int(2, 9);
      const x = int(-6, 8), y = int(-6, 8);
      const c = a * x + b * y, e = d * x - b * y;
      const askY = rnd() < 0.5;
      return {
        text: `Let $${a}x + ${b}y = ${c}$ and $${d}x - ${b}y = ${e}$. Find $${askY ? 'y' : 'x'}$.`,
        answer: String(askY ? y : x),
      };
    },
  },

  /* -------------------------------------------------- coordinate geometry */
  {
    id: 's5.1.2', slug: 'reflections-and-midpoints', title: 'Reflections, Midpoints and Distance',
    tags: ['coordinate-geometry'],
    content:
      P('Reflecting a point is pure bookkeeping once you know the four rules: across the $x$-axis $(a,b) \\to (a,-b)$; across the $y$-axis $(a,b) \\to (-a,b)$; across $y = x$ the coordinates swap, $(a,b) \\to (b,a)$; across $y = -x$ they swap and both negate, $(a,b) \\to (-b,-a)$.') +
      P('The midpoint of $(a,b)$ and $(c,d)$ is $\\left(\\frac{a+c}{2}, \\frac{b+d}{2}\\right)$ — average each coordinate separately.') +
      P('For distance, work with the square first. $d^2 = (a-c)^2 + (b-d)^2$, and most contest questions ask for $d^2$ precisely so the radical never appears.'),
    guideline: 'Generate a reflection, midpoint or squared-distance question on small integer coordinates.',
    make: () => {
      const a = int(-9, 9), b = int(-9, 9);
      const mode = int(1, 4);
      if (mode === 1) {
        return { text: `The point $(${a}, ${b})$ is reflected across the line $y = x$ to the point $(h, k)$. Find $h - k$.`, answer: String(b - a) };
      }
      if (mode === 2) {
        return { text: `The point $(${a}, ${b})$ is reflected across the $x$-axis to the point $(h, k)$. Find $h + k$.`, answer: String(a - b) };
      }
      if (mode === 3) {
        const c = int(-9, 9), d = int(-9, 9);
        return { text: `The midpoint of $(${a}, ${b})$ and $(${c}, ${d})$ is $(h, k)$. Find $h + k$.`, answer: frac(a + b + c + d, 2) };
      }
      const c = int(-9, 9), d = int(-9, 9);
      return { text: `The distance between $(${a}, ${b})$ and $(${c}, ${d})$ is $k$. Find $k^2$.`, answer: String((a - c) ** 2 + (b - d) ** 2) };
    },
  },

  /* -------------------------------------------------- conics */
  {
    id: 's5.1.3', slug: 'conics-directrix-focus', title: 'Parabolas: Directrix, Focus and Vertex',
    tags: ['coordinate-geometry'],
    content:
      P('Write the parabola as $x = ay^2$ or $y = ax^2$. The focal distance is $p = \\frac{1}{4a}$.') +
      P('For $x = ay^2$ the parabola opens along the $x$-axis: the focus sits at $(p, 0)$ and the directrix is the line $x = -p$. For $y = ax^2$ it opens along the $y$-axis: focus $(0, p)$, directrix $y = -p$.') +
      P('So for $x = y^2$, $a = 1$ and $p = \\frac{1}{4}$, giving directrix $x = -\\frac{1}{4}$. The only real work is inverting $4a$.'),
    guideline: 'Generate a parabola in the form x = ay^2 or y = ax^2 and ask for the directrix or focus.',
    make: () => {
      const a = pick([1, 2, 3, 4, -1, -2, 1, 2]);
      const horiz = rnd() < 0.5;
      const askFocus = rnd() < 0.5;
      const v = frac(askFocus ? 1 : -1, 4 * a);
      const eqn = horiz ? `x = ${a === 1 ? '' : a === -1 ? '-' : a}y^2` : `y = ${a === 1 ? '' : a === -1 ? '-' : a}x^2`;
      const axis = horiz ? 'x' : 'y';
      return askFocus
        ? { text: `The focus of $${eqn}$ is at $(${horiz ? 'k, 0' : '0, k'})$. Find $k$.`, answer: v }
        : { text: `The directrix of $${eqn}$ is $${axis} = $ ______`, answer: v };
    },
  },

  /* -------------------------------------------------- vectors */
  {
    id: 's5.1.4', slug: 'vectors', title: 'Vectors: Components and Magnitude',
    tags: ['coordinate-geometry'],
    content:
      P('A vector from initial point $(a,b)$ to terminal point $(c,d)$ has components $\\langle c-a,\\; d-b \\rangle$ — terminal minus initial, in that order.') +
      P('Its magnitude is $|v| = \\sqrt{(c-a)^2 + (d-b)^2}$. Contest questions almost always ask for $|v|^2$ so the answer stays an integer.') +
      P('For a sum, add componentwise first and take the magnitude once; never take two square roots where one will do.'),
    guideline: 'Generate a vector magnitude-squared or component question from two integer points.',
    make: () => {
      const a = int(-8, 8), b = int(-8, 8), c = int(-8, 8), d = int(-8, 8);
      const dx = c - a, dy = d - b;
      if (rnd() < 0.5) {
        return { text: `The initial point of vector $v$ is $(${a}, ${b})$ and the terminal point is $(${c}, ${d})$. If $|v| = k$, then $k^2 = $ ______`, answer: String(dx * dx + dy * dy) };
      }
      return { text: `The initial point of vector $v$ is $(${a}, ${b})$ and the terminal point is $(${c}, ${d})$. If $v = \\langle h, k \\rangle$, find $h + k$.`, answer: String(dx + dy) };
    },
  },

  /* -------------------------------------------------- matrices */
  {
    id: 's5.1.5', slug: 'determinants', title: 'Determinants of 2x2 and 3x3 Matrices',
    tags: ['matrices'],
    content:
      P('For a $2 \\times 2$ matrix $\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$ the determinant is $ad - bc$: down-product minus up-product.') +
      P('For a $3 \\times 3$, expand along whichever row or column carries the most zeros. Along the top row, $|A| = a(ei - fh) - b(di - fg) + c(dh - eg)$ — note the alternating sign.') +
      P('If any row is a multiple of another, or a row is all zeros, the determinant is $0$ and there is nothing to compute. Check that first.'),
    guideline: 'Generate a 2x2 or 3x3 determinant with small integer entries.',
    make: () => {
      if (rnd() < 0.55) {
        const a = int(-9, 9), b = int(-9, 9), c = int(-9, 9), d = int(-9, 9);
        return { text: `If $A = \\begin{bmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{bmatrix}$, then $|A| = $ ______`, answer: String(a * d - b * c) };
      }
      const m = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => int(-5, 5)));
      const [[a, b, c], [d, e, f], [g, h, i]] = m;
      const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
      return {
        text: `If $A = \\begin{bmatrix} ${a} & ${b} & ${c} \\\\ ${d} & ${e} & ${f} \\\\ ${g} & ${h} & ${i} \\end{bmatrix}$, then $|A| = $ ______`,
        answer: String(det),
      };
    },
  },

  /* -------------------------------------------------- inverse trig */
  {
    id: 's5.1.6', slug: 'inverse-trig', title: 'Inverse Trigonometric Values',
    tags: ['trigonometry'],
    content:
      P('Inverse trig answers are angles, and contest papers ask for them as a multiple of $\\pi$: "$\\text{Arcsin}(x) = k\\pi$ radians, find $k$."') +
      P('Memorise the principal values. $\\text{Arcsin}$ returns angles in $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$; $\\text{Arccos}$ returns $[0, \\pi]$; $\\text{Arctan}$ returns $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$.') +
      P('For the reciprocal functions, convert first: $\\text{Arccsc}(x) = \\text{Arcsin}(1/x)$ and $\\text{Arcsec}(x) = \\text{Arccos}(1/x)$. So $\\text{Arccsc}(-2) = \\text{Arcsin}(-\\frac{1}{2}) = -\\frac{\\pi}{6}$, giving $k = -\\frac{1}{6}$.'),
    guideline: 'Generate an inverse trig value question answered as a multiple of pi.',
    make: () => {
      // [display argument, k such that answer = k*pi]
      const asin: Array<[string, string]> = [
        ['0', '0'], ['1', '1/2'], ['-1', '-1/2'],
        ['\\frac{1}{2}', '1/6'], ['-\\frac{1}{2}', '-1/6'],
        ['\\frac{\\sqrt{2}}{2}', '1/4'], ['-\\frac{\\sqrt{2}}{2}', '-1/4'],
        ['\\frac{\\sqrt{3}}{2}', '1/3'], ['-\\frac{\\sqrt{3}}{2}', '-1/3'],
      ];
      const acos: Array<[string, string]> = [
        ['1', '0'], ['0', '1/2'], ['-1', '1'],
        ['\\frac{1}{2}', '1/3'], ['-\\frac{1}{2}', '2/3'],
        ['\\frac{\\sqrt{2}}{2}', '1/4'], ['-\\frac{\\sqrt{2}}{2}', '3/4'],
        ['\\frac{\\sqrt{3}}{2}', '1/6'], ['-\\frac{\\sqrt{3}}{2}', '5/6'],
      ];
      const atan: Array<[string, string]> = [
        ['0', '0'], ['1', '1/4'], ['-1', '-1/4'],
        ['\\sqrt{3}', '1/3'], ['-\\sqrt{3}', '-1/3'],
        ['\\frac{\\sqrt{3}}{3}', '1/6'], ['-\\frac{\\sqrt{3}}{3}', '-1/6'],
      ];
      const acsc: Array<[string, string]> = [
        ['2', '1/6'], ['-2', '-1/6'], ['1', '1/2'], ['-1', '-1/2'],
        ['\\sqrt{2}', '1/4'], ['-\\sqrt{2}', '-1/4'],
      ];
      const which = int(1, 4);
      const [fn, table] =
        which === 1 ? ['Arcsin', asin] as const
          : which === 2 ? ['Arccos', acos] as const
            : which === 3 ? ['Arctan', atan] as const
              : ['Arccsc', acsc] as const;
      const [arg, k] = pick(table as Array<[string, string]>);
      return { text: `$\\text{${fn}}\\left(${arg}\\right) = k\\pi$ radians. Find $k$.`, answer: k };
    },
  },

  /* -------------------------------------------------- double integrals */
  {
    id: 's5.1.7', slug: 'double-integrals', title: 'Double Integrals over Rectangles',
    tags: ['calculus'],
    content:
      P('Over a rectangle with constant limits, a double integral of a separable integrand splits into a product of two ordinary integrals: $\\int_a^b \\int_c^d f(x)g(y)\\,dy\\,dx = \\left(\\int_a^b f(x)\\,dx\\right)\\left(\\int_c^d g(y)\\,dy\\right)$.') +
      P('So $\\int_0^1 \\int_1^2 xy\\,dy\\,dx = \\left(\\int_0^1 x\\,dx\\right)\\left(\\int_1^2 y\\,dy\\right) = \\frac{1}{2} \\cdot \\frac{3}{2} = \\frac{3}{4}$.') +
      P('Do the two single integrals mentally and multiply. Never expand the inner integral symbolically first — that is where the time goes.'),
    guideline: 'Generate a separable double integral over a rectangle with small integer limits.',
    make: () => {
      const m = int(1, 2), n = int(1, 2);
      const a = 0, b = int(1, 3), c = int(0, 2), d = c + int(1, 2);
      // integral of x^m from a..b  times  integral of y^n from c..d
      const ix = [b ** (m + 1) - a ** (m + 1), m + 1];
      const iy = [d ** (n + 1) - c ** (n + 1), n + 1];
      const num = ix[0] * iy[0], den = ix[1] * iy[1];
      const xs = m === 1 ? 'x' : `x^${m}`;
      const ys = n === 1 ? 'y' : `y^${n}`;
      return {
        text: `$\\int_{${a}}^{${b}} \\int_{${c}}^{${d}} ${xs}${ys}\\,dy\\,dx = $ ______`,
        answer: frac(num, den),
      };
    },
  },

  /* -------------------------------------------------- Texas units */
  {
    id: 's5.2.1', slug: 'texas-land-units', title: 'Texas Land Units: Varas and Leagues',
    tags: ['conversions'],
    content:
      P('Texas surveying units show up on every UIL paper, usually as a starred problem. Two constants carry all of them.') +
      P('A <strong>vara</strong> is $33\\frac{1}{3}$ inches, which is exactly $\\frac{25}{27}$ of a yard. So varas to yards is a multiplication by $\\frac{25}{27}$ — near enough to $0.926$ that you can estimate by subtracting about $7.4\\%$.') +
      P('A <strong>league of land</strong> is $4{,}428.4$ acres. A <strong>labor</strong> is $177.1$ acres, and a league is exactly $25$ labors.') +
      P('Because these are starred, you only need to land within $5\\%$ — round the constant aggressively and move on.'),
    guideline: 'Generate a Texas land-unit conversion; these are always approximate (starred).',
    make: () => {
      if (rnd() < 0.5) {
        const v = int(200, 90000);
        return { text: `${v.toLocaleString()} varas (Texas) = ______ yards`, answer: String(Math.round((v * 25) / 27)), kind: 'approximate' };
      }
      const whole = int(1, 12), n = int(1, 3), dd = pick([2, 4]);
      const leagues = whole + n / dd;
      return {
        text: `$${whole}\\frac{${n}}{${dd}}$ "leagues of land" in Texas is ______ acres`,
        answer: String(Math.round(leagues * 4428.4)),
        kind: 'approximate',
      };
    },
  },

  /* -------------------------------------------------- rate conversion */
  {
    id: 's5.2.2', slug: 'rate-conversions', title: 'Rate Conversions: ft/s, mph and km/h',
    tags: ['conversions'],
    content:
      P('The one factor worth memorising: $60$ mph is exactly $88$ ft/s. Everything follows from the ratio $\\frac{88}{60} = \\frac{22}{15}$.') +
      P('So mph $\\to$ ft/s multiplies by $\\frac{22}{15}$, and ft/s $\\to$ mph multiplies by $\\frac{15}{22}$. For example $440$ ft/s $\\times \\frac{15}{22} = 300$ mph.') +
      P('Look for multiples of $22$ in ft/s and multiples of $15$ in mph — the problems are built so one of them cancels cleanly.'),
    guideline: 'Generate an exact ft/s <-> mph conversion that divides evenly.',
    make: () => {
      if (rnd() < 0.5) {
        const mph = 15 * int(1, 20);
        return { text: `${mph} miles per hour = ______ feet per second`, answer: frac(mph * 22, 15) };
      }
      const fps = 22 * int(1, 30);
      return { text: `${fps} feet per second = ______ miles per hour`, answer: frac(fps * 15, 22) };
    },
  },

  /* -------------------------------------------------- totient */
  {
    id: 's5.2.3', slug: 'relatively-prime', title: 'Relatively Prime Counts and Euler’s Totient',
    tags: ['number-theory'],
    content:
      P("Euler's totient $\\phi(n)$ counts the positive integers less than $n$ that share no factor with $n$.") +
      P('For a prime $p$, every one of $1, 2, \\ldots, p-1$ qualifies, so $\\phi(p) = p - 1$. For a prime power, $\\phi(p^k) = p^k - p^{k-1}$.') +
      P('In general, factor $n$ and multiply: $\\phi(n) = n\\prod\\left(1 - \\frac{1}{p}\\right)$ over the distinct primes $p$ dividing $n$. So $\\phi(36) = 36 \\cdot \\frac{1}{2} \\cdot \\frac{2}{3} = 12$.') +
      P('Watch the wording: "greater than 1 and less than $n$" excludes $1$, so subtract one from $\\phi(n)$.'),
    guideline: 'Generate a totient or relatively-prime counting question.',
    make: () => {
      const n = int(10, 120);
      let count = 0;
      for (let k = 1; k < n; k++) if (gcd(k, n) === 1) count++;
      if (rnd() < 0.5) {
        return { text: `How many positive integers less than ${n} are relatively prime to ${n}?`, answer: String(count) };
      }
      let c2 = 0;
      for (let k = 2; k < n; k++) if (gcd(k, n) === 1) c2++;
      return { text: `How many integers greater than 1 and less than ${n} are relatively prime to ${n}?`, answer: String(c2) };
    },
  },

  /* -------------------------------------------------- dilation */
  {
    id: 's5.2.4', slug: 'dilation-scaling', title: 'Area and Perimeter under Dilation',
    tags: ['geometry'],
    content:
      P('Scale every length by $k$ and the consequences are fixed: perimeter scales by $k$, area by $k^2$, volume by $k^3$.') +
      P('A 4 by 8 inch picture enlarged to 12 by 24 inches has $k = 3$, so its perimeter triples and its area grows ninefold.') +
      P('The trap is answering with $k^2$ when the question asked about perimeter. Read which quantity is being scaled before computing anything.'),
    guideline: 'Generate a dilation question about perimeter, area or volume scaling.',
    make: () => {
      const w = int(2, 12), h = int(2, 12), k = int(2, 6);
      const which = int(1, 3);
      if (which === 1) {
        return { text: `A ${w} by ${h} inch picture is enlarged to ${w * k} by ${h * k} inches. Its perimeter is multiplied by ______`, answer: String(k) };
      }
      if (which === 2) {
        return { text: `A ${w} by ${h} inch picture is enlarged to ${w * k} by ${h * k} inches. Its area is multiplied by ______`, answer: String(k * k) };
      }
      return { text: `If every edge of a cube is multiplied by ${k}, its volume is multiplied by ______`, answer: String(k ** 3) };
    },
  },

  /* -------------------------------------------------- statistics */
  {
    id: 's5.2.5', slug: 'statistics-basics', title: 'Mean, Median, Mode and Range',
    tags: ['statistics'],
    content:
      P('Four quantities, four different operations. The <strong>mean</strong> is the total divided by the count; the <strong>median</strong> is the middle value once sorted (average the middle two if the count is even); the <strong>mode</strong> is the most frequent value; the <strong>range</strong> is largest minus smallest.') +
      P('Sort the list before touching median or range. Contest sets are deliberately given out of order and often contain a repeat you will miss if you do not.') +
      P('When a question combines them — "the range minus the mode" — compute each separately and subtract at the very end.'),
    guideline: 'Generate a question about mean, median, mode or range of a small integer set.',
    make: () => {
      const n = int(5, 9);
      const vals = Array.from({ length: n }, () => int(0, 9));
      vals[int(0, n - 1)] = vals[0]; // guarantee a mode
      const sorted = [...vals].sort((a, b) => a - b);
      const counts = new Map<number, number>();
      sorted.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
      let mode = sorted[0], best = 0;
      counts.forEach((c, v) => { if (c > best) { best = c; mode = v; } });
      const range = sorted[sorted.length - 1] - sorted[0];
      const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      const sum = vals.reduce((a, b) => a + b, 0);
      const set = `\\{${vals.join(', ')}\\}`;
      const which = int(1, 4);
      if (which === 1) return { text: `The range of the set $${set}$ minus its mode is ______`, answer: String(range - mode) };
      if (which === 2) return { text: `The median of the set $${set}$ is ______`, answer: frac(median * 2, 2) };
      if (which === 3) return { text: `The mean of the set $${set}$ is ______`, answer: frac(sum, n) };
      return { text: `The mode of the set $${set}$ is ______`, answer: String(mode) };
    },
  },

  /* -------------------------------------------------- counting */
  {
    id: 's5.2.6', slug: 'digit-counting', title: 'Counting Problems with Digits',
    tags: ['counting'],
    content:
      P('"How many 3-digit numbers have digits summing to $n$?" is a stars-and-bars count with a constraint: the leading digit cannot be zero and no digit exceeds 9.') +
      P('Substitute $a = a\' + 1$ so the leading digit starts at zero, then count solutions of $a\' + b + c = n - 1$ with each at most 9. Without the upper bound that is $\\binom{n+1}{2}$; subtract the cases where one variable exceeds 9.') +
      P('For small $n$ the bound never bites, so the answer is just $\\binom{n+1}{2}$.'),
    guideline: 'Generate a digit-sum counting question over 3-digit numbers.',
    make: () => {
      const s = int(1, 20);
      let count = 0;
      for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) { const c = s - a - b; if (c >= 0 && c <= 9) count++; }
      return { text: `The sum of the digits of a 3-digit number is ${s}. How many such numbers exist?`, answer: String(count) };
    },
  },
];

/* ---------- build ---------- */

const PER_TOPIC = 70;
const topics = JSON.parse(fs.readFileSync(SRC, 'utf8')) as MathTopic[];
const existing = new Set(topics.map((t) => t.id));

const added: MathTopic[] = [];
for (const g of GENERATORS) {
  if (existing.has(g.id)) continue;
  const seen = new Set<string>();
  const questions: Question[] = [];
  let guard = 0;
  while (questions.length < PER_TOPIC && guard++ < PER_TOPIC * 60) {
    const q = g.make();
    if (seen.has(q.text)) continue;
    if (!/^-?[\d./\s-]+$/.test(q.answer) && !/^[a-z]/i.test(q.answer)) continue;
    seen.add(q.text);
    questions.push({
      id: questions.length + 1,
      text: q.text,
      answer: q.answer,
      kind: q.kind ?? 'exact',
      tags: g.tags,
      ...(q.kind === 'approximate' ? { hasErrorRange: true } : {}),
    });
  }
  added.push({
    id: g.id,
    slug: g.slug,
    title: g.title,
    content: g.content,
    summary: g.content.replace(/<[^>]+>/g, ' ').replace(/\$[^$]*\$/g, '').replace(/\s+/g, ' ').trim().split(/(?<=\.)\s/)[0].slice(0, 160),
    generation_guideline: g.guideline,
    questions,
  });
}

fs.writeFileSync(SRC, JSON.stringify([...topics, ...added], null, 2) + '\n');
console.log('new topics:', added.length);
added.forEach((t) => console.log(' ', t.id.padEnd(8), String(t.questions.length).padStart(3), t.title));
console.log('total questions now:', [...topics, ...added].reduce((n, t) => n + t.questions.length, 0));
