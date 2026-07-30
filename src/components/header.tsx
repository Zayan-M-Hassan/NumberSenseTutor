'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/exam', label: 'Test' },
  { href: '/stats', label: 'Stats' },
  { href: '/settings', label: 'Settings' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-6 px-5">
        <Link href="/" className="flex items-baseline gap-2">
          {/* The asterisk is the contest's own mark for an approximate problem. */}
          <span className="star-mark text-lg leading-none">*</span>
          <span className="font-question text-[0.9375rem] text-ink">Number Sense</span>
        </Link>

        <nav className="ml-auto flex items-center gap-5">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'font-mono text-xs uppercase tracking-wider transition-colors',
                pathname === href ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
