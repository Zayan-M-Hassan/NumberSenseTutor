import { Generator, frac, gcd, mixed, totient } from './helpers';

/**
 * Section 5 — types that appear on real UIL papers but were missing from the
 * source book. Ranges are wide enough to yield 1,000 distinct questions each.
 *
 * Conversion constants calibrated against real 2025 answer keys:
 *   1 vara = 25/27 yards · 1 league = 4,428.4 acres · 1 ft/s = 15/22 mph
 */
export const S5: Record<string, Generator> = {
  's5.1.1': {
    tags: ['algebra'],
    make: (r) => {
      const a = r.int(2, 12);
      const b = r.int(1, 9);
      const d = r.int(2, 12);
      const x = r.int(-12, 14);
      const y = r.int(-12, 14);
      const c = a * x + b * y;
      const e = d * x - b * y;
      const askY = r.bool();
      return {
        text: `Let $${a}x + ${b}y = ${c}$ and $${d}x - ${b}y = ${e}$. Find $${askY ? 'y' : 'x'}$.`,
        answer: String(askY ? y : x),
      };
    },
  },

  's5.1.2': {
    tags: ['coordinate-geometry'],
    make: (r) => {
      const a = r.int(-18, 18);
      const b = r.int(-18, 18);
      const mode = r.int(1, 5);
      if (mode === 1)
        return {
          text: `The point $(${a}, ${b})$ is reflected across the line $y = x$ to the point $(h, k)$. Find $h - k$.`,
          answer: String(b - a),
        };
      if (mode === 2)
        return {
          text: `The point $(${a}, ${b})$ is reflected across the $x$-axis to the point $(h, k)$. Find $h + k$.`,
          answer: String(a - b),
        };
      if (mode === 3)
        return {
          text: `The point $(${a}, ${b})$ is reflected across the line $y = -x$ to the point $(h, k)$. Find $h + k$.`,
          answer: String(-b - a),
        };
      const c = r.int(-18, 18);
      const d = r.int(-18, 18);
      if (mode === 4)
        return {
          text: `The midpoint of $(${a}, ${b})$ and $(${c}, ${d})$ is $(h, k)$. Find $h + k$.`,
          answer: frac(a + b + c + d, 2),
        };
      return {
        text: `The distance between $(${a}, ${b})$ and $(${c}, ${d})$ is $k$. Find $k^2$.`,
        answer: String((a - c) ** 2 + (b - d) ** 2),
      };
    },
  },

  's5.1.3': {
    tags: ['coordinate-geometry'],
    make: (r) => {
      const a = r.int(-90, 90);
      if (a === 0) return null;
      const horiz = r.bool();
      const mode = r.int(1, 3);
      const coeff = a === 1 ? '' : a === -1 ? '-' : String(a);
      const eqn = horiz ? `x = ${coeff}y^2` : `y = ${coeff}x^2`;
      const axis = horiz ? 'x' : 'y';
      if (mode === 1)
        return { text: `The directrix of $${eqn}$ is $${axis} = $ ______`, answer: frac(-1, 4 * a) };
      if (mode === 2)
        return {
          text: `The focus of $${eqn}$ is at $(${horiz ? 'k, 0' : '0, k'})$. Find $k$.`,
          answer: frac(1, 4 * a),
        };
      return {
        text: `The latus rectum of $${eqn}$ has length $k$. Find $k$.`,
        answer: frac(1, Math.abs(a)),
      };
    },
  },

  's5.1.4': {
    tags: ['coordinate-geometry'],
    make: (r) => {
      const a = r.int(-15, 15);
      const b = r.int(-15, 15);
      const c = r.int(-15, 15);
      const d = r.int(-15, 15);
      const dx = c - a;
      const dy = d - b;
      const mode = r.int(1, 3);
      if (mode === 1)
        return {
          text: `The initial point of vector $v$ is $(${a}, ${b})$ and the terminal point is $(${c}, ${d})$. If $|v| = k$, then $k^2 = $ ______`,
          answer: String(dx * dx + dy * dy),
        };
      if (mode === 2)
        return {
          text: `The initial point of vector $v$ is $(${a}, ${b})$ and the terminal point is $(${c}, ${d})$. If $v = \\langle h, k \\rangle$, find $h + k$.`,
          answer: String(dx + dy),
        };
      return {
        text: `Find the dot product of $\\langle ${a}, ${b} \\rangle$ and $\\langle ${c}, ${d} \\rangle$.`,
        answer: String(a * c + b * d),
      };
    },
  },

  's5.1.5': {
    tags: ['matrices'],
    make: (r) => {
      if (r.bool(0.55)) {
        const a = r.int(-15, 15);
        const b = r.int(-15, 15);
        const c = r.int(-15, 15);
        const d = r.int(-15, 15);
        return {
          text: `If $A = \\begin{bmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{bmatrix}$, then $|A| = $ ______`,
          answer: String(a * d - b * c),
        };
      }
      const m = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => r.int(-6, 6)));
      const [[a, b, c], [d, e, f], [g, h, i]] = m;
      const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
      return {
        text: `If $A = \\begin{bmatrix} ${a} & ${b} & ${c} \\\\ ${d} & ${e} & ${f} \\\\ ${g} & ${h} & ${i} \\end{bmatrix}$, then $|A| = $ ______`,
        answer: String(det),
      };
    },
  },

  's5.1.6': {
    tags: ['trigonometry'],
    make: (r) => {
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
      const asec: Array<[string, string]> = [
        ['2', '1/3'], ['-2', '2/3'], ['1', '0'], ['-1', '1'],
        ['\\sqrt{2}', '1/4'], ['-\\sqrt{2}', '3/4'],
      ];
      const which = r.int(1, 5);
      const [fn, table] =
        which === 1 ? (['Arcsin', asin] as const)
          : which === 2 ? (['Arccos', acos] as const)
            : which === 3 ? (['Arctan', atan] as const)
              : which === 4 ? (['Arccsc', acsc] as const)
                : (['Arcsec', asec] as const);
      const [arg, k] = r.pick(table as Array<[string, string]>);
      // Scale by an integer so the space is large enough.
      const m = r.int(1, 40);
      const [p, q] = k.includes('/') ? k.split('/').map(Number) : [Number(k), 1];
      if (m === 1)
        return { text: `$\\text{${fn}}\\left(${arg}\\right) = k\\pi$ radians. Find $k$.`, answer: k };
      return {
        text: `$${m}\\,\\text{${fn}}\\left(${arg}\\right) = k\\pi$ radians. Find $k$.`,
        answer: frac(m * p, q),
      };
    },
  },

  's5.1.7': {
    tags: ['calculus'],
    make: (r) => {
      const m = r.int(1, 4);
      const n = r.int(1, 4);
      const a = 0;
      const b = r.int(1, 7);
      const c = r.int(0, 5);
      const d = c + r.int(1, 5);
      const ixNum = Math.pow(b, m + 1) - Math.pow(a, m + 1);
      const iyNum = Math.pow(d, n + 1) - Math.pow(c, n + 1);
      const num = ixNum * iyNum;
      const den = (m + 1) * (n + 1);
      const xs = m === 1 ? 'x' : `x^{${m}}`;
      const ys = n === 1 ? 'y' : `y^{${n}}`;
      return {
        text: `$\\int_{${a}}^{${b}} \\int_{${c}}^{${d}} ${xs}${ys}\\,dy\\,dx = $ ______`,
        answer: frac(num, den),
      };
    },
  },

  's5.2.1': {
    tags: ['conversions'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const v = r.int(100, 99999);
        return {
          text: `*${v.toLocaleString('en-US')} varas (Texas) = ______ yards`,
          answer: String(Math.round((v * 25) / 27)),
          kind: 'approximate',
        };
      }
      if (mode === 2) {
        const whole = r.int(1, 40);
        const n = r.int(1, 3);
        const dd = r.pick([2, 4]);
        return {
          text: `*$${whole}\\frac{${n}}{${dd}}$ "leagues of land" in Texas is ______ acres`,
          answer: String(Math.round((whole + n / dd) * 4428.4)),
          kind: 'approximate',
        };
      }
      const labors = r.int(2, 400);
      return {
        text: `*${labors} labors (Texas) = ______ acres`,
        answer: String(Math.round(labors * 177.1)),
        kind: 'approximate',
      };
    },
  },

  's5.2.2': {
    tags: ['conversions'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const mph = 15 * r.int(1, 400);
        return { text: `${mph} miles per hour = ______ feet per second`, answer: frac(mph * 22, 15) };
      }
      if (mode === 2) {
        const fps = 22 * r.int(1, 400);
        return { text: `${fps} feet per second = ______ miles per hour`, answer: frac(fps * 15, 22) };
      }
      const mps = r.int(2, 600);
      return {
        text: `${mps} miles per hour = ______ miles per minute`,
        answer: frac(mps, 60),
      };
    },
  },

  's5.2.3': {
    tags: ['number-theory'],
    make: (r) => {
      const n = r.int(3, 900);
      const mode = r.int(1, 3);
      if (mode === 1)
        return {
          text: `How many positive integers less than ${n} are relatively prime to ${n}?`,
          answer: String(totient(n)),
        };
      if (mode === 2) {
        let c = 0;
        for (let k = 2; k < n; k++) if (gcd(k, n) === 1) c++;
        return {
          text: `How many integers greater than 1 and less than ${n} are relatively prime to ${n}?`,
          answer: String(c),
        };
      }
      return { text: `$\\phi(${n}) = $ ______`, answer: String(totient(n)) };
    },
  },

  's5.2.4': {
    tags: ['geometry'],
    make: (r) => {
      const w = r.int(2, 40);
      const h = r.int(2, 40);
      const k = r.int(2, 12);
      const which = r.int(1, 3);
      if (which === 1)
        return {
          text: `A ${w} by ${h} inch picture is enlarged to ${w * k} by ${h * k} inches. Its perimeter is multiplied by ______`,
          answer: String(k),
        };
      if (which === 2)
        return {
          text: `A ${w} by ${h} inch picture is enlarged to ${w * k} by ${h * k} inches. Its area is multiplied by ______`,
          answer: String(k * k),
        };
      return {
        text: `If every edge of a rectangular solid with dimensions ${w} by ${h} by ${w} is multiplied by ${k}, its volume is multiplied by ______`,
        answer: String(k ** 3),
      };
    },
  },

  's5.2.5': {
    tags: ['statistics'],
    make: (r) => {
      const n = r.int(5, 9);
      const vals = Array.from({ length: n }, () => r.int(0, 20));
      vals[r.int(0, n - 1)] = vals[0];
      const sorted = [...vals].sort((a, b) => a - b);
      const counts = new Map<number, number>();
      sorted.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
      let mode = sorted[0];
      let best = 0;
      counts.forEach((c, v) => {
        if (c > best) {
          best = c;
          mode = v;
        }
      });
      if (best < 2) return null;
      const range = sorted[sorted.length - 1] - sorted[0];
      const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      const sum = vals.reduce((a, b) => a + b, 0);
      const set = `\\{${vals.join(', ')}\\}`;
      const which = r.int(1, 4);
      if (which === 1)
        return { text: `The range of the set $${set}$ minus its mode is ______`, answer: String(range - mode) };
      if (which === 2)
        return { text: `The median of the set $${set}$ is ______`, answer: frac(median * 2, 2) };
      if (which === 3) return { text: `The mean of the set $${set}$ is ______`, answer: frac(sum, n) };
      return { text: `The mode of the set $${set}$ is ______`, answer: String(mode) };
    },
  },

  's5.2.6': {
    tags: ['counting'],
    make: (r) => {
      const mode = r.int(1, 3);
      if (mode === 1) {
        const s = r.int(1, 27);
        let count = 0;
        for (let a = 1; a <= 9; a++)
          for (let b = 0; b <= 9; b++) {
            const c = s - a - b;
            if (c >= 0 && c <= 9) count++;
          }
        return {
          text: `The sum of the digits of a 3-digit number is ${s}. How many such numbers exist?`,
          answer: String(count),
        };
      }
      if (mode === 2) {
        const s = r.int(1, 18);
        let count = 0;
        for (let a = 1; a <= 9; a++) {
          const b = s - a;
          if (b >= 0 && b <= 9) count++;
        }
        return {
          text: `The sum of the digits of a 2-digit number is ${s}. How many such numbers exist?`,
          answer: String(count),
        };
      }
      const len = r.int(2, 9);
      const s = r.int(1, 9 * len);
      const variant = r.int(1, 3); // 1: any · 2: no zero digits · 3: even
      const noZero = variant === 2;
      const evenOnly = variant === 3;

      // Count len-digit numbers whose digits sum to s, under the constraint.
      // The last digit is handled separately when the number must be even.
      const digitsToFill = evenOnly ? len - 1 : len;
      let ways = [1];
      for (let pos = 0; pos < digitsToFill; pos++) {
        const next = new Array(ways.length + 9).fill(0);
        const lowDigit = pos === 0 || noZero ? 1 : 0;
        for (let t = 0; t < ways.length; t++) {
          if (!ways[t]) continue;
          for (let d2 = lowDigit; d2 <= 9; d2++) next[t + d2] += ways[t];
        }
        ways = next;
      }

      let count = 0;
      if (evenOnly) {
        for (const last of [0, 2, 4, 6, 8]) {
          const need = s - last;
          if (need >= 0 && need < ways.length) count += ways[need];
        }
      } else {
        count = ways[s] ?? 0;
      }
      if (!count) return null;

      const label = noZero
        ? `a ${len}-digit number containing no zeros`
        : evenOnly
          ? `an even ${len}-digit number`
          : `a ${len}-digit number`;
      return {
        text: `The sum of the digits of ${label} is ${s}. How many such numbers exist?`,
        answer: String(count),
      };
    },
  },
};
