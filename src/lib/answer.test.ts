import { describe, expect, it } from 'vitest';
import {
  approximateRange,
  gradeAnswer,
  parseAnswer,
  parseInput,
  terminates,
} from './answer';
import { loadBank } from './test-bank';
import type { MathTopic } from './types';

const exact = { kind: 'exact' } as const;
const approx = { kind: 'approximate' } as const;

describe('parseAnswer', () => {
  const cases: Array<[string, number]> = [
    ['1225', 1225],
    ['-3.5', -3.5],
    ['2,454', 2454],
    ['3/4', 0.75],
    ['-19/24', -19 / 24],
    ['35 1/16', 35.0625],
    ['245 1/121', 245 + 1 / 121],
    ['-2 3/4', -2.75],
    ['85.6%', 0.856],
    ['$15.15', 15.15],
    ['.75', 0.75],
  ];
  it.each(cases)('parses %s', (raw, value) => {
    const p = parseAnswer(raw);
    expect(p.kind).toBe('numeric');
    if (p.kind === 'numeric') expect(p.value).toBeCloseTo(value, 9);
  });

  it('parses categorical answers', () => {
    expect(parseAnswer('Perfect')).toMatchObject({ kind: 'categorical', value: 'perfect' });
    expect(parseAnswer('Yes')).toMatchObject({ kind: 'categorical', value: 'yes' });
  });

  it('parses infinity with sign', () => {
    expect(parseAnswer('infinity')).toMatchObject({ kind: 'infinite', sign: 1 });
    expect(parseAnswer('-infinity')).toMatchObject({ kind: 'infinite', sign: -1 });
  });

  it('parses symbolic constants as irrational', () => {
    const pi = parseAnswer('-pi');
    expect(pi.kind).toBe('numeric');
    if (pi.kind === 'numeric') {
      expect(pi.value).toBeCloseTo(-Math.PI, 9);
      expect(pi.irrational).toBe(true);
    }
    const r = parseAnswer('√2');
    if (r.kind === 'numeric') expect(r.value).toBeCloseTo(Math.SQRT2, 9);
  });
});

describe('terminates', () => {
  it('knows which denominators give finite decimals', () => {
    expect(terminates(4)).toBe(true);
    expect(terminates(8)).toBe(true);
    expect(terminates(20)).toBe(true);
    expect(terminates(3)).toBe(false);
    expect(terminates(6)).toBe(false);
    expect(terminates(11)).toBe(false);
  });
});

describe('grading: equivalent forms are accepted', () => {
  // Real UIL answer keys list these side by side, e.g. "(35) 4/3, 1 1/3".
  it('accepts every listed form of 4/3', () => {
    for (const input of ['4/3', '1 1/3']) {
      expect(gradeAnswer(input, '4/3', exact).correct).toBe(true);
    }
  });

  it('accepts 3.5, 7/2 and 3 1/2 for the same answer', () => {
    for (const input of ['3.5', '7/2', '3 1/2']) {
      expect(gradeAnswer(input, '7/2', exact).correct).toBe(true);
    }
  });

  it('accepts .75 and 3/4 interchangeably', () => {
    expect(gradeAnswer('.75', '3/4', exact).correct).toBe(true);
    expect(gradeAnswer('3/4', '.75', exact).correct).toBe(true);
  });

  it('accepts the mixed-number answers that used to be unwinnable', () => {
    // s1.3.8: 4 1/4 x 8 1/4 = 35 1/16 — every one of these was NaN before.
    for (const input of ['35 1/16', '35.0625', '561/16']) {
      expect(gradeAnswer(input, '35 1/16', exact).correct).toBe(true);
    }
  });

  it('handles negative mixed numbers', () => {
    for (const input of ['-1.5625', '-25/16', '-1 9/16']) {
      expect(gradeAnswer(input, '-25/16', exact).correct).toBe(true);
    }
  });

  it('ignores commas and currency symbols', () => {
    expect(gradeAnswer('2,454', '2454', exact).correct).toBe(true);
    expect(gradeAnswer('$15.15', '15.15', exact).correct).toBe(true);
  });
});

describe('grading: repeating decimals are rejected', () => {
  // Official answer key note: "If an answer is of the type like 2/3 it cannot
  // be written as a repeating decimal."
  it('rejects decimal approximations of 2/3', () => {
    for (const input of ['0.666', '0.667', '.6666666667']) {
      const r = gradeAnswer(input, '2/3', exact);
      expect(r.correct).toBe(false);
      expect(r.reason).toBe('repeating-decimal');
    }
  });

  it('still accepts the fraction itself', () => {
    expect(gradeAnswer('2/3', '2/3', exact).correct).toBe(true);
    expect(gradeAnswer('4/6', '2/3', exact).correct).toBe(true);
  });

  it('accepts decimals when the fraction terminates', () => {
    expect(gradeAnswer('0.75', '3/4', exact).correct).toBe(true);
    expect(gradeAnswer('0.0625', '1/16', exact).correct).toBe(true);
  });

  it('rejects decimal approximations of irrational answers', () => {
    expect(gradeAnswer('1.414', '√2', exact).correct).toBe(false);
    expect(gradeAnswer('√2', '√2', exact).correct).toBe(true);
  });
});

