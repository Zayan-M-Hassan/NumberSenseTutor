export type Topic = {
  id: string;
  name: string;
  description: string;
  exampleQuestions: string[];
};

export type TopicProgress = {
  attempted: number;
  correct: number;
  completedSets: number;
};

export type Progress = {
  topics: Record<string, TopicProgress>;
};

export type Settings = {
  questionsPerSet: number;
  theme: 'light' | 'dark' | 'system';
  colorTheme: string;
};
