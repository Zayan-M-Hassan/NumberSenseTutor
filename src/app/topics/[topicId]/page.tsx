import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getPractisableTopics, getTopic } from '@/data/topics';
import { renderMath } from '@/lib/render-math';
import { TopicStats } from '@/components/topic-stats';

export async function generateStaticParams() {
  return getPractisableTopics().map((t) => ({ topicId: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = await getTopic(topicId);
  return { title: topic ? topic.name : 'Topic' };
}

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = await getTopic(topicId);
  if (!topic) notFound();

  const starred = topic.questions.filter((q) => q.kind === 'approximate').length;

  return (
    <article className="mx-auto max-w-2xl px-5 pb-24 pt-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All topics
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">{topic.id}</p>
        <h1 className="mt-2 font-question text-3xl leading-tight text-ink sm:text-4xl">
          {topic.name}
        </h1>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-ink-soft">
          <span>{topic.questions.length} questions</span>
          {starred > 0 && (
            <span className="text-approx">
              {starred} starred &middot; within 5% counts
            </span>
          )}
        </p>
      </header>

      <TopicStats topicId={topic.id} questionCount={topic.questions.length} />

      {/* The lesson. This existed for all 138 topics and was never shown. */}
      <div
        className="lesson mt-10 font-question text-[1.0625rem] leading-relaxed text-ink"
        dangerouslySetInnerHTML={{ __html: renderMath(topic.content) }}
      />

      {topic.questions.length > 0 && (
        <Link
          href={`/practice/${topic.id}`}
          className="mt-12 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
        >
          Practise this
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </article>
  );
}
