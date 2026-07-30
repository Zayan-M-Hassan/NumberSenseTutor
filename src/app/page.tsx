import { getTopicIndex, SECTIONS, sectionOf } from '@/data/topics';
import { PaceThesis } from '@/components/pace-thesis';
import { TopicIndex } from '@/components/topic-index';

export default function Home() {
  const topics = getTopicIndex().filter((t) => !t.section && t.questionCount > 0);
  const totalQuestions = topics.reduce((n, t) => n + t.questionCount, 0);

  const grouped = SECTIONS.map((s) => ({
    ...s,
    topics: topics.filter((t) => sectionOf(t.id) === s.key),
  })).filter((s) => s.topics.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24">
      <PaceThesis topicCount={topics.length} questionCount={totalQuestions} />
      <TopicIndex sections={grouped} />
    </div>
  );
}
