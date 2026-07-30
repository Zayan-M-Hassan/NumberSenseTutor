import { cn } from '@/lib/utils';
import { renderMath } from '@/lib/render-math';

/**
 * Renders inline and display math at render time rather than in an effect, so
 * the raw "$...$" source is never painted first.
 *
 * `content` comes from the question bank and the lesson files, which are part
 * of this repository — not user input.
 */
export function Latex({
  content,
  className,
  as: Tag = 'span',
}: {
  content: string;
  className?: string;
  as?: 'span' | 'div';
}) {
  return (
    <Tag className={cn(className)} dangerouslySetInnerHTML={{ __html: renderMath(content) }} />
  );
}
