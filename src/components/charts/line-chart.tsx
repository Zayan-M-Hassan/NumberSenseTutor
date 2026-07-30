'use client';

import { useId, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export type Point = { label: string; value: number };

/**
 * A single-series line chart. One series means no legend is needed — the title
 * names it — and there is no categorical adjacency to worry about.
 *
 * Ships a crosshair and tooltip by default: an SVG chart in a page is
 * interactive, so it behaves that way.
 */
export function LineChart({
  data,
  unit = '',
  domain,
  color = 'var(--chart-line)',
  height = 160,
  reference,
  referenceLabel,
}: {
  data: Point[];
  unit?: string;
  domain?: [number, number];
  color?: string;
  height?: number;
  reference?: number;
  referenceLabel?: string;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = height;
  const PAD = { top: 12, right: 12, bottom: 22, left: 34 };

  const { lo, hi } = useMemo(() => {
    if (domain) return { lo: domain[0], hi: domain[1] };
    const values = data.map((d) => d.value);
    if (reference !== undefined) values.push(reference);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.15 || 1;
    return { lo: Math.max(0, min - pad), hi: max + pad };
  }, [data, domain, reference]);

  if (data.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-ink-soft">
        Two sessions are needed before a trend means anything.
      </p>
    );
  }

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo || 1)) * (H - PAD.top - PAD.bottom);

  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const ticks = [lo, (lo + hi) / 2, hi];

  return (
    <figure className="mt-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        style={{ height }}
        role="img"
        aria-labelledby={`${id}-desc`}
        onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(
            ((px - PAD.left) / (W - PAD.left - PAD.right)) * (data.length - 1)
          );
          setHover(Math.max(0, Math.min(data.length - 1, i)));
        }}
      >
        <desc id={`${id}-desc`}>
          Line chart of {data.length} sessions, from {data[0].label} to {data[data.length - 1].label}.
        </desc>

        {/* Recessive gridlines. */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="hsl(var(--rule))"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y(t) + 3.5}
              textAnchor="end"
              className="fill-[hsl(var(--ink-faint))] font-mono text-[9px]"
            >
              {Math.round(t)}
            </text>
          </g>
        ))}

        {reference !== undefined && (
          <g>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(reference)}
              y2={y(reference)}
              stroke="hsl(var(--approx))"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {referenceLabel && (
              <text
                x={W - PAD.right}
                y={y(reference) - 5}
                textAnchor="end"
                className="fill-[hsl(var(--approx))] font-mono text-[9px]"
              >
                {referenceLabel}
              </text>
            )}
          </g>
        )}

        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Crosshair. */}
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="hsl(var(--rule-strong))"
              strokeWidth={1}
            />
            {/* 2px surface ring so the marker reads over the line. */}
            <circle cx={x(hover)} cy={y(data[hover].value)} r={5} fill={color} stroke="hsl(var(--card))" strokeWidth={2} />
          </g>
        )}

        <text
          x={PAD.left}
          y={H - 6}
          className="fill-[hsl(var(--ink-faint))] font-mono text-[9px]"
        >
          {data[0].label}
        </text>
        <text
          x={W - PAD.right}
          y={H - 6}
          textAnchor="end"
          className="fill-[hsl(var(--ink-faint))] font-mono text-[9px]"
        >
          {data[data.length - 1].label}
        </text>
      </svg>

      <figcaption
        className={cn(
          'tabular mt-1 h-5 font-mono text-xs',
          hover === null ? 'text-ink-faint' : 'text-ink'
        )}
        aria-live="polite"
      >
        {hover === null
          ? `${data.length} sessions`
          : `${data[hover].label} — ${data[hover].value}${unit}`}
      </figcaption>
    </figure>
  );
}
