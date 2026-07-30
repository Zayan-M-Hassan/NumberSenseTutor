import { notFound } from 'next/navigation';
import { getLesson, getPractisableTopics } from '@/data/topics';
import { PracticeRunner } from '@/components/practice-runner';

export async function generateStaticParams() {
  return getPractisableTopics().map((t) => ({ topicId: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const lesson = await getLesson(topicId);
  return { title: lesson ? `${lesson.title} — practice` : 'Practice' };
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const lesson = await getLesson(topicId);
  if (!lesson || lesson.section || lesson.questionCount === 0) notFound();

  // Only the topic's name and id cross to the client. The 1,000 questions are
  // fetched as a static asset, so this page stays small.
  return <PracticeRunner topicId={lesson.id} topicName={lesson.title} />;
}
