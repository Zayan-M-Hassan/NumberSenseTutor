'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/**
 * The hero states the contest as it actually is, and then demonstrates it: the
 * rule under the numbers drains on a real 7.5-second loop, the exact budget you
 * get per question. You feel the tempo before you read a word about it.
 */
export function PaceThesis() {
  const [ratio, setRatio] = useState(0);
  const start = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setRatio(1);
      return;
    }
    let raf = 0;
    start.current = performance.now();
    const tick = (now: number) => {
      const t = ((now - start.current) / 7500) % 1;
      setRatio(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="pt-16 sm:pt-24">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-ink">
        <Figure value="80" label="questions" />
        <Figure value="10" label="minutes" />
        <Figure value="7.5" label="seconds each" accent />
      </div>

      {/* The budget, draining. */}
      <div className="mt-5 h-px w-full bg-rule" aria-hidden>
        <div
          className="h-px origin-left bg-approx"
          style={{ transform: `scaleX(${1 - ratio})` }}
        />
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/exam"
          className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
        >
          Take a full test
        </Link>
      </div>
    </section>
  );
}

function Figure({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <span
        className={`tabular text-5xl font-medium tracking-tight sm:text-6xl ${
          accent ? 'text-approx' : 'text-ink'
        }`}
      >
        {value}
      </span>
      <span className="ml-2 text-xs uppercase tracking-[0.16em] text-ink-faint">{label}</span>
    </div>
  );
}
