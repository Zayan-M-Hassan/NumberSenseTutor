'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useProgress } from '@/hooks/use-progress';
import { BarList } from '@/components/charts/bar-list';
import { LineChart, type Point } from '@/components/charts/line-chart';

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export function StatsView({ topicNames }: { topicNames: Record<string, string> }) {
  const { progress, loaded } = useProgress();
  const [showTable, setShowTable] = useState(false);

  const history = progress.history;

  const totals = useMemo(() => {
    let attempted = 0;
    let correct = 0;
    let time = 0;
    for (const t of Object.values(progress.topics)) {
      attempted += t.overall.attempted;
      correct += t.overall.correct;
    }
    for (const h of history) time += h.totalTime;
    const answeredInHistory = history.reduce((n, h) => n + h.attempted, 0);
    return {
      attempted,
      correct,
      accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
      pace: answeredInHistory ? time / answeredInHistory : 0,
    };
  }, [progress.topics, history]);

  const accuracySeries: Point[] = useMemo(
    () =>
      history
        .filter((h) => h.attempted > 0)
        .map((h) => ({ label: shortDate(h.date), value: Math.round((h.correct / h.attempted) * 100) })),
    [history]
  );

  const paceSeries: Point[] = useMemo(
    () =>
      history
        .filter((h) => h.attempted > 0)
        .map((h) => ({ label: shortDate(h.date), value: +(h.totalTime / h.attempted).toFixed(1) })),
    [history]
  );

  const weakest = useMemo(
    () =>
      Object.entries(progress.topics)
        .filter(([, p]) => p.overall.attempted >= 5)
        .map(([id, p]) => ({
          id,
          label: topicNames[id] ?? id,
          value: Math.round((p.overall.correct / p.overall.attempted) * 100),
          caption: `${p.overall.correct} of ${p.overall.attempted}`,
        }))
        .sort((a, b) => a.value - b.value)
        .slice(0, 8),
    [progress.topics, topicNames]
  );

  if (!loaded) return <div className="mx-auto max-w-2xl px-5 py-24" />;

  if (totals.attempted === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-16">
        <h1 className="font-question text-3xl text-ink">Stats</h1>
        <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
          Nothing here yet. Finish a practice set and your accuracy, pace and weakest topics start
          building up.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
        >
          Pick a topic
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-16">
      <h1 className="font-question text-3xl text-ink">Stats</h1>

      <dl className="mt-10 grid grid-cols-3 gap-6 border-y border-rule py-5">
        <Tile label="Answered" value={totals.attempted.toLocaleString()} />
        <Tile label="Accuracy" value={`${totals.accuracy}%`} />
        <Tile
          label="Pace"
          value={totals.pace ? `${totals.pace.toFixed(1)}s` : '—'}
          tone={totals.pace && totals.pace <= 7.5 ? 'good' : 'warn'}
        />
      </dl>

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
          Accuracy per set
        </h2>
        <LineChart data={accuracySeries} unit="%" domain={[0, 100]} color="hsl(var(--exact))" />
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
          Seconds per question
        </h2>
        <LineChart
          data={paceSeries}
          unit="s"
          color="hsl(var(--exact))"
          reference={7.5}
          referenceLabel="contest pace"
        />
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
          Weakest topics
        </h2>
        <p className="mt-2 text-sm text-ink-soft">Accuracy across everything you have answered.</p>
        <BarList items={weakest} unit="%" hrefBase="/topics" max={100} />
      </section>

      {history.length > 0 && (
        <section className="mt-14">
          <button
            onClick={() => setShowTable((s) => !s)}
            className="font-mono text-xs uppercase tracking-wider text-ink-faint transition-colors hover:text-ink"
            aria-expanded={showTable}
          >
            {showTable ? 'Hide' : 'Show'} the numbers
          </button>

          {showTable && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-rule">
                    {['Date', 'Topic', 'Score', 'Pace'].map((h) => (
                      <th
                        key={h}
                        className="py-2 pr-4 font-mono text-[0.6875rem] font-normal uppercase tracking-wider text-ink-faint"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((h, i) => (
                    <tr key={i} className="border-b border-rule">
                      <td className="tabular py-2 pr-4 font-mono text-xs text-ink-soft">
                        {shortDate(h.date)}
                      </td>
                      <td className="max-w-[14rem] truncate py-2 pr-4 text-sm text-ink">
                        {topicNames[h.topicId] ?? h.topicId}
                      </td>
                      <td className="tabular py-2 pr-4 font-mono text-xs text-ink">
                        {h.correct}/{h.attempted}
                      </td>
                      <td className="tabular py-2 font-mono text-xs text-ink-soft">
                        {(h.totalTime / h.attempted).toFixed(1)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'warn' }) {
  return (
    <div>
      <dt className="font-mono text-[0.6875rem] uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd
        className={`tabular mt-1 font-mono text-2xl ${
          tone === 'good' ? 'text-correct' : tone === 'warn' ? 'text-approx' : 'text-ink'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
