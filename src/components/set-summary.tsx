'use client';

import Link from 'next/link';
/** Shown when a practice set runs out of questions. */
export function SetSummary({
  topicId,
  topicName,
  stats,
  onAgain,
}: {
  topicId: string;
  topicName: string;
  stats: { attempted: number; correct: number; totalTime: number };
  onAgain: () => void;
}) {
  const accuracy = stats.attempted ? Math.round((stats.correct / stats.attempted) * 100) : 0;
  const pace = stats.attempted ? stats.totalTime / stats.attempted : 0;
  const onPace = pace > 0 && pace <= 7.5;

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

      <div className="mt-8 flex flex-wrap items-center gap-3">
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
          <span
            className={
              tone === 'good' ? 'text-xs text-correct' : 'text-xs text-approx'
            }
          >
            {note}
          </span>
        )}
        <span className="tabular font-mono text-xl text-ink">{value}</span>
      </dd>
    </div>
  );
}
