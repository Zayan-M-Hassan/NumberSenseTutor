'use client';

import { topicCoverage, useProgress } from '@/hooks/use-progress';

/** The learner's own numbers for one topic, shown above its lesson. */
export function TopicStats({ topicId, questionCount }: { topicId: string; questionCount: number }) {
  const { getTopicProgress, loaded } = useProgress();
  if (!loaded) return <div className="mt-8 h-12" />;

  const p = getTopicProgress(topicId);
  if (p.overall.attempted === 0) {
    return (
      <p className="mt-8 border-y border-rule py-4 text-sm text-ink-soft">
        You have not practised this yet.
      </p>
    );
  }

  const accuracy = Math.round((p.overall.correct / p.overall.attempted) * 100);
  const coverage = topicCoverage(p, questionCount);

  return (
    <dl className="mt-8 grid grid-cols-3 gap-6 border-y border-rule py-4">
      <Stat label="Accuracy" value={`${accuracy}%`} />
      <Stat label="Seen" value={`${coverage}%`} />
      <Stat label="Sets" value={String(p.completedSets)} />
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.6875rem] uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className="tabular mt-1 font-mono text-lg text-ink">{value}</dd>
    </div>
  );
}
