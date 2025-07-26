import { getTopics } from '@/data/topics';
import { TopicList } from '@/components/topic-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const topics = getTopics();

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
          Welcome to Number Sense Tutor
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Sharpen your estimation skills with AI-generated questions. Choose a
          topic below to begin your practice session and see how well you can
          estimate.
        </p>
      </div>

      <TopicList topics={topics} />
    </div>
  );
}
