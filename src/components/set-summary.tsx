'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ReviewEntry } from '@/lib/types';
import { Latex } from '@/components/ui/latex';
import { cn } from '@/lib/utils';

/** Shown when a practice set ends, whether it ran out or you stopped it. */
export function SetSummary({
  topicId,
  topicName,
  stats,
  review,
  onAgain,
}: {
  topicId: string;
  topicName: string;
  stats: { attempted: number; correct: number; totalTime: number };
  review: ReviewEntry[];
  onAgain: () => void;
}) {
  const accuracy = stats.attempted ? Math.round((stats.correct / stats.attempted) * 100) : 0;
  const pace = stats.attempted ? stats.totalTime / stats.attempted : 0;
  const onPace = pace > 0 && pace <= 7.5;
  const missed = review.filter((r) => !r.correct);

  // What you review is what you got wrong, so that is what opens.
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? review : missed;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-16">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">Set complete</p>
      <h1 className="mt-2 font-question text-3xl text-ink">{topicName}</h1>

      <dl className="mt-10 divide-y divide-rule border-y border-rule">
        <Row label="Score" value={`${stats.correct} / ${stats.attempted}`} />
        <Row label="Accuracy" value={`${accuracy}%`} />
        <Row
          label="Pace"
          value={`${pace.toFixed(1)}s`}
          note={onPace ? 'inside contest pace' : 'contest pace is 7.5s'}
          tone={onPace ? 'good' : 'warn'}
        />
      </dl>

      {review.length > 0 && (
        <section className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              {missed.length === 0
                ? 'Answer key'
                : `${missed.length} missed`}
            </h2>
            {review.length > missed.length && (
              <button
                onClick={() => setShowAll((s) => !s)}
                className="font-mono text-xs uppercase tracking-wider text-ink-faint transition-colors hover:text-ink"
                aria-pressed={showAll}
              >
                {showAll ? 'Show only missed' : `Show all ${review.length}`}
              </button>
            )}
          </div>

          {shown.length === 0 ? (
            <p className="mt-4 border-y border-rule py-5 font-question text-lg text-correct">
              Clean sheet — every one right.
            </p>
          ) : (
            <ol className="mt-4">
              {shown.map((entry) => {
                // Number by position in the set, the way a key is numbered.
                const n = review.indexOf(entry) + 1;
                return (
                  <li key={`${entry.questionId}-${n}`} className="border-t border-rule last:border-b">
                    <div className="flex gap-4 py-4">
                      <span className="tabular w-7 shrink-0 pt-0.5 font-mono text-xs text-ink-faint">
                        {n}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="relative">
                          {entry.starred && (
                            <span className="star-mark absolute -left-3 top-0 text-sm" aria-hidden>
                              *
                            </span>
                          )}
                          <Latex
                            as="div"
                            content={entry.text}
                            className="font-question text-[1.0625rem] leading-snug text-ink"
                          />
                        </div>

                        <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm">
                          {entry.correct ? (
                            <span className="text-correct">{entry.response}</span>
                          ) : (
                            <>
                              <span className="text-wrong line-through decoration-wrong/50">
                                {entry.response || '—'}
                              </span>
                              <span aria-hidden className="text-ink-faint">
                                &rarr;
                              </span>
                              <span className="text-ink">{entry.expected}</span>
                            </>
                          )}
                          <span className="tabular ml-auto text-xs text-ink-faint">
                            {entry.timeTaken.toFixed(1)}s
                          </span>
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <button
          onClick={onAgain}
          className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
        >
          Another set
        </button>
        <Link
          href={`/topics/${topicId}`}
          className="rounded-sm border border-rule-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          Read the trick
        </Link>
        <Link href="/" className="px-1 text-sm text-ink-soft transition-colors hover:text-ink">
          All topics
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: 'good' | 'warn';
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="flex items-baseline gap-3">
        {note && (
          <span className={cn('text-xs', tone === 'good' ? 'text-correct' : 'text-approx')}>
            {note}
          </span>
        )}
        <span className="tabular font-mono text-xl text-ink">{value}</span>
      </dd>
    </div>
  );
}
