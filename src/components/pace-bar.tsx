'use client';

import { cn } from '@/lib/utils';

/**
 * The contest allots 10 minutes for 80 questions — 7.5 seconds each. This shows
 * that budget draining rather than a number counting up, so pace is something
 * you feel instead of something you calculate.
 *
 * It never blocks or penalises: practice is untimed. Past the budget the bar
 * stays full and shifts colour.
 */
export function PaceBar({
  elapsed,
  target = 7.5,
  frozen = false,
  className,
}: {
  elapsed: number;
  target?: number;
  frozen?: boolean;
  className?: string;
}) {
  const ratio = Math.min(1, elapsed / target);
  const over = elapsed > target;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="h-px flex-1 bg-rule"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.round(target)}
        aria-valuenow={Math.min(Math.round(elapsed), Math.round(target))}
        aria-label="Time against the 7.5 second contest pace"
      >
        <div
          className={cn(
            'h-px origin-left transition-[transform,background-color] duration-100 ease-linear',
            over ? 'bg-approx' : 'bg-ink-soft',
            frozen && 'opacity-40'
          )}
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
      <span
        className={cn(
          'tabular w-12 text-right font-mono text-xs',
          over ? 'text-approx' : 'text-ink-faint'
        )}
      >
        {elapsed.toFixed(1)}s
      </span>
    </div>
  );
}
