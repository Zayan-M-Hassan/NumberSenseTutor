import type { Topic } from '@/lib/types';

const topics: Topic[] = [
  {
    id: 'geography',
    name: 'Geography',
    description: 'Estimate distances, populations, and geographical feature sizes.',
    exampleQuestions: [
      'How many countries are in Africa?',
      'What is the approximate length of the Amazon River in kilometers?',
      'What is the population of Tokyo?',
    ],
  },
  {
    id: 'history',
    name: 'History',
    description: 'Estimate years, durations of events, and historical quantities.',
    exampleQuestions: [
      'In what year did the Titanic sink?',
      'How many years did the Hundred Years\' War actually last?',
      'How many pyramids are estimated to be in Egypt?',
    ],
  },
  {
    id: 'science',
    name: 'Science & Nature',
    description: 'Estimate scientific constants, animal speeds, and natural phenomena.',
    exampleQuestions: [
      'What is the speed of light in meters per second?',
      'How many hearts does an octopus have?',
      'What is the average weight of a mature blue whale in kilograms?',
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Estimate data sizes, processing speeds, and user numbers.',
    exampleQuestions: [
      'How many gigabytes of data does an average 10-minute 4K video consume?',
      'How many transistors were in the Intel 4004 processor?',
      'How many active users does Wikipedia have monthly?',
    ],
  },
];

export const getTopics = (): Topic[] => {
  return topics;
};

export const getTopic = (id: string): Topic | undefined => {
  return topics.find((topic) => topic.id === id);
};
