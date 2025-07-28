
import type { GenerateEstimationQuestionOutput } from "./ai/flows/generate-estimation-questions";

export type Topic = {
  id: string;
  name: string;
  description: string;
  exampleQuestions: string[];
};

export type MathTopic = {
  id: string;
  slug: string;
  title: string;
  content: string;
  generation_guideline: string;
  questions: {
    id: number;
    text: string;
    answer: string;
    hasErrorRange?: boolean;
  }[];
}

export type TopicProgressSet = {
  questionsAttempted: number;
  questionsCorrect: number;
  totalTime: number;
}

export type TopicProgress = {
  overall: {
    attempted: number;
    correct: number;
  };
  currentSet: TopicProgressSet,
  completedSets: number;
  currentQuestion: GenerateEstimationQuestionOutput | null;
};

export type Progress = {
  topics: Record<string, TopicProgress>;
};

export type Settings = {
  questionsPerSet: number;
  theme: 'light' | 'dark' | 'system';
  colorTheme: string;
};
