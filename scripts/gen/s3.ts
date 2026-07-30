import {
  Generator,
  divisors,
  factorial,
  frac,
  gcd,
  isPrime,
  lcm,
  nCk,
  PRIMES,
  tfrac,
  toBase,
} from './helpers';

/** Section 3 — miscellaneous: number theory, bases, repeating decimals, calculus. */
export const S3: Record<string, Generator> = {
  's3.1.1': {
    tags: ['divisors'],
    make: (r) => {
      const a = r.int(10, 300);
      const b = r.int(10, 300);
      return r.bool()
        ? { text: `The GCD of ${a} and ${b} is ______`, answer: String(gcd(a, b)) }
        : { text: `The LCM of ${a} and ${b} is ______`, answer: String(lcm(a, b)) };
    },
  },

  's3.1.2': {
    tags: ['number-theory'],
    make: (r) => {
      const n = r.int(2, 1200);
      const sum = divisors(n).reduce((a, b) => a + b, 0) - n;
      const cls = sum === n ? 'Perfect' : sum > n ? 'Abundant' : 'Deficient';
      return {
        text: `Is ${n} perfect, abundant, or deficient?`,
        answer: cls,
        kind: 'categorical',
      };
    },
  },

  's3.1.3': {
    tags: ['counting', 'algebra'],
    make: (r) => {
      const a = r.int(1, 9);
      const b = r.int(1, 9);
      const n = r.int(2, 14);
      const sign = r.bool() ? 1 : -1;
      // Sum of coefficients = value at x = 1.
      const value = Math.pow(a + sign * b, n);
      return {
        text: `Find the sum of the coefficients in the expansion of $(${a}x ${sign > 0 ? '+' : '-'} ${b})^{${n}}$.`,
        answer: String(value),
      };
    },
  },

  's3.1.4': {
    tags: ['algebra'],
    make: (r) => {
      const a = r.int(1, 12);
      const b = r.int(-40, 40);
      const c = r.int(-40, 40);
      const quad = `${a === 1 ? '' : a}x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0`;
      return r.bool()
        ? { text: `Find the sum of the roots of $${quad}$.`, answer: frac(-b, a) }
        : { text: `Find the product of the roots of $${quad}$.`, answer: frac(c, a) };
    },
  },

  's3.1.5': {
    tags: ['number-theory'],
    make: (r) => {
      const base = r.int(2, 99);
      const exp = r.int(3, 400);
      // Units digit cycles with period dividing 4.
      let u = 1;
      const b = base % 10;
      const cycle: number[] = [];
      let cur = 1;
      for (let i = 0; i < 4; i++) {
        cur = (cur * b) % 10;
        cycle.push(cur);
      }
      u = cycle[(exp - 1) % 4];
      return {
        text: `Find the units digit of $${base}^{${exp}}$.`,
        answer: String(u),
      };
    },
  },

  's3.1.6': {
    tags: ['logs-exponents'],
    make: (r) => {
      const base = r.pick([2, 3, 5, 6, 7, 10]);
      const m = r.int(2, 12);
      const n = r.int(2, 12);
      const mode = r.int(1, 3);
      if (mode === 1)
        return {
          text: `$${base}^{${m}} \\times ${base}^{${n}} = ${base}^{k}$. Find $k$.`,
          answer: String(m + n),
        };
      if (mode === 2)
        return {
          text: `$(${base}^{${m}})^{${n}} = ${base}^{k}$. Find $k$.`,
          answer: String(m * n),
        };
      return {
        text: `$${base}^{${m + n}} \\div ${base}^{${n}} = ${base}^{k}$. Find $k$.`,
        answer: String(m),
      };
    },
  },

  's3.1.7': {
    tags: ['logs-exponents'],
    make: (r) => {
      const base = r.pick([2, 3, 5, 10]);
      const mode = r.int(1, 4);
      const e = r.int(1, 12);
      if (mode === 1)
        return { text: `$\\log_{${base}} ${base ** e} = $ ______`, answer: String(e) };
      if (mode === 2) {
        const f = r.int(1, 10);
        return {
          text: `$\\log_{${base}} ${base ** e} + \\log_{${base}} ${base ** f} = $ ______`,
          answer: String(e + f),
        };
      }
      if (mode === 3) {
        const f = r.int(1, e);
        return {
          text: `$\\log_{${base}} ${base ** e} - \\log_{${base}} ${base ** f} = $ ______`,
          answer: String(e - f),
        };
      }
      const k = r.int(2, 8);
      return {
        text: `$\\log_{${base}} ${base ** e}^{${k}} = $ ______`,
        answer: String(e * k),
      };
    },
  },

  's3.1.8': {
    tags: ['logs-exponents'],
    make: (r) => {
      const a = r.int(2, 60);
      const b = r.int(2, 60);
      const prod = a * b;
      // Choose so the product under the radical is a perfect square.
      return r.bool()
        ? { text: `$\\sqrt{${a}} \\times \\sqrt{${a}} = $ ______`, answer: String(a) }
        : {
            text: `$\\sqrt{${a * a}} \\times \\sqrt{${b * b}} = $ ______`,
            answer: String(prod),
          };
    },
  },

  's3.1.9': {
    tags: ['logs-exponents'],
    make: (r) => {
      if (r.bool()) {
        const n = r.int(200, 999999);
        return {
          text: `*$\\sqrt{${n}} = $ ______`,
          answer: String(Math.round(Math.sqrt(n))),
          kind: 'approximate',
        };
      }
      const n = r.int(500, 999999);
      return {
        text: `*$\\sqrt[3]{${n}} = $ ______`,
        answer: String(Math.round(Math.cbrt(n))),
        kind: 'approximate',
      };
    },
  },

  's3.1.10': {
    tags: ['complex'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const n = r.int(2, 400);
        const cycle = ['1', 'i', '-1', '-i'];
        return { text: `$i^{${n}} = $ ______`, answer: cycle[n % 4] };
      }
      const a = r.int(-12, 12);
      const b = r.int(-12, 12);
      if (b === 0) return null;
      if (mode === 2) {
        return {
          text: `$|${a} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}i|^2 = $ ______`,
          answer: String(a * a + b * b),
        };
      }
      const c = r.int(-9, 9);
      const d = r.int(-9, 9);
      // (a+bi)(c+di) — ask for the real part so the answer stays numeric.
      return {
        text: `Find the real part of $(${a} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}i)(${c} ${d >= 0 ? '+' : '-'} ${Math.abs(d)}i)$.`,
        answer: String(a * c - b * d),
      };
    },
  },

  's3.1.11': {
    tags: ['functions'],
    make: (r) => {
      const a = r.int(2, 15);
      const b = r.int(-30, 30);
      const y = r.int(-40, 40);
      // f(x) = ax + b, f^-1(y) = (y-b)/a
      return {
        text: `If $f(x) = ${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}$, then $f^{-1}(${y}) = $ ______`,
        answer: frac(y - b, a),
      };
    },
  },

  's3.1.12': {
    tags: ['sequences'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const a = r.int(1, 30);
        const d = r.int(2, 20);
        const n = r.int(5, 60);
        const terms = [a, a + d, a + 2 * d, a + 3 * d];
        return {
          text: `Find the ${n}th term of the sequence ${terms.join(', ')}, ...`,
          answer: String(a + (n - 1) * d),
        };
      }
      if (mode === 2) {
        const a = r.int(1, 8);
        const q = r.int(2, 4);
        const n = r.int(4, 12);
        const terms = [a, a * q, a * q * q, a * q ** 3];
        return {
          text: `Find the ${n}th term of the sequence ${terms.join(', ')}, ...`,
          answer: String(a * q ** (n - 1)),
        };
      }
      const start = r.int(1, 12);
      const seq = [start, start + 1, start + 2, start + 3, start + 4].map((k) => k * k);
      return {
        text: `Find the next term of the sequence ${seq.join(', ')}, ...`,
        answer: String((start + 5) * (start + 5)),
      };
    },
  },

  's3.1.13': {
    tags: ['probability'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        // Two dice, sum divisible by k or equal to s.
        const s = r.int(2, 12);
        let count = 0;
        for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === s) count++;
        return {
          text: `Two dice are thrown. What is the probability that their sum is ${s}?`,
          answer: frac(count, 36),
        };
      }
      if (mode === 2) {
        const win = r.int(1, 20);
        const lose = r.int(1, 20);
        return {
          text: `The odds of winning are ${win}-to-${lose}. The probability of winning is ______`,
          answer: frac(win, win + lose),
        };
      }
      const total = r.int(5, 40);
      const good = r.int(1, total - 1);
      return {
        text: `A bag holds ${good} red and ${total - good} blue marbles. The probability of drawing a red marble is ______`,
        answer: frac(good, total),
      };
    },
  },

  's3.1.14': {
    tags: ['sets', 'counting'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const n = r.int(1, 20);
        return { text: `A set with ${n} elements has how many subsets?`, answer: String(2 ** n) };
      }
      if (mode === 2) {
        const n = r.int(1, 20);
        return {
          text: `A set with ${n} elements has how many proper subsets?`,
          answer: String(2 ** n - 1),
        };
      }
      const a = r.int(5, 60);
      const b = r.int(5, 60);
      const both = r.int(1, Math.min(a, b));
      return {
        text: `Set $A$ has ${a} elements and set $B$ has ${b}. If ${both} elements are in both, how many are in $A \\cup B$?`,
        answer: String(a + b - both),
      };
    },
  },

  's3.2.1': {
    tags: ['bases'],
    make: (r) => {
      const base = r.int(2, 9);
      const n = r.int(5, 5000);
      return r.bool()
        ? {
            text: `$${toBase(n, base)}_{${base}} = $ ______ base 10`,
            answer: String(n),
          }
        : {
            text: `$${n}_{10} = $ ______ base ${base}`,
            answer: toBase(n, base),
          };
    },
  },

  's3.2.2': {
    tags: ['bases', 'fractions'],
    make: (r) => {
      const base = r.int(2, 9);
      const places = r.int(1, 3);
      const digits: number[] = [];
      for (let i = 0; i < places; i++) digits.push(r.int(0, base - 1));
      if (digits[digits.length - 1] === 0) return null;
      let num = 0;
      for (const d of digits) num = num * base + d;
      const den = Math.pow(base, places);
      return {
        text: `Change $0.${digits.join('')}_{${base}}$ to a base-10 fraction.`,
        answer: frac(num, den),
      };
    },
  },

  's3.2.3': {
    tags: ['bases'],
    make: (r) => {
      const base = r.int(3, 9);
      const a = r.int(2, base ** 3 - 1);
      const b = r.int(2, base ** 2 - 1);
      const op = r.int(1, 3);
      if (op === 1)
        return {
          text: `$${toBase(a, base)}_{${base}} + ${toBase(b, base)}_{${base}} = $ ______ base ${base}`,
          answer: toBase(a + b, base),
        };
      if (op === 2 && a > b)
        return {
          text: `$${toBase(a, base)}_{${base}} - ${toBase(b, base)}_{${base}} = $ ______ base ${base}`,
          answer: toBase(a - b, base),
        };
      const s = r.int(2, base - 1);
      return {
        text: `$${toBase(a, base)}_{${base}} \\times ${s}_{${base}} = $ ______ base ${base}`,
        answer: toBase(a * s, base),
      };
    },
  },

  's3.2.4': {
    tags: ['bases'],
    make: (r) => {
      const pairs: Array<[number, number]> = [
        [2, 4], [2, 8], [2, 16], [3, 9], [4, 16], [2, 32], [5, 25], [3, 27],
      ];
      const [small, big] = r.pick(pairs);
      const n = r.int(8, 4000);
      return r.bool()
        ? {
            text: `$${toBase(n, small)}_{${small}} = $ ______ base ${big}`,
            answer: toBase(n, big),
          }
        : {
            text: `$${toBase(n, big)}_{${big}} = $ ______ base ${small}`,
            answer: toBase(n, small),
          };
    },
  },

  's3.2.6': {
    tags: ['bases'],
    make: (r) => {
      const base = r.int(3, 16);
      if (r.bool(0.4)) {
        const d = r.int(1, base - 1);
        // 0.ddd..._b = d/(b-1)
        return {
          text: `Change $0.\\overline{${toBase(d, base)}}_{${base}}$ to a base-10 fraction.`,
          answer: frac(d, base - 1),
        };
      }
      const d1 = r.int(1, base - 1);
      const d2 = r.int(0, base - 1);
      // 0.(d1 d2)repeat_b = (d1*b + d2)/(b^2 - 1)
      return {
        text: `Change $0.\\overline{${toBase(d1, base)}${toBase(d2, base)}}_{${base}}$ to a base-10 fraction.`,
        answer: frac(d1 * base + d2, base * base - 1),
      };
    },
  },

  's3.3.2': {
    tags: ['repeating-decimals'],
    make: (r) => {
      const len = r.pick([2, 3]);
      const max = Math.pow(10, len) - 1;
      const n = r.int(1, max);
      const digits = String(n).padStart(len, '0');
      return {
        text: `Change $0.\\overline{${digits}}$ to a fraction.`,
        answer: frac(n, max),
      };
    },
  },

  's3.3.3': {
    tags: ['repeating-decimals'],
    make: (r) => {
      if (r.bool(0.35)) {
        const a = r.int(0, 9);
        const b = r.int(0, 9);
        // 0.abbb... = (ab - a)/90
        return {
          text: `Change $0.${a}\\overline{${b}}$ to a fraction.`,
          answer: frac(10 * a + b - a, 90),
        };
      }
      const a = r.int(0, 9);
      const b = r.int(0, 9);
      const c = r.int(0, 9);
      // 0.ab ccc... = (abc - ab)/900
      const num = 100 * a + 10 * b + c - (10 * a + b);
      return {
        text: `Change $0.${a}${b}\\overline{${c}}$ to a fraction.`,
        answer: frac(num, 900),
      };
    },
  },

  's3.3.4': {
    tags: ['repeating-decimals'],
    make: (r) => {
      const a = r.int(0, 9);
      const bc = r.int(0, 99);
      const digits = String(bc).padStart(2, '0');
      // 0.a bc bc ... = (abc - a)/990
      const num = 100 * a + bc - a;
      return {
        text: `Change $0.${a}\\overline{${digits}}$ to a fraction.`,
        answer: frac(num, 990),
      };
    },
  },

  's3.4': {
    tags: ['remainders'],
    make: (r) => {
      const m = r.pick([5, 7, 9, 11, 13, 17, 19, 23]);
      const a = r.int(1, m - 1);
      const x = r.int(0, m - 1);
      const b = r.int(0, m - 1);
      const c = (a * x + b) % m;
      return {
        text: `Solve for the smallest non-negative $x$: $${a}x + ${b} \\equiv ${c} \\pmod{${m}}$`,
        answer: String(x),
      };
    },
  },

  's3.5.1': {
    tags: ['counting'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const n = r.int(3, 17);
        // 1*1! + ... + n*n! = (n+1)! - 1
        return {
          text: `Calculate $1 \\cdot 1! + 2 \\cdot 2! + \\ldots + ${n} \\cdot ${n}!$.`,
          answer: String(factorial(n + 1) - 1),
        };
      }
      if (mode === 2) {
        // Partial sum from a to n = (n+1)! - a!
        const a = r.int(2, 15);
        const n = r.int(a + 1, 17);
        return {
          text: `Calculate $${a} \\cdot ${a}! + \\ldots + ${n} \\cdot ${n}!$.`,
          answer: String(factorial(n + 1) - factorial(a)),
        };
      }
      const n = r.int(3, 17);
      const m = r.int(3, 200);
      return {
        text: `$[1 \\cdot 1! + 2 \\cdot 2! + \\ldots + ${n} \\cdot ${n}!] \\div ${m}$ has a remainder of ______`,
        answer: String((factorial(n + 1) - 1) % m),
      };
    },
  },

  's3.5.2': {
    tags: ['counting'],
    make: (r) => {
      const c = r.int(2, 17);
      const a = c + r.int(1, 8);
      const b = r.int(c, a);
      const plus = r.bool();
      if (a <= c || b < c) return null;
      const num = factorial(a) + (plus ? factorial(b) : -factorial(b));
      if (!Number.isFinite(num)) return null;
      const value = num / factorial(c);
      if (!Number.isInteger(value) || Math.abs(value) > 1e15) return null;
      return {
        text: `Calculate $\\frac{${a}! ${plus ? '+' : '-'} ${b}!}{${c}!}$.`,
        answer: String(value),
      };
    },
  },

  's3.5.3': {
    tags: ['remainders', 'number-theory'],
    make: (r) => {
      const p = r.pick(PRIMES.filter((x) => x >= 5 && x <= 1500));
      const k = r.int(1, 12);
      const mode = r.int(1, 4);
      if (mode === 1)
        return {
          text: `$(${p - 1})! \\div ${p}$ has a remainder of ______`,
          answer: String(p - 1),
        };
      if (mode === 2)
        return {
          text: `$(${p - 2})! \\div ${p}$ has a remainder of ______`,
          answer: '1',
        };
      if (mode === 3) {
        // (p-3)! mod p = (p-1)/2
        return {
          text: `$(${p - 3})! \\div ${p}$ has a remainder of ______`,
          answer: String((p - 1) / 2),
        };
      }
      // k*(p-1)! mod p = k*(p-1) mod p
      return {
        text: `$${k} \\cdot (${p - 1})! \\div ${p}$ has a remainder of ______`,
        answer: String((k * (p - 1)) % p),
      };
    },
  },

  's3.6.1': {
    tags: ['calculus'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const a = r.int(1, 20);
        const b = r.int(1, 20);
        const c = r.int(1, 20);
        const d = r.int(1, 20);
        return {
          text: `$\\lim_{x \\to \\infty} \\frac{${a}x + ${b}}{${c}x - ${d}} = $ ______`,
          answer: frac(a, c),
        };
      }
      if (mode === 2) {
        const k = r.int(2, 20);
        // (x^2 - k^2)/(x - k) -> 2k
        return {
          text: `$\\lim_{x \\to ${k}} \\frac{x^2 - ${k * k}}{x - ${k}} = $ ______`,
          answer: String(2 * k),
        };
      }
      const a = r.int(1, 12);
      const b = r.int(1, 12);
      const c = r.int(-10, 10);
      const x0 = r.int(-6, 6);
      return {
        text: `$\\lim_{x \\to ${x0}} (${a}x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}) = $ ______`,
        answer: String(a * x0 * x0 + b * x0 + c),
      };
    },
  },

  's3.6.2': {
    tags: ['calculus'],
    make: (r) => {
      const a = r.int(1, 12);
      const b = r.int(-15, 15);
      const c = r.int(-20, 20);
      const x0 = r.int(-8, 8);
      const second = r.bool(0.35);
      const poly = `${a}x^3 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x^2 ${c >= 0 ? '+' : '-'} ${Math.abs(c)}x`;
      if (second) {
        return {
          text: `If $f(x) = ${poly}$, find $f''(${x0})$.`,
          answer: String(6 * a * x0 + 2 * b),
        };
      }
      return {
        text: `If $f(x) = ${poly}$, find $f'(${x0})$.`,
        answer: String(3 * a * x0 * x0 + 2 * b * x0 + c),
      };
    },
  },

  's3.6.3': {
    tags: ['calculus'],
    make: (r) => {
      const a = r.int(1, 20);
      const n = r.int(1, 5);
      const lo = r.int(0, 6);
      const hi = lo + r.int(1, 6);
      // integral of a x^n from lo..hi
      const num = a * (Math.pow(hi, n + 1) - Math.pow(lo, n + 1));
      return {
        text: `$\\int_{${lo}}^{${hi}} ${a === 1 ? '' : a}x^{${n}}\\,dx = $ ______`,
        answer: frac(num, n + 1),
      };
    },
  },
};
