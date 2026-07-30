/**
 * Independent verification of the generated question sets.
 *
 * The generator computes each answer, so this suite deliberately does NOT
 * reuse the generator: it re-derives the answer by parsing the question text
 * back out and computing it a second way. A text/answer mismatch — the failure
 * mode that made a fifth of the original bank unwinnable — shows up here.
 */
import { describe, expect, it } from 'vitest';
import { parseAnswer } from './answer';
import data from '@/data/math-topics.json';
import type { MathTopic } from './types';

const topics = data as unknown as MathTopic[];
const byId = (id: string) => topics.find((t) => t.id === id)!;

const value = (a: string) => {
  const p = parseAnswer(a);
  if (p.kind !== 'numeric') throw new Error(`not numeric: ${a}`);
  return p.value;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

describe('generated topics exist and are non-empty', () => {
  const ids = ['s5.1.1', 's5.1.2', 's5.1.3', 's5.1.4', 's5.1.5', 's5.1.6', 's5.1.7', 's5.2.1', 's5.2.2', 's5.2.3', 's5.2.4', 's5.2.5', 's5.2.6'];
  it.each(ids)('%s has questions', (id) => {
    const t = byId(id);
    expect(t).toBeDefined();
    expect(t.questions.length).toBeGreaterThan(15);
  });

  it('every generated answer parses', () => {
    const bad: string[] = [];
    for (const id of ids)
      for (const q of byId(id).questions)
        if (parseAnswer(q.answer).kind === 'unknown') bad.push(`${id}: ${q.answer}`);
    expect(bad).toEqual([]);
  });

  it('no duplicate question text within a topic', () => {
    for (const id of ids) {
      const texts = byId(id).questions.map((q) => q.text);
      expect(new Set(texts).size).toBe(texts.length);
    }
  });
});

describe('s5.1.5 determinants recompute from the matrix in the question', () => {
  it('every 2x2 determinant is ad - bc', () => {
    for (const q of byId('s5.1.5').questions) {
      const m = q.text.match(/bmatrix\} (-?\d+) & (-?\d+) \\\\ (-?\d+) & (-?\d+) \\end/);
      if (!m) continue;
      const [a, b, c, d] = m.slice(1).map(Number);
      expect(value(q.answer)).toBe(a * d - b * c);
    }
  });

  it('every 3x3 determinant matches cofactor expansion', () => {
    for (const q of byId('s5.1.5').questions) {
      const m = q.text.match(
        /bmatrix\} (-?\d+) & (-?\d+) & (-?\d+) \\\\ (-?\d+) & (-?\d+) & (-?\d+) \\\\ (-?\d+) & (-?\d+) & (-?\d+) \\end/
      );
      if (!m) continue;
      const [a, b, c, d, e, f, g, h, i] = m.slice(1).map(Number);
      expect(value(q.answer)).toBe(a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
    }
  });
});

describe('s5.1.4 vector magnitudes recompute from the endpoints', () => {
  it('k^2 equals the squared distance', () => {
    for (const q of byId('s5.1.4').questions) {
      const m = q.text.match(/is \((-?\d+), (-?\d+)\).*?is \((-?\d+), (-?\d+)\)/);
      if (!m) continue;
      const [a, b, c, d] = m.slice(1).map(Number);
      const expected = q.text.includes('k^2') ? (c - a) ** 2 + (d - b) ** 2 : c - a + (d - b);
      expect(value(q.answer)).toBe(expected);
    }
  });
});

describe('s5.2.3 totient counts recompute by brute force', () => {
  it('matches a direct gcd count', () => {
    for (const q of byId('s5.2.3').questions) {
      const m = q.text.match(/less than (\d+) are relatively prime to (\d+)/);
      if (!m) continue;
      const n = Number(m[1]);
      const from = /greater than 1/.test(q.text) ? 2 : 1;
      let count = 0;
      for (let k = from; k < n; k++) if (gcd(k, n) === 1) count++;
      expect(value(q.answer)).toBe(count);
    }
  });
});

describe('s5.2.2 rate conversions use the exact 22/15 ratio', () => {
  it('60 mph is 88 ft/s, and every question follows that ratio', () => {
    for (const q of byId('s5.2.2').questions) {
      const toFps = q.text.match(/^(\d+) miles per hour/);
      if (toFps) {
        expect(value(q.answer)).toBeCloseTo((Number(toFps[1]) * 22) / 15, 9);
        continue;
      }
      const toMph = q.text.match(/^(\d+) feet per second/);
      if (toMph) expect(value(q.answer)).toBeCloseTo((Number(toMph[1]) * 15) / 22, 9);
    }
  });
});

