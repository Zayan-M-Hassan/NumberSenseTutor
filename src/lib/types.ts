/**
 * How an answer must be written for it to count.
 *
 * Real UIL tests state this inline in the question — "(mixed number)",
 * "(fraction)", "= ______ base 9" — and grading depends on it: a question
 * asking for a mixed number does not accept an improper fraction.
 */
export type RequiredForm =
  | 'mixed'
  | 'fraction'
  | 'properFraction'
  | 'decimal'
  | 'roman'
  | 'arabic'
  | { base: number };

/**
 * `exact` answers must match precisely.
 * `approximate` answers are the starred (*) problems: the response must be an
 * integer within 5% of the true value.
 * `categorical` answers are words — "Perfect", "Yes", "infinity".
 */
export type QuestionKind = 'exact' | 'approximate' | 'categorical';

export type Question = {
  id: number;
  text: string;
  /** Kept as the authored string — never coerce with Number(). Use parseAnswer. */
  answer: string;
  kind: QuestionKind;
  requiredForm?: RequiredForm;
  /** Content tags used to weight exam-mode question selection. */
  tags?: string[];
  /** Legacy flag from the original data; `kind === 'approximate'` supersedes it. */
  hasErrorRange?: boolean;
};

export type Topic = {
  id: string;
  name: string;
  /** Short one-line summary for cards. Not the full lesson. */
  summary: string;
  /** Full teaching HTML for the lesson view. */
  content: string;
  questions: Question[];
  /** Section headings from the source textbook — grouping only, not practisable. */
  section?: boolean;
};

/** A topic entry in the lightweight index (no questions, no lesson HTML). */
export type TopicSummary = {
  id: string;
  name: string;
  summary: string;
  questionCount: number;
  section?: boolean;
};

/** Shape as stored in the data files. */
export type MathTopic = {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary?: string;
  generation_guideline: string;
  section?: boolean;
  questions: Question[];
};

export type TopicProgressSet = {
  questionsAttempted: number;
  questionsCorrect: number;
  totalTime: number;
};

export type TopicProgress = {
  overall: {
    attempted: number;
    correct: number;
  };
  currentSet: TopicProgressSet;
  completedSets: number;
  /** Question IDs already served, so new sets draw unseen questions first. */
  seenQuestionIds: number[];
};

export type SessionRecord = {
  /** ISO date string. */
  date: string;
  topicId: string;
  attempted: number;
  correct: number;
  totalTime: number;
};

export type Progress = {
  /** Storage schema version, for migrations. */
  v: number;
  topics: Record<string, TopicProgress>;
  history: SessionRecord[];
};

export type Settings = {
  questionsPerSet: number;
  theme: 'light' | 'dark' | 'system';
};

export type TopicStatus = 'Completed' | 'In Progress' | 'Not Started';

/* ---------- Exam mode ---------- */

export type ExamQuestion = Question & {
  topicId: string;
  topicName: string;
  /** 1-80. Positions 10,20,...,80 are always starred on real tests. */
  position: number;
};

export type ExamAnswer = {
  position: number;
  response: string;
  correct: boolean;
  skipped: boolean;
  timeTaken: number;
};

export type ExamResult = {
  date: string;
  answers: ExamAnswer[];
  /** Highest position the contestant actually answered. */
  lastAttempted: number;
  score: number;
  correct: number;
  wrong: number;
  /** Skips at or before `lastAttempted` — these are penalised. */
  skippedPenalised: number;
  /** Everything past `lastAttempted` — not scored at all. */
  unscoredTail: number;
};
