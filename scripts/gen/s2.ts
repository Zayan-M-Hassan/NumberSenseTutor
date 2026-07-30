import {
  Generator,
  divisors,
  frac,
  gcd,
  nCk,
  nPk,
  toRoman,
  tfrac,
  totient,
} from './helpers';

/** Section 2 — memorisation: important numbers and formulas. */
export const S2: Record<string, Generator> = {
  's2.1.1': {
    tags: ['arithmetic', 'number-theory'],
    make: (r) => {
      const n = r.int(11, 120);
      const mode = r.int(1, 3);
      if (mode === 1) return { text: `Calculate $${n}^2$.`, answer: String(n * n) };
      if (mode === 2) return { text: `$\\sqrt{${n * n}} = $ ______`, answer: String(n) };
      const m = n + r.int(1, 9);
      return { text: `Calculate $${m}^2 - ${n}^2$.`, answer: String(m * m - n * n) };
    },
  },

  's2.1.2': {
    tags: ['arithmetic', 'number-theory'],
    make: (r) => {
      const n = r.int(2, 320);
      const mode = r.int(1, 5);
      if (mode === 1) return { text: `Calculate $${n}^3$.`, answer: String(n ** 3) };
      if (mode === 2) return { text: `$\\sqrt[3]{${n ** 3}} = $ ______`, answer: String(n) };
      if (mode === 3) return { text: `Calculate $${n}^3 + ${n}^2$.`, answer: String(n ** 3 + n * n) };
      if (mode === 4) return { text: `Calculate $${n}^3 - ${n}$.`, answer: String(n ** 3 - n) };
      return { text: `Calculate $${n + 1}^3 - ${n}^3$.`, answer: String((n + 1) ** 3 - n ** 3) };
    },
  },

  's2.1.3': {
    tags: ['logs-exponents'],
    make: (r) => {
      const base = r.int(2, 40);
      const maxE =
        base === 2 ? 40 : base === 3 ? 25 : base < 6 ? 20 : base < 10 ? 15 : base < 16 ? 12 : base < 26 ? 10 : 8;
      const e = r.int(2, maxE);
      const mode = r.int(1, 5);
      if (mode === 1) return { text: `Calculate $${base}^{${e}}$.`, answer: String(base ** e) };
      if (mode === 2)
        return { text: `If $${base}^{x} = ${base ** e}$, then $x = $ ______`, answer: String(e) };
      if (mode === 3)
        return {
          text: `Calculate $${base}^{${e}} - ${base}^{${e - 1}}$.`,
          answer: String(base ** e - base ** (e - 1)),
        };
      if (mode === 4)
        return {
          text: `Calculate $${base}^{${e}} + ${base}^{${e - 1}}$.`,
          answer: String(base ** e + base ** (e - 1)),
        };
      return {
        text: `Calculate $${base}^{${e}} \\div ${base}^{${e - 1}}$.`,
        answer: String(base),
      };
    },
  },

  's2.1.4': {
    tags: ['fractions'],
    make: (r) => {
      const den = r.pick([3, 6, 7, 8, 9, 11, 12, 13, 16, 32, 64]);
      const num = r.int(1, den * 3);
      if (gcd(num, den) !== 1) return null;
      if (r.bool()) {
        return {
          text: `Convert $${tfrac(num, den)}$ to a percent.`,
          answer: `${frac(num * 100, den)}%`,
        };
      }
      const k = r.int(2, 20);
      return {
        text: `$${tfrac(num, den)} \\times ${den * k} = $ ______`,
        answer: String(num * k),
      };
    },
  },

  's2.1.5': {
    tags: ['arithmetic', 'number-theory'],
    make: (r) => {
      const special = r.pick([99, 999, 9999, 1001, 10101, 111, 1111, 101]);
      const a = r.int(11, 999);
      return { text: `Calculate $${a} \\times ${special}$.`, answer: String(a * special) };
    },
  },

  's2.1.6': {
    tags: ['number-theory'],
    make: (r) => {
      const mode = r.int(1, 3);
      const n = r.int(1, 3999);
      if (mode === 1) {
        return { text: `${toRoman(n)} = ______ (Arabic Numeral)`, answer: String(n) };
      }
      if (mode === 2) {
        const b = r.int(1, 1500);
        return {
          text: `${toRoman(n)} + ${toRoman(b)} = ______ (Arabic Numeral)`,
          answer: String(n + b),
        };
      }
      const b = r.int(1, n);
      return {
        text: `${toRoman(n)} - ${toRoman(b)} = ______ (Arabic Numeral)`,
        answer: String(n - b),
      };
    },
  },

  's2.1.7': {
    tags: ['geometry'],
    make: (r) => {
      const solids = [
        { name: 'tetrahedron', f: 4, v: 4, e: 6 },
        { name: 'cube', f: 6, v: 8, e: 12 },
        { name: 'octahedron', f: 8, v: 6, e: 12 },
        { name: 'dodecahedron', f: 12, v: 20, e: 30 },
        { name: 'icosahedron', f: 20, v: 12, e: 30 },
      ];
      const s = r.pick(solids);
      const combos: Array<[string, number]> = [
        ['the number of faces', s.f],
        ['the number of vertices', s.v],
        ['the number of edges', s.e],
        ['faces plus vertices', s.f + s.v],
        ['faces plus vertices minus edges', s.f + s.v - s.e],
        ['edges minus faces', s.e - s.f],
        ['edges minus vertices', s.e - s.v],
        ['the product of faces and vertices', s.f * s.v],
        ['twice the edges minus the faces', 2 * s.e - s.f],
        ['the sum of faces, vertices and edges', s.f + s.v + s.e],
      ];
      const [label, value] = r.pick(combos);
      const k = r.int(1, 26);
      if (k > 1) {
        return {
          text: `For a regular ${s.name}, find ${k} times ${label}.`,
          answer: String(k * value),
        };
      }
      return { text: `For a regular ${s.name}, find ${label}.`, answer: String(value) };
    },
  },

  's2.1.8': {
    tags: ['arithmetic'],
    make: (r) => {
      const which = r.int(1, 4);
      const a = r.int(2, 700);
      if (which === 1)
        return { text: `*Approximate $${a}\\pi$.`, answer: String(Math.round(a * Math.PI)), kind: 'approximate' };
      if (which === 2)
        return { text: `*Approximate $${a}e$.`, answer: String(Math.round(a * Math.E)), kind: 'approximate' };
      if (which === 3) {
        const p = r.int(2, 5);
        return {
          text: `*Approximate $\\pi^{${p}}$.`,
          answer: String(Math.round(Math.PI ** p)),
          kind: 'approximate',
        };
      }
      const p = r.int(2, 6);
      return {
        text: `*Approximate $e^{${p}}$.`,
        answer: String(Math.round(Math.E ** p)),
        kind: 'approximate',
      };
    },
  },

  's2.1.9': {
    tags: ['conversions'],
    make: (r) => {
      const conv: Array<[string, string, number]> = [
        ['feet', 'inches', 12],
        ['yards', 'feet', 3],
        ['yards', 'inches', 36],
        ['miles', 'feet', 5280],
        ['miles', 'yards', 1760],
        ['furlongs', 'yards', 220],
        ['fathoms', 'feet', 6],
        ['rods', 'feet', 16.5],
        ['chains', 'feet', 66],
      ];
      const [from, to, k] = r.pick(conv);
      const n = r.int(2, 200);
      const value = n * k;
      if (!Number.isInteger(value)) return null;
      return { text: `${n} ${from} = ______ ${to}`, answer: String(value) };
    },
  },

  's2.1.10': {
    tags: ['conversions'],
    make: (r) => {
      const conv: Array<[string, string, number]> = [
        ['square feet', 'square inches', 144],
        ['square yards', 'square feet', 9],
        ['cubic yards', 'cubic feet', 27],
        ['cubic feet', 'cubic inches', 1728],
        ['acres', 'square feet', 43560],
        ['square miles', 'acres', 640],
      ];
      const [from, to, k] = r.pick(conv);
      const n = r.int(2, 400);
      return { text: `${n} ${from} = ______ ${to}`, answer: String(n * k) };
    },
  },

  's2.1.11': {
    tags: ['conversions'],
    make: (r) => {
      const conv: Array<[string, string, number]> = [
        ['gallons', 'quarts', 4],
        ['gallons', 'pints', 8],
        ['gallons', 'cups', 16],
        ['gallons', 'fluid ounces', 128],
        ['quarts', 'pints', 2],
        ['quarts', 'cups', 4],
        ['pints', 'cups', 2],
        ['cups', 'fluid ounces', 8],
        ['pounds', 'ounces', 16],
        ['tons', 'pounds', 2000],
        ['tablespoons', 'teaspoons', 3],
      ];
      const [from, to, k] = r.pick(conv);
      const n = r.int(2, 200);
      return { text: `${n} ${from} = ______ ${to}`, answer: String(n * k) };
    },
  },

  's2.1.12': {
    tags: ['conversions'],
    make: (r) => {
      if (r.bool()) {
        const c = r.int(-273, 400);
        return { text: `$${c}^\\circ$ Celsius = ______ $^\\circ$ Fahrenheit`, answer: frac(c * 9 + 32 * 5, 5) };
      }
      const f = r.int(-450, 750);
      return { text: `$${f}^\\circ$ Fahrenheit = ______ $^\\circ$ Celsius`, answer: frac((f - 32) * 5, 9) };
    },
  },

  's2.2.1': {
    tags: ['sequences'],
    make: (r) => {
      const mode = r.int(1, 4);
      const n = r.int(5, 500);
      if (mode === 1)
        return {
          text: `Calculate $1 + 2 + 3 + \\ldots + ${n}$.`,
          answer: String((n * (n + 1)) / 2),
        };
      if (mode === 2)
        return {
          text: `Calculate $2 + 4 + 6 + \\ldots + ${2 * n}$.`,
          answer: String(n * (n + 1)),
        };
      if (mode === 3)
        return {
          text: `Calculate $1 + 3 + 5 + \\ldots + ${2 * n - 1}$.`,
          answer: String(n * n),
        };
      return {
        text: `Calculate $1^2 + 2^2 + 3^2 + \\ldots + ${n}^2$.`,
        answer: String((n * (n + 1) * (2 * n + 1)) / 6),
      };
    },
  },

  's2.2.3': {
    tags: ['divisors', 'number-theory'],
    make: (r) => {
      const n = r.int(12, 900);
      const d = divisors(n);
      const mode = r.int(1, 3);
      if (mode === 1)
        return { text: `How many integral divisors does ${n} have?`, answer: String(d.length) };
      if (mode === 2)
        return {
          text: `Find the sum of the integral divisors of ${n}.`,
          answer: String(d.reduce((a, b) => a + b, 0)),
        };
      return {
        text: `How many positive integers less than ${n} are relatively prime to ${n}?`,
        answer: String(totient(n)),
      };
    },
  },

  's2.2.4': {
    tags: ['geometry', 'counting'],
    make: (r) => {
      const n = r.int(5, 700);
      if (r.bool())
        return {
          text: `How many diagonals does a ${n}-sided polygon have?`,
          answer: String((n * (n - 3)) / 2),
        };
      return {
        text: `A convex polygon has ${(n * (n - 3)) / 2} diagonals. How many sides does it have?`,
        answer: String(n),
      };
    },
  },

  's2.2.5': {
    tags: ['geometry'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const n = r.int(3, 600);
        return {
          text: `The measure of each exterior angle of a regular ${n}-gon is ______ degrees`,
          answer: frac(360, n),
        };
      }
      if (mode === 2) {
        const n = r.int(3, 600);
        return {
          text: `The measure of each interior angle of a regular ${n}-gon is ______ degrees`,
          answer: frac(180 * (n - 2), n),
        };
      }
      const a = r.int(1, 179);
      return r.bool()
        ? { text: `The supplement of a $${a}^\\circ$ angle is ______ degrees`, answer: String(180 - a) }
        : a < 90
          ? { text: `The complement of a $${a}^\\circ$ angle is ______ degrees`, answer: String(90 - a) }
          : null;
    },
  },

  's2.2.6': {
    tags: ['sequences'],
    make: (r) => {
      const kinds: Array<[string, number]> = [
        ['triangular', 3],
        ['square', 4],
        ['pentagonal', 5],
        ['hexagonal', 6],
        ['heptagonal', 7],
        ['octagonal', 8],
      ];
      const [name, s] = r.pick(kinds);
      const n = r.int(2, 260);
      const value = ((s - 2) * n * n - (s - 4) * n) / 2;
      return { text: `Find the ${n}th ${name} number.`, answer: String(value) };
    },
  },

  's2.2.7': {
    tags: ['geometry'],
    make: (r) => {
      const a = r.int(3, 60);
      const b = r.int(a, a + 40);
      const lo = b - a + 1;
      const hi = a + b - 1;
      if (r.bool())
        return {
          text: `Two sides of a triangle are ${a} and ${b}. The largest possible integral third side is ______`,
          answer: String(hi),
        };
      return {
        text: `Two sides of a triangle are ${a} and ${b}. The smallest possible integral third side is ______`,
        answer: String(lo),
      };
    },
  },

  's2.2.8': {
    tags: ['geometry'],
    make: (r) => {
      const s = r.int(2, 400);
      const mode = r.int(1, 3);
      if (mode === 1)
        return { text: `The perimeter of an equilateral triangle with side ${s} is ______`, answer: String(3 * s) };
      if (mode === 2)
        return {
          text: `The area of an equilateral triangle with side ${s} is $k\\sqrt{3}$. Find $k$.`,
          answer: frac(s * s, 4),
        };
      return {
        text: `The height of an equilateral triangle with side ${s} is $k\\sqrt{3}$. Find $k$.`,
        answer: frac(s, 2),
      };
    },
  },

  's2.2.9': {
    tags: ['geometry'],
    make: (r) => {
      const n = r.int(2, 120);
      const mode = r.int(1, 5);
      if (mode === 1) return { text: `The volume of a cube with edge ${n} is ______`, answer: String(n ** 3) };
      if (mode === 2)
        return { text: `The surface area of a cube with edge ${n} is ______`, answer: String(6 * n * n) };
      if (mode === 3)
        return {
          text: `The volume of a sphere with radius ${n} is $k\\pi$. Find $k$.`,
          answer: frac(4 * n ** 3, 3),
        };
      if (mode === 4)
        return {
          text: `The surface area of a sphere with radius ${n} is $k\\pi$. Find $k$.`,
          answer: String(4 * n * n),
        };
      const h = r.int(2, 40);
      return {
        text: `The volume of a cylinder with radius ${n} and height ${h} is $k\\pi$. Find $k$.`,
        answer: String(n * n * h),
      };
    },
  },

  's2.2.10': {
    tags: ['counting'],
    make: (r) => {
      const n = r.int(4, 140);
      const k = r.int(2, Math.min(n - 1, 6));
      if (r.bool())
        return { text: `$_{${n}}C_{${k}} = $ ______`, answer: String(nCk(n, k)) };
      return { text: `$_{${n}}P_{${k}} = $ ______`, answer: String(nPk(n, k)) };
    },
  },

  's2.2.11': {
    tags: ['trigonometry'],
    make: (r) => {
      // Special angles where the answer is rational or a clean radical coefficient.
      const table: Array<[string, string, string]> = [
        ['\\sin', '0^\\circ', '0'], ['\\cos', '0^\\circ', '1'], ['\\tan', '0^\\circ', '0'],
        ['\\sin', '30^\\circ', '1/2'], ['\\cos', '60^\\circ', '1/2'], ['\\tan', '45^\\circ', '1'],
        ['\\sin', '90^\\circ', '1'], ['\\cos', '90^\\circ', '0'], ['\\sin', '150^\\circ', '1/2'],
        ['\\cos', '120^\\circ', '-1/2'], ['\\sin', '180^\\circ', '0'], ['\\cos', '180^\\circ', '-1'],
        ['\\sin', '210^\\circ', '-1/2'], ['\\cos', '240^\\circ', '-1/2'], ['\\sin', '270^\\circ', '-1'],
        ['\\cos', '270^\\circ', '0'], ['\\sin', '330^\\circ', '-1/2'], ['\\cos', '300^\\circ', '1/2'],
        ['\\tan', '135^\\circ', '-1'], ['\\tan', '180^\\circ', '0'], ['\\tan', '225^\\circ', '1'],
        ['\\tan', '315^\\circ', '-1'], ['\\csc', '30^\\circ', '2'], ['\\sec', '60^\\circ', '2'],
        ['\\cot', '45^\\circ', '1'], ['\\csc', '90^\\circ', '1'], ['\\sec', '0^\\circ', '1'],
        ['\\csc', '150^\\circ', '2'], ['\\sec', '120^\\circ', '-2'], ['\\cot', '135^\\circ', '-1'],
      ];
      const [fn, angle, val] = r.pick(table);
      const k = r.int(1, 44);
      if (k === 1) return { text: `$${fn} ${angle} = $ ______`, answer: val };
      const [p, q] = val.includes('/') ? val.split('/').map(Number) : [Number(val), 1];
      return { text: `$${k}${fn} ${angle} = $ ______`, answer: frac(k * p, q) };
    },
  },

  's2.2.12': {
    tags: ['trigonometry'],
    make: (r) => {
      const a = r.int(2, 150);
      const mode = r.int(1, 4);
      const x = r.pick(['x', '\\theta', 'A', 'B']);
      if (mode === 1)
        return {
          text: `$${a}(\\sin^2 ${x} + \\cos^2 ${x}) = $ ______`,
          answer: String(a),
        };
      if (mode === 2)
        return {
          text: `$${a}(\\sec^2 ${x} - \\tan^2 ${x}) = $ ______`,
          answer: String(a),
        };
      if (mode === 3)
        return {
          text: `$${a}(\\csc^2 ${x} - \\cot^2 ${x}) = $ ______`,
          answer: String(a),
        };
      return {
        text: `$${a}\\sin ${x} \\cos ${x} = k\\sin 2${x}$. Find $k$.`,
        answer: frac(a, 2),
      };
    },
  },

  's2.2.13': {
    tags: ['trigonometry'],
    make: (r) => {
      const amp = r.int(2, 30);
      const b = r.int(2, 20);
      const shift = r.int(-20, 20);
      const fn = r.pick(['\\sin', '\\cos']);
      const mode = r.int(1, 3);
      const eqn = `y = ${amp}${fn}(${b}x) ${shift >= 0 ? '+' : '-'} ${Math.abs(shift)}`;
      if (mode === 1) return { text: `The amplitude of $${eqn}$ is ______`, answer: String(amp) };
      if (mode === 2)
        return { text: `The period of $${eqn}$ is $k\\pi$. Find $k$.`, answer: frac(2, b) };
      return { text: `The vertical shift of $${eqn}$ is ______`, answer: String(shift) };
    },
  },

  's2.2.14': {
    tags: ['algebra'],
    make: (r) => {
      const a = r.pick([1, 1, 2, 3, -1, -2]);
      const h = r.int(-15, 15);
      const k = r.int(-40, 40);
      // y = a(x-h)^2 + k  ->  y = ax^2 - 2ahx + ah^2 + k
      const b = -2 * a * h;
      const c = a * h * h + k;
      const eqn = `y = ${a === 1 ? '' : a === -1 ? '-' : a}x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`;
      return r.bool()
        ? { text: `The vertex of $${eqn}$ is $(h, k)$. Find $h$.`, answer: String(h) }
        : { text: `The vertex of $${eqn}$ is $(h, k)$. Find $k$.`, answer: String(k) };
    },
  },

  's2.2.15': {
    tags: ['algebra'],
    make: (r) => {
      const a = r.int(1, 12);
      const b = r.int(-30, 30);
      const c = r.int(-30, 30);
      const mode = r.int(1, 2);
      if (mode === 1) {
        return {
          text: `The discriminant of $${a}x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0$ is ______`,
          answer: String(b * b - 4 * a * c),
        };
      }
      // Equal roots: b^2 = 4ac -> choose a, b even so k is integral
      const a2 = r.int(1, 9);
      const b2 = 2 * a2 * r.int(1, 9);
      const k = (b2 * b2) / (4 * a2);
      return {
        text: `The quadratic $${a2}x^2 ${r.bool() ? '+' : '-'} ${b2}x + k = 0$ has two equal roots. Find $k$.`,
        answer: String(k),
      };
    },
  },
};
