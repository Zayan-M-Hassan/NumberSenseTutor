import { getTopicIndex } from '@/data/topics';
import { StatsView } from '@/components/stats-view';

export const metadata = { title: 'Stats' };

export default function StatsPage() {
  // Only names are needed here — not questions or lessons.
  const names = Object.fromEntries(getTopicIndex().map((t) => [t.id, t.name]));
  return <StatsView topicNames={names} />;
}
