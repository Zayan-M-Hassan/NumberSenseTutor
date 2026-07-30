import { notFound } from 'next/navigation';
import { getPractisableTopics, getTopic } from '@/data/topics';
import { PracticeRunner } from '@/components/practice-runner';

export async function generateStaticParams() {
  return getPractisableTopics().map((t) => ({ topicId: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = await getTopic(topicId);
  return { title: topic ? `${topic.name} — practice` : 'Practice' };
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = await getTopic(topicId);
  if (!topic || topic.section || topic.questions.length === 0) notFound();
  return <PracticeRunner topic={topic} />;
}
