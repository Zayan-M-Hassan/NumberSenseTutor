'use client';

import LatexNext from 'react-latex-next';
import { cn } from '@/lib/utils';

export const Latex = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => {
  return (
    <div
      className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
    >
      <LatexNext>{content}</LatexNext>
    </div>
  );
};
