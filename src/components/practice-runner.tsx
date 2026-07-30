'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import type { Question } from '@/lib/types';
import { gradeAnswer } from '@/lib/answer';
import { fetchQuestions } from '@/data/topics';
import { useProgress } from '@/hooks/use-progress';
import { useSession } from '@/hooks/use-session';
import { useSettings } from '@/hooks/use-settings';
import { Latex } from '@/components/ui/latex';
import { PaceBar } from '@/components/pace-bar';
import { SetSummary } from '@/components/set-summary';
import { cn } from '@/lib/utils';

type Verdict = {
  correct: boolean;
  expected: string;
  reason?: string;
  response: string;
};

/** Why an answer was rejected, said plainly. */
function rejectionNote(reason: string | undefined): string | null {
  switch (reason) {
    case 'repeating-decimal':
      return 'A repeating decimal is not accepted here — give the fraction.';
    case 'not-integral':
      return 'Starred problems take a whole number.';
    case 'wrong-form':
      return 'Right value, wrong form. Check what the question asks for.';
    case 'unparseable':
      return 'That could not be read as an answer.';
    default:
      return null;
  }
}

export function PracticeRunner({
  topicId,
  topicName,
}: {
  topicId: string;
  topicName: string;
}) {
  const { settings } = useSettings();
  const { getTopicProgress, recordAnswer, completeSet, loaded } = useProgress();

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const size = settings.questionsPerSet;
  const session = useSession(topicId, questions ?? [], size);

  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [summary, setSummary] = useState<{ attempted: number; correct: number; totalTime: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startedAt = useRef<number>(Date.now());

  // The question bank is a static asset, not part of this page's payload.
  useEffect(() => {
    let cancelled = false;
    fetchQuestions(topicId)
      .then((qs) => {
        if (!cancelled) setQuestions(qs);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  const question: Question | null = session.current;
  const starred = question?.kind === 'approximate';

  useEffect(() => {
    if (!loaded || !questions || session.session) return;
    session.start(getTopicProgress(topicId).seenQuestionIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, questions, session.session]);

  useEffect(() => {
    if (!question || verdict) return;
    startedAt.current = Date.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed((Date.now() - startedAt.current) / 1000), 100);
    return () => clearInterval(id);
  }, [question, verdict]);

  useEffect(() => {
    if (question && !verdict) inputRef.current?.focus();
  }, [question, verdict]);

  const advance = useCallback(() => {
    setVerdict(null);
    setValue('');
    session.advance();
  }, [session]);

  useEffect(() => {
    if (!session.done || summary) return;
    const p = getTopicProgress(topicId);
    setSummary({
      attempted: p.currentSet.questionsAttempted,
      correct: p.currentSet.questionsCorrect,
      totalTime: p.currentSet.totalTime,
    });
    completeSet(topicId);
    session.finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.done]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question) return;

    if (verdict) {
      advance();
      return;
    }
    if (!value.trim()) return;

    const timeTaken = (Date.now() - startedAt.current) / 1000;
    const result = gradeAnswer(value, question.answer, {
      kind: question.kind,
      requiredForm: question.requiredForm,
    });

    recordAnswer(topicId, { questionId: question.id, isCorrect: result.correct, timeTaken });
    setVerdict({ ...result, response: value });
    if (result.correct) window.setTimeout(advance, 320);
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <p className="font-question text-lg text-ink">This topic&rsquo;s questions did not load.</p>
        <p className="mt-2 text-sm text-ink-soft">Check your connection and reload the page.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-ink-soft underline hover:text-ink">
          Back to topics
        </Link>
      </div>
    );
  }

  if (summary) {
    return (
      <SetSummary
        topicId={topicId}
        topicName={topicName}
        stats={summary}
        onAgain={() => {
          setSummary(null);
          session.start(getTopicProgress(topicId).seenQuestionIds);
        }}
      />
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="h-3 w-32 animate-pulse rounded-sm bg-surface" />
        <div className="mt-10 h-8 w-3/4 animate-pulse rounded-sm bg-surface" />
        <div className="mt-10 h-10 w-full animate-pulse rounded-sm bg-surface" />
      </div>
    );
  }

  const state = verdict ? (verdict.correct ? 'correct' : 'wrong') : 'idle';

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <Link
          href={`/topics/${topicId}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {topicName}
        </Link>
        <span className="tabular font-mono text-xs uppercase tracking-wider text-ink-faint">
          {session.position} / {session.total}
        </span>
      </div>

      <PaceBar elapsed={elapsed} target={7.5} frozen={!!verdict} className="mt-4" />

      <div className="relative mt-12">
        {starred && (
          <span
            className="star-mark absolute -left-5 top-1 text-2xl sm:-left-7 sm:text-3xl"
            aria-label="Approximate answer accepted"
            title="Within 5% is correct. Answer with a whole number."
          >
            *
          </span>
        )}
        <Latex
          as="div"
          content={question.text}
          className="font-question text-question-sm leading-snug text-ink sm:text-question"
        />
      </div>

      <form onSubmit={submit} className="mt-10">
        <label htmlFor="answer" className="sr-only">
          Your answer
        </label>
        <div className="flex items-baseline gap-3">
          <span aria-hidden className="font-question text-question text-ink-faint">
            =
          </span>
          <input
            id="answer"
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            data-star={starred}
            data-state={state}
            onChange={(e) => setValue(e.target.value)}
            className="answer-rule text-question sm:text-question-lg"
            aria-describedby={verdict ? 'verdict' : undefined}
          />
        </div>

        <div id="verdict" aria-live="polite" className="mt-4 min-h-[3.25rem]">
          {verdict && !verdict.correct && (
            <div className="animate-slide-up">
              <p className="font-question text-lg text-ink">
                <span className="text-ink-soft">Answer: </span>
                <span className="text-wrong">{verdict.expected}</span>
              </p>
              {rejectionNote(verdict.reason) && (
                <p className="mt-1 text-sm text-ink-soft">{rejectionNote(verdict.reason)}</p>
              )}
            </div>
          )}
          {verdict?.correct && (
            <p className="animate-slide-up font-mono text-sm uppercase tracking-wider text-correct">
              Correct
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <button
            type="submit"
            className={cn(
              'rounded-sm px-4 py-2 text-sm font-medium transition-colors',
              'bg-ink text-paper hover:bg-ink/85',
              'disabled:cursor-not-allowed disabled:opacity-40'
            )}
            disabled={!verdict && !value.trim()}
          >
            {verdict ? 'Next' : 'Answer'}
          </button>

          <Link
            href={`/topics/${topicId}`}
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Show the trick
          </Link>
        </div>

        <p className="mt-6 font-mono text-xs text-ink-faint">
          Press Enter to answer, Enter again to continue.
        </p>
      </form>
    </div>
  );
}
