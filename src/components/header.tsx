'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, TestTubeDiagonal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <TestTubeDiagonal className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block">
              Number Sense Tutor
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-2 sm:space-x-4 justify-end">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              variant="ghost"
              asChild
              className={cn(
                'text-sm font-medium',
                pathname === href
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <Link href={href}>
                <Icon className="h-4 w-4 mr-2 sm:hidden" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
