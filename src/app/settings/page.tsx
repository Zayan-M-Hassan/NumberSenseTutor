'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/use-settings';
import { useProgress } from '@/hooks/use-progress';
import { cn } from '@/lib/utils';

/** 0 runs until you stop it. */
const SET_SIZES: Array<{ value: number; label: string }> = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 40, label: '40' },
  { value: 80, label: '80' },
  { value: 0, label: 'Endless' },
];
const MODES = ['light', 'dark', 'system'] as const;

export default function SettingsPage() {
  const { settings, saveSettings } = useSettings();
  const { clearProgress, progress } = useProgress();
  const { theme, setTheme } = useTheme();
  const [confirming, setConfirming] = useState(false);

  const topicsTouched = Object.keys(progress.topics).length;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-16">
      <h1 className="font-question text-3xl text-ink">Settings</h1>

      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
          Questions per set
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          A full contest paper is 80. Shorter sets are for drilling one trick.
          Endless keeps going until you stop it.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SET_SIZES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => saveSettings({ questionsPerSet: value })}
              aria-pressed={settings.questionsPerSet === value}
              className={cn(
                'tabular rounded-sm border px-4 py-2 font-mono text-sm transition-colors',
                settings.questionsPerSet === value
                  ? 'border-ink bg-ink text-paper'
                  : 'border-rule-strong text-ink-soft hover:border-ink hover:text-ink'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
          After a wrong answer
        </h2>
        <p className="mt-2 max-w-md text-sm text-ink-soft">
          Correct answers always move straight on. This decides what happens when you miss one.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => saveSettings({ autoAdvance: false })}
            aria-pressed={!settings.autoAdvance}
            className={cn(
              'rounded-sm border px-4 py-2 text-sm transition-colors',
              !settings.autoAdvance
                ? 'border-ink bg-ink text-paper'
                : 'border-rule-strong text-ink-soft hover:border-ink hover:text-ink'
            )}
          >
            Wait for me
          </button>
          <button
            onClick={() => saveSettings({ autoAdvance: true })}
            aria-pressed={settings.autoAdvance}
            className={cn(
              'rounded-sm border px-4 py-2 text-sm transition-colors',
              settings.autoAdvance
                ? 'border-ink bg-ink text-paper'
                : 'border-rule-strong text-ink-soft hover:border-ink hover:text-ink'
            )}
          >
            Move on automatically
          </button>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">Appearance</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => {
                setTheme(m);
                saveSettings({ theme: m });
              }}
              aria-pressed={theme === m}
              className={cn(
                'rounded-sm border px-4 py-2 text-sm capitalize transition-colors',
                theme === m
                  ? 'border-ink bg-ink text-paper'
                  : 'border-rule-strong text-ink-soft hover:border-ink hover:text-ink'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-16 border-t border-rule pt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
          Clear progress
        </h2>
        <p className="mt-2 max-w-md text-sm text-ink-soft">
          Deletes your scores, history and which questions you have seen, on this device. It cannot
          be undone.
        </p>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            disabled={topicsTouched === 0}
            className="mt-4 rounded-sm border border-rule-strong px-4 py-2 text-sm text-ink-soft transition-colors hover:border-wrong hover:text-wrong disabled:opacity-40 disabled:hover:border-rule-strong disabled:hover:text-ink-soft"
          >
            {topicsTouched === 0
              ? 'Nothing to clear'
              : `Clear ${topicsTouched} ${topicsTouched === 1 ? 'topic' : 'topics'}`}
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => {
                clearProgress();
                setConfirming(false);
              }}
              className="rounded-sm bg-wrong px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              Delete everything
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-1 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              Keep it
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
