import type { Topic, MathTopic, Question } from '@/lib/types';
import topicsData from './math-topics.json';

const topics: MathTopic[] = topicsData;

export const getTopics = (): Topic[] => {
  return topics.map(topic => ({
    id: topic.id,
    name: topic.title,
    description: topic.content,
    questions: topic.questions.map(q => ({
      ...q,
      answer: Number(q.answer)
    })),
  }));
};

export const getTopic = (id: string): Topic | undefined => {
  const topic = topics.find((topic) => topic.id === id);
  if (!topic) return undefined;

  return {
    id: topic.id,
    name: topic.title,
    description: topic.content,
    questions: topic.questions.map(q => ({
      text: q.text,
      answer: Number(q.answer), // Assuming answer is always a number in the JSON
      hasErrorRange: q.hasErrorRange,
    })),
  }
};