describe('s5.2.1 Texas units match the constants from the real answer keys', () => {
  it('varas convert at exactly 25/27 yards', () => {
    for (const q of byId('s5.2.1').questions) {
      const m = q.text.match(/^([\d,]+) varas/);
      if (!m) continue;
      const varas = Number(m[1].replace(/,/g, ''));
      expect(value(q.answer)).toBe(Math.round((varas * 25) / 27));
    }
  });

  it('leagues convert at 4,428.4 acres', () => {
    for (const q of byId('s5.2.1').questions) {
      const m = q.text.match(/\$(\d+)\\frac\{(\d+)\}\{(\d+)\}\$ "leagues/);
      if (!m) continue;
      const [w, n, d] = m.slice(1).map(Number);
      expect(value(q.answer)).toBe(Math.round((w + n / d) * 4428.4));
    }
  });

  it('are all starred, as they are on real papers', () => {
    for (const q of byId('s5.2.1').questions) expect(q.kind).toBe('approximate');
  });
});

describe('s5.2.4 dilation scaling', () => {
  it('perimeter scales by k and area by k squared', () => {
    for (const q of byId('s5.2.4').questions) {
      const m = q.text.match(/A (\d+) by (\d+) inch picture is enlarged to (\d+) by (\d+)/);
      if (!m) continue;
      const [w, , W] = m.slice(1).map(Number);
      const k = W / w;
      expect(value(q.answer)).toBe(/perimeter/.test(q.text) ? k : k * k);
    }
  });
});

describe('s5.2.6 digit-sum counts recompute by enumeration', () => {
  it('matches a brute-force count of 3-digit numbers', () => {
    for (const q of byId('s5.2.6').questions) {
      const m = q.text.match(/digits of a 3-digit number is (\d+)/);
      if (!m) continue;
      const s = Number(m[1]);
      let count = 0;
      for (let a = 1; a <= 9; a++)
        for (let b = 0; b <= 9; b++) {
          const c = s - a - b;
          if (c >= 0 && c <= 9) count++;
        }
      expect(value(q.answer)).toBe(count);
    }
  });
});

describe('s5.1.7 double integrals over rectangles', () => {
  it('equals the product of the two single integrals', () => {
    for (const q of byId('s5.1.7').questions) {
      const m = q.text.match(
        /\\int_\{(\d+)\}\^\{(\d+)\} \\int_\{(\d+)\}\^\{(\d+)\} (x(?:\^\d)?)(y(?:\^\d)?)/
      );
      if (!m) continue;
      const [a, b, c, d] = m.slice(1, 5).map(Number);
      const mPow = m[5].includes('^') ? Number(m[5].split('^')[1]) : 1;
      const nPow = m[6].includes('^') ? Number(m[6].split('^')[1]) : 1;
      const ix = (b ** (mPow + 1) - a ** (mPow + 1)) / (mPow + 1);
      const iy = (d ** (nPow + 1) - c ** (nPow + 1)) / (nPow + 1);
      expect(value(q.answer)).toBeCloseTo(ix * iy, 9);
    }
  });
});

describe('s5.1.3 parabola directrix and focus', () => {
  it('uses p = 1/(4a)', () => {
    for (const q of byId('s5.1.3').questions) {
      const m = q.text.match(/([xy]) = (-?\d*)([xy])\^2/);
      if (!m) continue;
      const a = m[2] === '' ? 1 : m[2] === '-' ? -1 : Number(m[2]);
      const p = 1 / (4 * a);
      expect(value(q.answer)).toBeCloseTo(/focus/.test(q.text) ? p : -p, 9);
    }
  });
});

describe('s5.1.1 systems of equations satisfy both equations', () => {
  it('the stated solution actually solves the system', () => {
    for (const q of byId('s5.1.1').questions) {
      const m = q.text.match(
        /\$(\d+)x \+ (\d+)y = (-?\d+)\$ and \$(\d+)x - (\d+)y = (-?\d+)\$\. Find \$([xy])\$/
      );
      if (!m) continue;
      const [a, b, c, d, b2, e] = m.slice(1, 7).map(Number);
      const which = m[7];
      // Solve independently: add the equations to eliminate y.
      const x = (c + e) / (a + d);
      const y = (c - a * x) / b;
      expect(b).toBe(b2);
      expect(value(q.answer)).toBeCloseTo(which === 'x' ? x : y, 9);
    }
  });
});
