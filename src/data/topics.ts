import type { Topic, MathTopic } from '@/lib/types';
import topicsData from './math-topics.json';

const topics: MathTopic[] = topicsData;

export const getTopics = (): Topic[] => {
  return topics.map(topic => ({
    id: topic.id,
    name: topic.title,
    description: topic.content,
    exampleQuestions: topic.questions.map(q => q.text),
  }));
};

export const getTopic = (id: string): Topic | undefined => {
  const topic = topics.find((topic) => topic.id === id);
  if (!topic) return undefined;

  return {
    id: topic.id,
    name: topic.title,
    description: topic.content,
    exampleQuestions: [topic.generation_guideline],
  }
};
