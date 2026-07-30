'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { TopicSummary } from '@/lib/types';
import { topicCoverage, topicStatus, useProgress } from '@/hooks/use-progress';
import { cn } from '@/lib/utils';

type Section = { key: string; title: string; blurb: string; topics: TopicSummary[] };
type Filter = 'all' | 'unstarted' | 'in-progress' | 'weak';

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unstarted', label: 'Not started' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'weak', label: 'Weakest' },
];

export function TopicIndex({ sections }: { sections: Section[] }) {
  const { getTopicProgress, loaded } = useProgress();
  const [filter, setFilter] = useState<Filter>('all');

  const keep = (t: TopicSummary) => {
    if (filter === 'all') return true;
    const p = getTopicProgress(t.id);
    const status = topicStatus(p, t.questionCount);
    if (filter === 'unstarted') return status === 'Not Started';
    if (filter === 'in-progress') return status === 'In Progress';
    // Weakest: practised, and under 70% accuracy.
    if (p.overall.attempted < 5) return false;
    return p.overall.correct / p.overall.attempted < 0.7;
  };

  const visible = sections
    .map((s) => ({ ...s, topics: s.topics.filter(keep) }))
    .filter((s) => s.topics.length > 0);

  return (
    <div className="mt-20">
      <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-rule pb-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'font-mono text-xs uppercase tracking-wider transition-colors',
              filter === f.id ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
            )}
            aria-pressed={filter === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-16 text-center text-sm text-ink-soft">
          Nothing here yet. Practise a few topics and they will show up.
        </p>
      )}

      {visible.map((section) => (
        <section key={section.key} className="mt-14 first:mt-10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-approx">
              {section.key}
            </span>
            <h2 className="font-question text-xl text-ink">{section.title}</h2>
          </div>
          <p className="mt-1 max-w-lg text-sm text-ink-soft">{section.blurb}</p>

          <ul className="mt-5">
            {section.topics.map((t) => {
              const p = getTopicProgress(t.id);
              const coverage = loaded ? topicCoverage(p, t.questionCount) : 0;
              const accuracy = p.overall.attempted
                ? Math.round((p.overall.correct / p.overall.attempted) * 100)
                : null;
              const status = topicStatus(p, t.questionCount);

              return (
                <li key={t.id} className="border-t border-rule last:border-b">
                  <Link
                    href={`/topics/${t.id}`}
                    className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-surface"
                  >
                    <span className="tabular w-14 shrink-0 font-mono text-xs text-ink-faint">
                      {t.id}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-question text-[1.0625rem] text-ink">
                        {t.name}
                      </span>
                    </span>

                    {accuracy !== null && (
                      <span
                        className={cn(
                          'tabular hidden shrink-0 font-mono text-xs sm:block',
                          accuracy >= 80
                            ? 'text-correct'
                            : accuracy >= 60
                              ? 'text-ink-soft'
                              : 'text-approx'
                        )}
                      >
                        {accuracy}%
                      </span>
                    )}

                    {/* Coverage: how much of the topic's own material you've seen. */}
                    <span
                      className="h-px w-12 shrink-0 bg-rule sm:w-20"
                      title={`${coverage}% of this topic seen`}
                    >
                      <span
                        className={cn(
                          'block h-px origin-left',
                          status === 'Completed' ? 'bg-correct' : 'bg-ink-soft'
                        )}
                        style={{ transform: `scaleX(${coverage / 100})` }}
                      />
                    </span>

                    <span className="tabular w-10 shrink-0 text-right font-mono text-xs text-ink-faint">
                      {t.questionCount}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
