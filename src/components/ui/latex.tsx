'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import katex from 'katex';

export const Latex = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const renderedHtml = content.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
        return katex.renderToString(math, { displayMode: true, throwOnError: false });
      }).replace(/\$([^$]+)\$/g, (match, math) => {
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      });
      ref.current.innerHTML = renderedHtml;
    }
  }, [content]);

  return (
    <div
      ref={ref}
      className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
    />
  );
};
