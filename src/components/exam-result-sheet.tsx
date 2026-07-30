'use client';

import Link from 'next/link';
import type { ExamQuestion, ExamResult } from '@/lib/types';
import { scoreIfStoppedAtLastCorrect } from '@/lib/exam';
import { cn } from '@/lib/utils';

export function ExamResultSheet({
  result,
  paper,
}: {
  result: ExamResult;
  paper: ExamQuestion[];
}) {
  const scored = result.correct + result.wrong + result.skippedPenalised;
  const accuracy = scored ? Math.round((result.correct / scored) * 100) : 0;
  const answeredTime = result.answers.reduce((n, a) => n + a.timeTaken, 0);
  const pace = result.answers.length ? answeredTime / result.answers.length : 0;
  const ifStopped = scoreIfStoppedAtLastCorrect(result.answers);

  const byPosition = new Map(paper.map((q) => [q.position, q]));
  const missedByTopic = new Map<string, { name: string; id: string; missed: number }>();
  for (const a of result.answers) {
    if (a.correct) continue;
    const q = byPosition.get(a.position);
    if (!q) continue;
    const entry = missedByTopic.get(q.topicId) ?? { name: q.topicName, id: q.topicId, missed: 0 };
    entry.missed++;
    missedByTopic.set(q.topicId, entry);
  }
  const weakest = [...missedByTopic.values()].sort((a, b) => b.missed - a.missed).slice(0, 6);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-16">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">Result</p>
      <div className="mt-3 flex items-baseline gap-4">
        <span className="tabular font-mono text-6xl font-medium tracking-tight text-ink">
          {result.score}
        </span>
        <span className="text-sm text-ink-soft">points</span>
      </div>

      {/* The arithmetic, shown, so the scoring rule is legible. */}
      <dl className="mt-10 divide-y divide-rule border-y border-rule">
        <Line label="Correct" count={result.correct} each={5} tone="good" />
        <Line label="Wrong" count={result.wrong} each={-4} tone="bad" />
        <Line
          label="Skipped before your last answer"
          count={result.skippedPenalised}
          each={-4}
          tone="bad"
        />
        <Line label="Past your last answer — not scored" count={result.unscoredTail} each={0} />
      </dl>

      <dl className="mt-8 grid grid-cols-3 gap-6">
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Reached" value={`#${result.lastAttempted}`} />
        <Stat
          label="Pace"
          value={`${pace.toFixed(1)}s`}
          tone={pace > 0 && pace <= 7.5 ? 'good' : 'warn'}
        />
      </dl>

      {ifStopped > result.score && (
        <p className="mt-8 border-l-2 border-approx pl-4 text-[0.9375rem] leading-relaxed text-ink-soft">
          Had you stopped after your last correct answer, you would have scored{' '}
          <span className="tabular font-mono text-ink">{ifStopped}</span>. Everything after that
          point cost you {ifStopped - result.score} points.
        </p>
      )}

      {weakest.length > 0 && (
        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
            Where you lost points
          </h2>
          <ul className="mt-4">
            {weakest.map((t) => (
              <li key={t.id} className="border-t border-rule last:border-b">
                <Link
                  href={`/topics/${t.id}`}
                  className="flex items-center gap-4 py-3 transition-colors hover:bg-surface"
                >
                  <span className="min-w-0 flex-1 truncate font-question text-[1.0625rem] text-ink">
                    {t.name}
                  </span>
                  <span className="tabular shrink-0 font-mono text-xs text-approx">
                    {t.missed} missed
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/exam"
          className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
        >
          Another test
        </Link>
        <Link
          href="/"
          className="rounded-sm border border-rule-strong px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          Back to topics
        </Link>
      </div>
    </div>
  );
}

function Line({
  label,
  count,
  each,
  tone,
}: {
  label: string;
  count: number;
  each: number;
  tone?: 'good' | 'bad';
}) {
  const total = count * each;
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="tabular flex items-baseline gap-4 font-mono text-sm">
        <span className="text-ink-faint">
          {count}
          {each !== 0 && ` × ${each > 0 ? '+' : ''}${each}`}
        </span>
        <span
          className={cn(
            'w-14 text-right',
            tone === 'good' ? 'text-correct' : tone === 'bad' && total !== 0 ? 'text-wrong' : 'text-ink-faint'
          )}
        >
          {each === 0 ? '—' : total > 0 ? `+${total}` : total}
        </span>
      </dd>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'warn' }) {
  return (
    <div>
      <dt className="font-mono text-[0.6875rem] uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd
        className={cn(
          'tabular mt-1 font-mono text-lg',
          tone === 'good' ? 'text-correct' : tone === 'warn' ? 'text-approx' : 'text-ink'
        )}
      >
        {value}
      </dd>
    </div>
  );
}
