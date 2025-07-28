'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    renderMathInElement: (
      element: HTMLElement,
      options: Record<string, any>
    ) => void;
  }
}

export const Latex = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && window.renderMathInElement) {
      window.renderMathInElement(ref.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
      });
    }
  }, [content]);

  return (
    <div
      ref={ref}
      className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
