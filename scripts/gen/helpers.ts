/** Shared utilities for the question generators. */

export type Made = {
  text: string;
  answer: string;
  kind?: 'exact' | 'approximate' | 'categorical';
  requiredForm?: 'mixed' | 'fraction' | 'properFraction' | 'decimal';
};

export type Generator = {
  tags: string[];
  make: (r: Rng) => Made | null;
};

/**
 * Deterministic RNG so regenerating the bank is reproducible.
 *
 * mulberry32, which stays inside 32-bit integer math via Math.imul. A plain
 * LCG does not work here: `state * 1103515245` exceeds 2^53, so the JS float
 * multiply is inexact and the sequence collapses into a short cycle — which
 * silently caps how many distinct questions a generator can produce.
 */
export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = (seed || 1) >>> 0;
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(lo: number, hi: number): number {
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }
  pick<T>(a: readonly T[]): T {
    return a[Math.floor(this.next() * a.length)];
  }
  bool(p = 0.5): boolean {
    return this.next() < p;
  }
}

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

/** Reduced fraction as the answer key would print it. */
export function frac(p: number, q: number): string {
  if (q === 0) return 'undefined';
  if (q < 0) {
    p = -p;
    q = -q;
  }
  const g = gcd(p, q);
  p /= g;
  q /= g;
  return q === 1 ? String(p) : `${p}/${q}`;
}

/** Mixed-number form: 35 1/16. */
export function mixed(p: number, q: number): string {
  if (q < 0) {
    p = -p;
    q = -q;
  }
  const g = gcd(p, q);
  p /= g;
  q /= g;
  if (q === 1) return String(p);
  const sign = p < 0 ? '-' : '';
  const a = Math.abs(p);
  const whole = Math.floor(a / q);
  const rem = a % q;
  if (whole === 0) return `${sign}${rem}/${q}`;
  return `${sign}${whole} ${rem}/${q}`;
}

/** LaTeX fraction. */
export const tfrac = (p: number | string, q: number | string) => `\\frac{${p}}{${q}}`;

/** LaTeX mixed number: 4\frac{1}{4} */
export const tmixed = (w: number, p: number, q: number) => `${w}\\frac{${p}}{${q}}`;

function sievePrimes(limit: number): number[] {
  const composite = new Uint8Array(limit + 1);
  const out: number[] = [];
  for (let i = 2; i <= limit; i++) {
    if (composite[i]) continue;
    out.push(i);
    for (let j = i * i; j <= limit; j += i) composite[j] = 1;
  }
  return out;
}

export const PRIMES = sievePrimes(3000);

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

export function divisors(n: number): number[] {
  const out: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      out.push(i);
      if (i !== n / i) out.push(n / i);
    }
  }
  return out.sort((a, b) => a - b);
}

export function factorise(n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (m > 1) out.push([m, 1]);
  return out;
}

export function totient(n: number): number {
  let result = n;
  for (const [p] of factorise(n)) result = (result / p) * (p - 1);
  return Math.round(result);
}

export const factorial = (n: number): number => {
  let x = 1;
  for (let i = 2; i <= n; i++) x *= i;
  return x;
};

export function nCk(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i;
  return Math.round(r);
}

export function nPk(n: number, k: number): number {
  let r = 1;
  for (let i = 0; i < k; i++) r *= n - i;
  return r;
}

/** Convert a non-negative integer to a string in the given base. */
export function toBase(n: number, base: number): string {
  if (n === 0) return '0';
  const digits = '0123456789ABCDEFGHIJ';
  let out = '';
  let m = Math.abs(n);
  while (m > 0) {
    out = digits[m % base] + out;
    m = Math.floor(m / base);
  }
  return (n < 0 ? '-' : '') + out;
}

export const fromBase = (s: string, base: number) => parseInt(s, base);

const ROMAN: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export function toRoman(n: number): string {
  let out = '';
  let m = n;
  for (const [v, s] of ROMAN) {
    while (m >= v) {
      out += s;
      m -= v;
    }
  }
  return out;
}

/** Number formatted with thousands separators, matching answer-key style. */
export const comma = (n: number) => n.toLocaleString('en-US');

/** Round to a sensible number of decimals and drop trailing zeros. */
export function dec(n: number, places = 6): string {
  const s = n.toFixed(places);
  return s.replace(/\.?0+$/, '');
}

/** Fibonacci-like sequence from two seeds. */
export function fibSeq(a: number, b: number, n: number): number[] {
  const out = [a, b];
  while (out.length < n) out.push(out[out.length - 1] + out[out.length - 2]);
  return out.slice(0, n);
}
