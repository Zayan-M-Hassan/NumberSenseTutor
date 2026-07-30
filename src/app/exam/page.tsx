import { ExamRunner } from '@/components/exam-runner';

export const metadata = { title: 'Full test — 80 questions, 10 minutes' };

/**
 * The paper is assembled in the browser from a fetched pool, so every sitting
 * is a different test. Building it here would bake one fixed paper into the
 * prerendered page.
 */
export default function ExamPage() {
  return <ExamRunner />;
}
