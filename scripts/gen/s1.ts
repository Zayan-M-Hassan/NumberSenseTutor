import {
  Generator,
  comma,
  frac,
  gcd,
  mixed,
  tfrac,
  tmixed,
} from './helpers';

/** Section 1 — multiplication, division, addition and subtraction tricks. */
export const S1: Record<string, Generator> = {
  's1.1': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(11, 99);
      const b = r.int(11, 99);
      return { text: `Calculate $${a} \\times ${b}$.`, answer: String(a * b) };
    },
  },

  's1.2.1': {
    tags: ['arithmetic'],
    make: (r) => {
      const digits = r.pick([2, 3, 4]);
      const lo = Math.pow(10, digits - 1);
      const a = r.int(lo, lo * 10 - 1);
      return r.bool()
        ? { text: `Calculate $${a} \\times 11$.`, answer: String(a * 11) }
        : { text: `Calculate $11 \\times ${a}$.`, answer: String(a * 11) };
    },
  },

  's1.2.2': {
    tags: ['arithmetic'],
    make: (r) => {
      const mult = r.pick([101, 1001, 10101]);
      const a = mult === 101 ? r.int(100, 9999) : r.int(100, 999);
      return { text: `Calculate $${a} \\times ${mult}$.`, answer: String(a * mult) };
    },
  },

  's1.2.3': {
    tags: ['arithmetic'],
    make: (r) => {
      const k = r.int(3, 2500);
      if (r.bool()) {
        const a = k * 4;
        return { text: `Calculate $${a} \\times 25$.`, answer: String(a * 25) };
      }
      const a = k * 4;
      return { text: `Calculate $${a} \\div 25$.`, answer: frac(a, 25) };
    },
  },

  's1.2.5': {
    tags: ['arithmetic', 'fractions'],
    make: (r) => {
      // Numbers that are a clean fraction of 100 / 1000.
      const base = r.pick([100, 1000]);
      const [num, den] = r.pick([
        [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
        [1, 8], [3, 8], [5, 8], [7, 8], [1, 20], [1, 25], [1, 50],
      ]);
      const factor = (base * num) / den;
      if (!Number.isInteger(factor)) return null;
      const a = r.int(12, 999) * den;
      return { text: `Calculate $${a} \\times ${factor}$.`, answer: String(a * factor) };
    },
  },

  's1.2.6': {
    tags: ['arithmetic'],
    make: (r) => {
      const even = r.int(2, 99) * 2;
      const five = r.int(1, 39) * 10 + 5;
      return { text: `Calculate $${even} \\times ${five}$.`, answer: String(even * five) };
    },
  },

  's1.2.7': {
    tags: ['arithmetic'],
    make: (r) => {
      const centre = r.pick([100, 1000]);
      const span = centre === 100 ? 11 : 30;
      const a = centre + r.int(-span, span);
      const b = centre + r.int(-span, span);
      if (a === centre || b === centre) return null;
      return { text: `Calculate $${a} \\times ${b}$.`, answer: String(a * b) };
    },
  },

  's1.2.8': {
    tags: ['arithmetic'],
    make: (r) => {
      const n = r.int(1, 999) * 10 + 5;
      return r.bool()
        ? { text: `Calculate $${n}^2$.`, answer: String(n * n) }
        : { text: `Calculate $${n} \\times ${n}$.`, answer: String(n * n) };
    },
  },

  's1.2.9': {
    tags: ['arithmetic'],
    make: (r) => {
      const centre = r.int(1, 40) * 50;
      const n = centre + r.int(-9, 9);
      if (n === centre) return null;
      return r.bool()
        ? { text: `Calculate $${n}^2$.`, answer: String(n * n) }
        : { text: `Calculate $${n} \\times ${n}$.`, answer: String(n * n) };
    },
  },

  's1.2.10': {
    tags: ['arithmetic'],
    make: (r) => {
      const centre = r.int(3, 400) * 10;
      const d = r.int(1, 19);
      return {
        text: `Calculate $${centre - d} \\times ${centre + d}$.`,
        answer: String(centre * centre - d * d),
      };
    },
  },

  's1.2.11': {
    tags: ['arithmetic'],
    make: (r) => {
      if (r.bool(0.25)) {
        const t = r.int(1, 9);
        const u = r.int(1, 9);
        if (t === u) return null;
        return {
          text: `Calculate $${10 * t + u} \\times ${10 * u + t}$.`,
          answer: String((10 * t + u) * (10 * u + t)),
        };
      }
      if (r.bool(0.45)) {
        const h = r.int(1, 9);
        const m = r.int(0, 9);
        const u = r.int(1, 9);
        if (h === u) return null;
        return {
          text: `Calculate $${100 * h + 10 * m + u} \\times ${100 * u + 10 * m + h}$.`,
          answer: String((100 * h + 10 * m + u) * (100 * u + 10 * m + h)),
        };
      }
      const d1 = r.int(1, 9);
      const d2 = r.int(0, 9);
      const d3 = r.int(0, 9);
      const d4 = r.int(1, 9);
      const a = 1000 * d1 + 100 * d2 + 10 * d3 + d4;
      const b = 1000 * d4 + 100 * d3 + 10 * d2 + d1;
      if (a === b) return null;
      return { text: `Calculate $${a} \\times ${b}$.`, answer: String(a * b) };
    },
  },

  's1.3.1': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(101, 999);
      const b = r.int(101, 999);
      return { text: `Calculate $${a} \\times ${b}$.`, answer: String(a * b) };
    },
  },

  's1.3.2': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(3, 99);
      const b = r.int(2, 99);
      const c = r.int(2, 99);
      if (r.bool()) {
        return {
          text: `Calculate $${a} \\times ${b} + ${a} \\times ${c}$.`,
          answer: String(a * b + a * c),
        };
      }
      return {
        text: `Calculate $${a} \\times ${b} - ${a} \\times ${c}$.`,
        answer: String(a * b - a * c),
      };
    },
  },

  's1.3.3': {
    tags: ['arithmetic'],
    make: (r) => {
      const n = r.int(2, 2000);
      return {
        text: `Calculate $${n}^2 + ${n + 1}^2$.`,
        answer: String(n * n + (n + 1) * (n + 1)),
      };
    },
  },

  's1.3.4': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(5, 60);
      const b = r.int(1, a - 1);
      return {
        text: `Calculate $(${a}+${b})^2 + (${a}^2 - ${b}^2)$.`,
        answer: String((a + b) * (a + b) + (a * a - b * b)),
      };
    },
  },

  's1.3.5': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(6, 900);
      const b = a + r.pick([1, 2, 3]);
      return { text: `Calculate $${a}^2 + ${b}^2$.`, answer: String(a * a + b * b) };
    },
  },

  's1.3.6': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(12, 199);
      const b = r.int(2, a - 1);
      return { text: `Calculate $${a}^2 - ${b}^2$.`, answer: String(a * a - b * b) };
    },
  },

  's1.3.7': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(1, 99) * 10 + 5;
      const b = r.int(1, 99) * 10 + 5;
      return { text: `Calculate $${a} \\times ${b}$.`, answer: String(a * b) };
    },
  },

  's1.3.8': {
    tags: ['fractions'],
    make: (r) => {
      const d = r.pick([3, 4, 5, 6, 7, 8, 9, 11]);
      const n1 = r.int(1, d - 1);
      const n2 = d - n1;
      const w1 = r.int(2, 30);
      const w2 = r.int(2, 30);
      const p1 = w1 * d + n1;
      const p2 = w2 * d + n2;
      const num = p1 * p2;
      const den = d * d;
      return {
        text: `Calculate $${tmixed(w1, n1, d)} \\times ${tmixed(w2, n2, d)}$. (mixed number)`,
        answer: mixed(num, den),
        requiredForm: 'mixed',
      };
    },
  },

  's1.3.9': {
    tags: ['fractions'],
    make: (r) => {
      const b = r.int(2, 24);
      const a = r.int(3, 220) * b;
      return {
        text: `Calculate $${a} \\times ${tfrac(a, b)}$.`,
        answer: frac(a * a, b),
      };
    },
  },

  's1.3.10': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(120, 9999);
      const b = r.int(11, 99);
      return {
        text: `*Approximate $${a} \\times ${b}$.`,
        answer: String(a * b),
        kind: 'approximate',
      };
    },
  },

  's1.4.1': {
    tags: ['remainders'],
    make: (r) => {
      const d = r.pick([4, 8, 16, 32]);
      const n = r.int(1000, 999999);
      return { text: `$${comma(n)} \\div ${d}$ has a remainder of ______`, answer: String(n % d) };
    },
  },

  's1.4.2': {
    tags: ['remainders'],
    make: (r) => {
      const d = r.pick([3, 9]);
      const n = r.int(1000, 999999);
      return { text: `$${comma(n)} \\div ${d}$ has a remainder of ______`, answer: String(n % d) };
    },
  },

  's1.4.3': {
    tags: ['remainders'],
    make: (r) => {
      const n = r.int(1000, 999999);
      return { text: `$${comma(n)} \\div 11$ has a remainder of ______`, answer: String(n % 11) };
    },
  },

  's1.4.4': {
    tags: ['remainders'],
    make: (r) => {
      const d = r.pick([6, 12, 14, 15, 18, 21, 22, 24, 33, 36, 44, 45]);
      const n = r.int(1000, 999999);
      return { text: `$${comma(n)} \\div ${d}$ has a remainder of ______`, answer: String(n % d) };
    },
  },

  's1.4.5': {
    tags: ['remainders'],
    make: (r) => {
      const a = r.int(11, 99);
      const b = r.int(11, 99);
      const c = r.int(2, 99);
      const d = r.pick([3, 4, 6, 7, 8, 9, 11, 12, 13]);
      const v = a * b - c;
      return {
        text: `$[${a} \\times ${b} - ${c}] \\div ${d}$ has a remainder of ______`,
        answer: String(((v % d) + d) % d),
      };
    },
  },

  's1.4.6': {
    tags: ['remainders'],
    make: (r) => {
      const n = r.int(100, 99999);
      return {
        text: `$${comma(n)} \\div 9$ has a remainder of ______`,
        answer: String(n % 9),
      };
    },
  },

  's1.4.7': {
    tags: ['fractions'],
    make: (r) => {
      const den = r.pick([40, 80, 160, 20, 200, 400, 320, 500, 800, 1600, 25, 50, 125, 250]);
      const num = r.int(1, den - 1);
      if (gcd(num, den) !== 1) return null;
      return {
        text: `Convert $${tfrac(num, den)}$ to a decimal. (decimal)`,
        answer: String(num / den),
        requiredForm: 'decimal',
      };
    },
  },

  's1.5.1': {
    tags: ['arithmetic'],
    make: (r) => {
      if (r.bool(0.4)) {
        const h = r.int(1, 9);
        const t = r.int(0, 9);
        const u = r.int(1, 9);
        if (h === u) return null;
        const a = 100 * h + 10 * t + u;
        const b = 100 * u + 10 * t + h;
        return { text: `Calculate $${a} - ${b}$.`, answer: String(a - b) };
      }
      const d1 = r.int(1, 9);
      const d2 = r.int(0, 9);
      const d3 = r.int(0, 9);
      const d4 = r.int(1, 9);
      const a = 1000 * d1 + 100 * d2 + 10 * d3 + d4;
      const b = 1000 * d4 + 100 * d3 + 10 * d2 + d1;
      if (a === b) return null;
      return { text: `Calculate $${a} - ${b}$.`, answer: String(a - b) };
    },
  },

  's1.5.2': {
    tags: ['fractions'],
    make: (r) => {
      const d = r.pick([3, 4, 5, 6, 7, 8, 9]);
      const w1 = r.int(2, 40);
      const w2 = w1 + r.int(1, 20);
      const n1 = r.int(1, d - 1);
      const n2 = r.int(1, d - 1);
      const p1 = w1 * d + n1;
      const p2 = w2 * d + n2;
      return {
        text: `Calculate $${tmixed(w1, n1, d)} - ${tmixed(w2, n2, d)}$.`,
        answer: mixed(p1 - p2, d),
      };
    },
  },

  's1.5.3': {
    tags: ['fractions'],
    make: (r) => {
      // 1/(k(k+1)) + ... telescoping series
      const start = r.int(1, 140);
      const terms = r.int(2, 12);
      let num = 0;
      let den = 1;
      const parts: string[] = [];
      for (let i = 0; i < terms; i++) {
        const k = start + i;
        parts.push(tfrac(1, k * (k + 1)));
        const nd = den * (k * (k + 1));
        num = num * (k * (k + 1)) + den;
        den = nd;
        const g = gcd(num, den);
        num /= g;
        den /= g;
      }
      return { text: `Calculate $${parts.join(' + ')}$.`, answer: frac(num, den) };
    },
  },

  's1.5.4': {
    tags: ['fractions'],
    make: (r) => {
      const a = r.int(2, 95);
      const b = r.int(2, 95);
      if (a === b || gcd(a, b) !== 1) return null;
      return {
        text: `Calculate $${tfrac(a, b)} + ${tfrac(b, a)}$. (mixed number)`,
        answer: mixed(a * a + b * b, a * b),
        requiredForm: 'mixed',
      };
    },
  },

  's1.5.5': {
    tags: ['fractions'],
    make: (r) => {
      const a = r.int(1, 20);
      const b = r.int(a + 1, 30);
      const n = r.int(2, 9);
      const num2 = n * a - 1;
      const den2 = n * b + 1;
      return {
        text: `Calculate $${tfrac(a, b)} - ${tfrac(num2, den2)}$.`,
        answer: frac(a * den2 - num2 * b, b * den2),
      };
    },
  },
};
