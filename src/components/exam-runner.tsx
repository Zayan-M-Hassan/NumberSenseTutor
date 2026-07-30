'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExamAnswer, ExamQuestion, ExamResult } from '@/lib/types';
import { gradeAnswer } from '@/lib/answer';
import { EXAM_SECONDS, isStarPosition, scoreExam } from '@/lib/exam';
import { Latex } from '@/components/ui/latex';
import { ExamBrief } from '@/components/exam-brief';
import { ExamResultSheet } from '@/components/exam-result-sheet';

type Stage = 'brief' | 'running' | 'done';

export function ExamRunner({ paper }: { paper: ExamQuestion[] }) {
  const [stage, setStage] = useState<Stage>('brief');
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [remaining, setRemaining] = useState(EXAM_SECONDS);
  const [result, setResult] = useState<ExamResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const questionStart = useRef(Date.now());
  const answersRef = useRef<ExamAnswer[]>([]);
  answersRef.current = answers;

  const question = paper[index];
  const finish = useCallback(() => {
    setResult(scoreExam(answersRef.current));
    setStage('done');
  }, []);

  // The 10-minute clock. At zero the paper stops, mid-answer or not.
  useEffect(() => {
    if (stage !== 'running') return;
    const started = Date.now();
    const id = setInterval(() => {
      const left = EXAM_SECONDS - (Date.now() - started) / 1000;
      if (left <= 0) {
        setRemaining(0);
        clearInterval(id);
        finish();
      } else {
        setRemaining(left);
      }
    }, 200);
    return () => clearInterval(id);
  }, [stage, finish]);

  useEffect(() => {
    if (stage === 'running') inputRef.current?.focus();
  }, [stage, index]);

  const commit = (skipped: boolean) => {
    if (!question) return;
    const timeTaken = (Date.now() - questionStart.current) / 1000;
    const correct =
      !skipped &&
      gradeAnswer(value, question.answer, {
        kind: question.kind,
        requiredForm: question.requiredForm,
      }).correct;

    const next = [
      ...answersRef.current,
      { position: question.position, response: skipped ? '' : value, correct, skipped, timeTaken },
    ];
    setAnswers(next);
    answersRef.current = next;
    setValue('');
    questionStart.current = Date.now();

    if (index + 1 >= paper.length) {
      setResult(scoreExam(next));
      setStage('done');
    } else {
      setIndex(index + 1);
    }
  };

  if (stage === 'brief') {
    return (
      <ExamBrief
        questionCount={paper.length}
        onStart={() => {
          questionStart.current = Date.now();
          setStage('running');
        }}
      />
    );
  }

  if (stage === 'done' && result) {
    return <ExamResultSheet result={result} paper={paper} />;
  }

  if (!question) return null;

  const starred = isStarPosition(question.position);
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  const low = remaining <= 60;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <span className="tabular font-mono text-xs uppercase tracking-wider text-ink-faint">
          {question.position} / 80
        </span>
        <span
          className={`tabular font-mono text-lg ${low ? 'text-wrong' : 'text-ink'}`}
          role="timer"
          aria-live="off"
        >
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      </div>

      <div className="mt-3 h-px w-full bg-rule" aria-hidden>
        <div
          className={`h-px origin-left ${low ? 'bg-wrong' : 'bg-ink-soft'}`}
          style={{ transform: `scaleX(${remaining / EXAM_SECONDS})` }}
        />
      </div>

      <div className="relative mt-12">
        {starred && (
          <span
            className="star-mark absolute -left-5 top-1 text-2xl sm:-left-7 sm:text-3xl"
            title="Within 5% counts. Answer with a whole number."
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit(false);
        }}
        className="mt-10"
      >
        <label htmlFor="exam-answer" className="sr-only">
          Answer for question {question.position}
        </label>
        <div className="flex items-baseline gap-3">
          <span aria-hidden className="font-question text-question text-ink-faint">
            =
          </span>
          <input
            id="exam-answer"
            ref={inputRef}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            data-star={starred}
            onChange={(e) => setValue(e.target.value)}
            className="answer-rule text-question sm:text-question-lg"
          />
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-sm bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/85 disabled:opacity-40"
            disabled={!value.trim()}
          >
            Answer
          </button>
          <button
            type="button"
            onClick={() => commit(true)}
            className="rounded-sm border border-rule-strong px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={finish}
            className="ml-auto px-1 text-sm text-ink-faint transition-colors hover:text-ink"
          >
            Stop here
          </button>
        </div>

        <p className="mt-6 font-mono text-xs text-ink-faint">
          No going back. A skip costs 4 points; anything past your last answer costs nothing.
        </p>
      </form>
    </div>
  );
}
