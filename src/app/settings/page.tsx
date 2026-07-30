'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/use-settings';
import { useProgress } from '@/hooks/use-progress';
import { cn } from '@/lib/utils';

const SET_SIZES = [5, 10, 20, 40, 80];
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
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SET_SIZES.map((n) => (
            <button
              key={n}
              onClick={() => saveSettings({ questionsPerSet: n })}
              aria-pressed={settings.questionsPerSet === n}
              className={cn(
                'tabular rounded-sm border px-4 py-2 font-mono text-sm transition-colors',
                settings.questionsPerSet === n
                  ? 'border-ink bg-ink text-paper'
                  : 'border-rule-strong text-ink-soft hover:border-ink hover:text-ink'
              )}
            >
              {n}
            </button>
          ))}
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
