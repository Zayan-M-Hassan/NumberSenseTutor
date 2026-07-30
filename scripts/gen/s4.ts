import { Generator, fibSeq, frac, gcd, nCk, PRIMES, tfrac, toBase } from './helpers';

const PHI = (1 + Math.sqrt(5)) / 2;

/** Section 4 — advanced material. */
export const S4: Record<string, Generator> = {
  's4.1.1': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(100, 999);
      const b = r.int(10, 99);
      return { text: `Calculate $${a} \\times ${b}$.`, answer: String(a * b) };
    },
  },

  's4.1.2': {
    tags: ['arithmetic'],
    make: (r) => {
      const a = r.int(100, 999);
      const b = r.int(100, 999);
      return { text: `Calculate $${a} \\times ${b}$.`, answer: String(a * b) };
    },
  },

  's4.1.3': {
    tags: ['arithmetic'],
    make: (r) => {
      const lead = r.int(1, 999);
      const u = r.int(1, 9);
      const a = lead * 10 + u;
      const b = lead * 10 + (10 - u);
      return { text: `Calculate $${a} \\times ${b}$.`, answer: String(a * b) };
    },
  },

  's4.1.4': {
    tags: ['arithmetic'],
    make: (r) => {
      const A = r.int(2, 400);
      const n = r.int(2, 9);
      const num = r.int(1, 9);
      const den = r.pick([100, 1000]);
      const x = num / den;
      const value = A * Math.pow(1 + x, n);
      return {
        text: `*Approximate $${A} \\times (1 + ${tfrac(num, den)})^{${n}}$.`,
        answer: String(Math.round(value)),
        kind: 'approximate',
      };
    },
  },

  's4.1.5': {
    tags: ['fractions'],
    make: (r) => {
      const d = r.int(3, 60);
      const n = r.bool() ? d - 1 : d + 1;
      const k = r.int(20, 900);
      return {
        text: `Calculate $${k} \\times ${tfrac(n, d)}$.`,
        answer: frac(k * n, d),
      };
    },
  },

  's4.1.6': {
    tags: ['arithmetic'],
    make: (r) => {
      const base = r.int(2, 700) * 5;
      const n = base - 1;
      return r.bool()
        ? { text: `Calculate $${n}^2 + ${n}$.`, answer: String(n * n + n) }
        : { text: `Calculate $${base}^2 - ${base}$.`, answer: String(base * base - base) };
    },
  },

  's4.2.1': {
    tags: ['conversions'],
    make: (r) => {
      const conv: Array<[string, string, number, number]> = [
        ['miles', 'rods', 320, 1],
        ['rods', 'yards', 11, 2],
        ['furlongs', 'rods', 40, 1],
        ['leagues', 'miles', 3, 1],
        ['fathoms', 'yards', 2, 1],
        ['hands', 'inches', 4, 1],
        ['cubits', 'inches', 18, 1],
        ['nautical miles', 'feet', 6076, 1],
        ['pecks', 'quarts', 8, 1],
        ['bushels', 'pecks', 4, 1],
        ['scores', 'units', 20, 1],
        ['gross', 'units', 144, 1],
        ['drams', 'grains', 27, 1],
        ['stones', 'pounds', 14, 1],
      ];
      const [from, to, num, den] = r.pick(conv);
      const n = r.int(2, 300) * den;
      const value = (n * num) / den;
      if (!Number.isInteger(value)) return null;
      return { text: `${n} ${from} = ______ ${to}`, answer: String(value) };
    },
  },

  's4.2.2': {
    tags: ['number-theory'],
    make: (r) => {
      const n = r.int(2, 999);
      const mode = r.int(1, 3);
      if (mode === 1) {
        // Happy number: iterate sum of squares of digits to 1.
        let x = n;
        const seen = new Set<number>();
        while (x !== 1 && !seen.has(x)) {
          seen.add(x);
          x = String(x)
            .split('')
            .reduce((a, d) => a + Number(d) ** 2, 0);
        }
        return {
          text: `Is ${n} a happy number? (Yes/No)`,
          answer: x === 1 ? 'Yes' : 'No',
          kind: 'categorical',
        };
      }
      if (mode === 2) {
        // Evil: even number of 1s in binary. Odious: odd.
        const ones = toBase(n, 2).split('').filter((c) => c === '1').length;
        return {
          text: `Is ${n} an evil or an odious number?`,
          answer: ones % 2 === 0 ? 'Evil' : 'Odious',
          kind: 'categorical',
        };
      }
      // Digit sum / digital root.
      let x = n;
      while (x > 9) x = String(x).split('').reduce((a, d) => a + Number(d), 0);
      return { text: `Find the digital root of ${n}.`, answer: String(x) };
    },
  },

  's4.2.3': {
    tags: ['logs-exponents'],
    make: (r) => {
      const n = r.int(2, 99);
      const k = r.int(10, 900);
      return {
        text: `*Approximate $${k}\\sqrt{${n}}$.`,
        answer: String(Math.round(k * Math.sqrt(n))),
        kind: 'approximate',
      };
    },
  },

  's4.2.4': {
    tags: ['arithmetic'],
    make: (r) => {
      const n = r.int(2, 24);
      const k = r.int(1, 40);
      const value = k * Math.pow(PHI, n);
      if (value > 1e9) return null;
      return {
        text: `*Approximate $${k === 1 ? '' : k}\\phi^{${n}}$, where $\\phi$ is the golden ratio.`,
        answer: String(Math.round(value)),
        kind: 'approximate',
      };
    },
  },

  's4.2.5': {
    tags: ['sequences'],
    make: (r) => {
      const n = r.int(3, 76);
      const seq = fibSeq(1, 1, 90);
      const mode = r.int(1, 14);
      if (mode === 1)
        return { text: `Find the ${n}th standard Fibonacci number.`, answer: String(seq[n - 1]) };
      if (mode === 2)
        return {
          text: `Find the sum of the first ${n} standard Fibonacci numbers.`,
          answer: String(seq[n + 1] - 1),
        };
      if (mode === 3)
        return {
          text: `Find the sum of the squares of the first ${n} standard Fibonacci numbers.`,
          answer: String(seq[n - 1] * seq[n]),
        };
      if (mode === 4)
        return {
          text: `Find the sum of the first ${n} even-numbered standard Fibonacci numbers.`,
          answer: String(seq[2 * n] - 1 > 0 ? seq[2 * n - 1] - 1 : 0),
        };
      if (mode === 5)
        return {
          text: `The ${n}th standard Fibonacci number minus the ${n - 1}th is ______`,
          answer: String(seq[n - 1] - seq[n - 2]),
        };
      if (mode === 6)
        return {
          text: `The ${n}th standard Fibonacci number plus the ${n + 1}th is ______`,
          answer: String(seq[n - 1] + seq[n]),
        };
      if (mode === 7)
        return {
          text: `Find the product of the ${n}th and ${n + 1}th standard Fibonacci numbers.`,
          answer: String(seq[n - 1] * seq[n]),
        };
      if (mode === 8)
        return {
          text: `Find twice the ${n}th standard Fibonacci number.`,
          answer: String(2 * seq[n - 1]),
        };
      if (mode === 9)
        return {
          text: `Find the sum of the ${n}th and ${n + 2}th standard Fibonacci numbers.`,
          answer: String(seq[n - 1] + seq[n + 1]),
        };
      if (mode === 10)
        return {
          text: `The ${n + 2}th standard Fibonacci number minus the ${n}th is ______`,
          answer: String(seq[n + 1] - seq[n - 1]),
        };
      if (mode === 11)
        return {
          text: `Find the sum of the ${n}th, ${n + 1}th and ${n + 2}th standard Fibonacci numbers.`,
          answer: String(seq[n - 1] + seq[n] + seq[n + 1]),
        };
      if (mode === 12)
        return {
          text: `Find three times the ${n}th standard Fibonacci number.`,
          answer: String(3 * seq[n - 1]),
        };
      if (mode === 13) {
        const m = r.int(3, 200);
        return {
          text: `The ${n}th standard Fibonacci number divided by ${m} has a remainder of ______`,
          answer: String(seq[n - 1] % m),
        };
      }
      return {
        text: `Find the square of the ${Math.min(n, 38)}th standard Fibonacci number.`,
        answer: String(seq[Math.min(n, 38) - 1] ** 2),
      };
    },
  },

  's4.3.1': {
    tags: ['sequences'],
    make: (r) => {
      const a = r.int(1, 30);
      const b = r.int(1, 30);
      const n = r.int(5, 12);
      const seq = fibSeq(a, b, n + 2);
      const shown = seq.slice(0, 4).join(', ');
      const sum = seq.slice(0, n).reduce((x, y) => x + y, 0);
      return {
        text: `Given the sequence ${shown}, ..., find the sum of the first ${n} terms.`,
        answer: String(sum),
      };
    },
  },

  's4.3.2': {
    tags: ['sequences'],
    make: (r) => {
      const a = r.int(1, 40);
      const b = r.int(1, 40);
      const seq = fibSeq(a, b, 12);
      // Sum of first 10 terms of a Fibonacci-like sequence = 11 * 7th term.
      const sum = seq.slice(0, 10).reduce((x, y) => x + y, 0);
      return {
        text: `Given the sequence ${seq.slice(0, 3).join(', ')}, ..., find the sum of the first 10 terms.`,
        answer: String(sum),
      };
    },
  },

  's4.3.3': {
    tags: ['sequences'],
    make: (r) => {
      const a = r.int(1, 25);
      const b = r.int(1, 25);
      const n = r.int(3, 8);
      const seq = fibSeq(a, b, 2 * n + 2);
      const odd = r.bool();
      let sum = 0;
      for (let i = 0; i < n; i++) sum += seq[odd ? 2 * i : 2 * i + 1];
      return {
        text: `Given the sequence ${seq.slice(0, 4).join(', ')}, ..., find the sum of the first ${n} ${odd ? 'odd-numbered' : 'even-numbered'} terms.`,
        answer: String(sum),
      };
    },
  },

  's4.3.4': {
    tags: ['sequences'],
    make: (r) => {
      const a = r.int(1, 20);
      const b = r.int(1, 20);
      const n = r.int(4, 11);
      const seq = fibSeq(a, b, n + 2);
      const sum = seq.slice(0, n).reduce((x, y) => x + y * y, 0);
      return {
        text: `Given the sequence ${seq.slice(0, 3).join(', ')}, ..., find the sum of the squares of the first ${n} terms.`,
        answer: String(sum),
      };
    },
  },

  's4.4.1': {
    tags: ['fractions'],
    make: (r) => {
      const a = r.int(1, 25);
      const b = r.int(a + 1, 40);
      const n = r.int(2, 9);
      const num2 = n * a - 1;
      const den2 = n * b - 1;
      return {
        text: `Calculate $${tfrac(a, b)} - ${tfrac(num2, den2)}$.`,
        answer: frac(a * den2 - num2 * b, b * den2),
      };
    },
  },

  's4.4.2': {
    tags: ['algebra'],
    make: (r) => {
      const s = r.int(2, 30);
      const p = r.int(1, 40);
      // a+b = s, ab = p  ->  a^3 + b^3 = s^3 - 3ps
      return r.bool()
        ? {
            text: `If $a + b = ${s}$ and $ab = ${p}$, find $a^3 + b^3$.`,
            answer: String(s ** 3 - 3 * p * s),
          }
        : {
            text: `If $a + b = ${s}$ and $ab = ${p}$, find $a^2 + b^2$.`,
            answer: String(s * s - 2 * p),
          };
    },
  },

  's4.4.3': {
    tags: ['sequences', 'fractions'],
    make: (r) => {
      const n = r.int(2, 1400);
      // sum_{k=1..n} 1/T_k = 2n/(n+1)
      return {
        text: `Calculate $\\frac{1}{1} + \\frac{1}{3} + \\frac{1}{6} + \\ldots + \\frac{1}{T_{${n}}}$, where $T_k$ is the $k$th triangular number.`,
        answer: frac(2 * n, n + 1),
      };
    },
  },

  's4.4.4': {
    tags: ['statistics'],
    make: (r) => {
      if (r.bool()) {
        const a = r.int(1, 40);
        const k = r.int(2, 25);
        const b = a * k * k;
        return {
          text: `Find the geometric mean of ${a} and ${b}.`,
          answer: String(a * k),
        };
      }
      const a = r.int(1, 30);
      const b = r.int(1, 30);
      return {
        text: `Find the harmonic mean of ${a} and ${b}.`,
        answer: frac(2 * a * b, a + b),
      };
    },
  },

  's4.4.5': {
    tags: ['coordinate-geometry'],
    make: (r) => {
      // Pythagorean-friendly lines so the distance is rational.
      const [A, B] = r.pick([
        [3, 4], [4, 3], [6, 8], [5, 12], [12, 5], [8, 15], [9, 12], [7, 24],
      ]);
      const C = r.int(-30, 30);
      const x = r.int(-15, 15);
      const y = r.int(-15, 15);
      const dist = Math.abs(A * x + B * y + C);
      const norm = Math.round(Math.sqrt(A * A + B * B));
      return {
        text: `Find the distance between the point $(${x}, ${y})$ and the line $${A}x ${B >= 0 ? '+' : '-'} ${Math.abs(B)}y ${C >= 0 ? '+' : '-'} ${Math.abs(C)} = 0$.`,
        answer: frac(dist, norm),
      };
    },
  },

  's4.4.6': {
    tags: ['coordinate-geometry'],
    make: (r) => {
      const [A, B] = r.pick([
        [3, 4], [4, 3], [6, 8], [5, 12], [12, 5], [8, 15], [9, 12], [7, 24],
      ]);
      const C1 = r.int(-30, 30);
      let C2 = r.int(-30, 30);
      if (C1 === C2) C2 = C1 + r.int(1, 10);
      const norm = Math.round(Math.sqrt(A * A + B * B));
      return {
        text: `Find the distance between the parallel lines $${A}x ${B >= 0 ? '+' : '-'} ${Math.abs(B)}y ${C1 >= 0 ? '+' : '-'} ${Math.abs(C1)} = 0$ and $${A}x ${B >= 0 ? '+' : '-'} ${Math.abs(B)}y ${C2 >= 0 ? '+' : '-'} ${Math.abs(C2)} = 0$.`,
        answer: frac(Math.abs(C1 - C2), norm),
      };
    },
  },

  's4.5.1': {
    tags: ['sets', 'counting'],
    make: (r) => {
      const n = r.int(3, 130);
      const k = r.int(1, Math.min(n, 8));
      if (r.bool())
        return {
          text: `How many subsets of size ${k} does a set with ${n} elements have?`,
          answer: String(nCk(n, k)),
        };
      return {
        text: `How many subsets of at most ${Math.min(k, 2)} elements does a set with ${n} elements have?`,
        answer: String(
          Array.from({ length: Math.min(k, 2) + 1 }, (_, i) => nCk(n, i)).reduce((a, b) => a + b, 0)
        ),
      };
    },
  },

  's4.5.2': {
    tags: ['repeating-decimals'],
    make: (r) => {
      const den = r.pick([9, 90, 99, 900, 990, 999]);
      const num = r.int(1, den - 1);
      if (gcd(num, den) !== 1) return null;
      const value = num / den;
      const digits = value.toFixed(8).slice(2, 6);
      return {
        text: `The first four digits of the decimal for $${tfrac(num, den)}$ are 0.______`,
        answer: digits,
      };
    },
  },

  's4.5.3': {
    tags: ['repeating-decimals', 'bases'],
    make: (r) => {
      const base = r.int(3, 20);
      const a = r.int(0, base - 1);
      const b = r.int(1, base - 1);
      // 0.a bbb..._base = (a(b-1) + b) / (base(base-1))
      const num = a * (base - 1) + b;
      const den = base * (base - 1);
      return {
        text: `Change $0.${a}\\overline{${b}}_{${base}}$ to a base-10 fraction.`,
        answer: frac(num, den),
      };
    },
  },

  's4.5.4': {
    tags: ['repeating-decimals', 'bases'],
    make: (r) => {
      const base = r.int(3, 20);
      const d1 = r.int(1, base - 1);
      const d2 = r.int(0, base - 1);
      // 0.(d1 d2)repeat in base b = (d1*b + d2) / (b^2 - 1), expressed in base b
      const num = d1 * base + d2;
      const den = base * base - 1;
      const g = gcd(num, den);
      return {
        text: `Change $0.\\overline{${d1}${d2}}_{${base}}$ to a base-${base} fraction.`,
        answer: `${toBase(num / g, base)}/${toBase(den / g, base)}`,
      };
    },
  },

  's4.5.5': {
    tags: ['remainders'],
    make: (r) => {
      const p = r.pick(PRIMES.filter((x) => x >= 5 && x <= 97));
      const ra = r.int(1, p - 1);
      const rb = r.int(1, p - 1);
      const a = p * r.int(2, 20) + ra;
      const b = p * r.int(2, 20) + rb;
      return {
        text: `$${a} \\div ${p}$ has remainder ${ra} and $${b} \\div ${p}$ has remainder ${rb}. Find the remainder when $${a} \\times ${b}$ is divided by ${p}.`,
        answer: String((ra * rb) % p),
      };
    },
  },

  's4.5.6': {
    tags: ['algebra'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const a = r.int(1, 9);
        const h = r.int(-12, 12);
        const k = r.int(-40, 40);
        const b = -2 * a * h;
        const c = a * h * h + k;
        return {
          text: `Find the minimum value of $${a}x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}$.`,
          answer: String(k),
        };
      }
      if (mode === 2) {
        const a = -r.int(1, 9);
        const h = r.int(-12, 12);
        const k = r.int(-40, 40);
        const b = -2 * a * h;
        const c = a * h * h + k;
        return {
          text: `Find the maximum value of $${a}x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}$.`,
          answer: String(k),
        };
      }
      const amp = r.int(2, 40);
      const shift = r.int(-30, 30);
      const fn = r.pick(['\\sin', '\\cos']);
      const maxQ = r.bool();
      return {
        text: `Find the ${maxQ ? 'maximum' : 'minimum'} value of $${amp}${fn} x ${shift >= 0 ? '+' : '-'} ${Math.abs(shift)}$.`,
        answer: String(maxQ ? amp + shift : -amp + shift),
      };
    },
  },
};