describe('grading: starred (approximate) questions', () => {
  it('accepts any integer within 5%', () => {
    // Mirrors the real key "*(20) 450 - 496" for an exact value near 473.
    expect(gradeAnswer('460', '473', approx).correct).toBe(true);
    expect(gradeAnswer('473', '473', approx).correct).toBe(true);
    expect(gradeAnswer('496', '473', approx).correct).toBe(true);
    expect(gradeAnswer('400', '473', approx).correct).toBe(false);
  });

  it('requires the answer to be integral', () => {
    const r = gradeAnswer('473.5', '473', approx);
    expect(r.correct).toBe(false);
    expect(r.reason).toBe('not-integral');
  });

  it('computes the accepted range the way the answer key prints it', () => {
    expect(approximateRange(473)).toEqual({ lo: 450, hi: 496 });
  });

  it('works for negative values (the old formula inverted the test)', () => {
    expect(gradeAnswer('-98', '-100', approx).correct).toBe(true);
    expect(gradeAnswer('-100', '-100', approx).correct).toBe(true);
    expect(gradeAnswer('-80', '-100', approx).correct).toBe(false);
  });
});

describe('grading: categorical answers', () => {
  it('accepts case-insensitive word answers', () => {
    const opts = { kind: 'categorical' } as const;
    expect(gradeAnswer('perfect', 'Perfect', opts).correct).toBe(true);
    expect(gradeAnswer('Perfect', 'Perfect', opts).correct).toBe(true);
    expect(gradeAnswer('  DEFICIENT ', 'Deficient', opts).correct).toBe(true);
    expect(gradeAnswer('abundant', 'Perfect', opts).correct).toBe(false);
  });

  it('accepts aliases for infinity', () => {
    for (const input of ['infinity', 'inf', '∞']) {
      expect(gradeAnswer(input, 'infinity', exact).correct).toBe(true);
    }
    expect(gradeAnswer('-infinity', 'infinity', exact).correct).toBe(false);
  });

  it('accepts yes/no answers', () => {
    const opts = { kind: 'categorical' } as const;
    expect(gradeAnswer('yes', 'Yes', opts).correct).toBe(true);
    expect(gradeAnswer('no', 'Yes', opts).correct).toBe(false);
  });
});

describe('grading: required form', () => {
  it('rejects a decimal when the question demands a fraction', () => {
    const r = gradeAnswer('0.75', '3/4', { kind: 'exact', requiredForm: 'fraction' });
    expect(r.correct).toBe(false);
    expect(r.reason).toBe('wrong-form');
  });

  it('accepts the demanded form', () => {
    expect(
      gradeAnswer('3/4', '3/4', { kind: 'exact', requiredForm: 'fraction' }).correct
    ).toBe(true);
    expect(
      gradeAnswer('35 1/16', '35 1/16', { kind: 'exact', requiredForm: 'mixed' }).correct
    ).toBe(true);
  });
});

describe('regression: the exact bug that made 1,967 questions unwinnable', () => {
  it('never reports NaN as the expected answer', () => {
    for (const a of ['3/4', '35 1/16', 'infinity', 'Perfect', '85.6%', '√2', '-pi']) {
      const r = gradeAnswer('0', a, exact);
      expect(r.expected).not.toMatch(/NaN/);
    }
  });
});

describe('whole-bank guard', () => {
  const data = loadBank();
  const answers = data.flatMap((t) => t.questions.map((q) => String(q.answer)));

  it('parses every answer in the question bank', () => {
    const unknown = answers.filter((a) => parseAnswer(a).kind === 'unknown');
    if (unknown.length) {
      // Surface a sample so failures are actionable.
      console.error('unparseable answers:', unknown.slice(0, 20));
    }
    expect(unknown).toHaveLength(0);
  });

  it('grades every answer as correct when fed back its own value', () => {
    const failures: string[] = [];
    for (const a of answers) {
      const p = parseAnswer(a);
      if (p.kind === 'unknown') continue;
      const kind = 'exact' as const;
      if (!gradeAnswer(a, a, { kind }).correct) failures.push(a);
    }
    if (failures.length) console.error('self-grade failures:', failures.slice(0, 20));
    expect(failures).toHaveLength(0);
  });
});
