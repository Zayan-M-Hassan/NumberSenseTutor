'use client';

/**
 * The instructions page, in the register of the real paper — which opens
 * "DO NOT UNFOLD THIS SHEET UNTIL TOLD TO BEGIN".
 */
export function ExamBrief({
  questionCount,
  ready,
  onStart,
}: {
  questionCount: number;
  ready: boolean;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-16">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">Full test</p>
      <h1 className="mt-2 font-question text-3xl text-ink sm:text-4xl">
        {questionCount} questions, 10 minutes
      </h1>

      <ul className="mt-10 divide-y divide-rule border-y border-rule">
        <Rule>Answer in order. Once you move on, the question is closed.</Rule>
        <Rule>
          <span className="text-correct">+5</span> for each correct answer,{' '}
          <span className="text-wrong">−4</span> for each wrong one.
        </Rule>
        <Rule>
          A skipped question costs <span className="text-wrong">−4</span> — but only if you answer
          something later. Everything past your final answer is not scored at all.
        </Rule>
        <Rule>
          Problems marked <span className="star-mark">*</span> take an approximate answer: any whole
          number within 5% is correct. There are eight of them, at every tenth question.
        </Rule>
        <Rule>Mental arithmetic only. No calculator, no paper.</Rule>
      </ul>

      <button
        onClick={onStart}
        disabled={!ready}
        className="mt-10 rounded-sm bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/85 disabled:opacity-40"
      >
        {ready ? 'Begin — the clock starts now' : 'Building your paper…'}
      </button>
    </div>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return <li className="py-3.5 text-[0.9375rem] leading-relaxed text-ink-soft">{children}</li>;
}
