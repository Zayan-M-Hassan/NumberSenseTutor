
export type Topic = {
  id: string;
  name: string;
  description: string;
  exampleQuestions: string[];
};

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
};

export type Progress = {
  topics: Record<string, TopicProgress>;
};

export type Settings = {
  questionsPerSet: number;
  theme: 'light' | 'dark' | 'system';
  colorTheme: string;
};
