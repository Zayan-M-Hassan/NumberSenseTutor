'use client';

import Link from 'next/link';

export type BarItem = { id: string; label: string; value: number; caption?: string };

/**
 * Horizontal bars for a magnitude comparison across named categories.
 * One measure, one hue — rank never changes the colour.
 *
 * Values are labelled directly, so identity never rests on colour alone.
 */
export function BarList({
  items,
  unit = '',
  hrefBase,
  max: maxProp,
}: {
  items: BarItem[];
  unit?: string;
  hrefBase?: string;
  max?: number;
}) {
  if (items.length === 0) {
    return <p className="py-8 text-sm text-ink-soft">Nothing to show yet.</p>;
  }
  const max = maxProp ?? Math.max(...items.map((i) => i.value));

  return (
    <ul className="mt-4">
      {items.map((item) => {
        const pct = max ? (item.value / max) * 100 : 0;
        const row = (
          <>
            <span className="flex items-baseline justify-between gap-4">
              <span className="min-w-0 flex-1 truncate font-question text-[0.9375rem] text-ink">
                {item.label}
              </span>
              <span className="tabular shrink-0 font-mono text-xs text-ink-soft">
                {item.value}
                {unit}
              </span>
            </span>
            <span className="mt-1.5 block h-1.5 w-full rounded-[1px] bg-surface">
              {/* 4px rounded data-end, anchored to the baseline. */}
              <span
                className="block h-1.5 rounded-r-[4px] bg-[hsl(var(--exact))]"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </span>
            {item.caption && (
              <span className="mt-1 block font-mono text-[0.6875rem] text-ink-faint">
                {item.caption}
              </span>
            )}
          </>
        );

        return (
          <li key={item.id} className="border-t border-rule py-3 last:border-b">
            {hrefBase ? (
              <Link href={`${hrefBase}/${item.id}`} className="block transition-opacity hover:opacity-75">
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  );
}
