
'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Pencil } from 'lucide-react';
import type { Topic, TopicProgress } from '@/lib/types';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TopicListProps {
  topics: Topic[];
}

const getStatus = (progress: TopicProgress) => {
  if (progress.completedSets > 0) {
    return {
      label: 'Completed',
      Icon: CheckCircle,
      variant: 'default',
    } as const;
  }
  if (progress.attempted > 0) {
    return {
      label: 'In Progress',
      Icon: Pencil,
      variant: 'secondary',
    } as const;
  }
  return {
    label: 'Not Started',
    Icon: ArrowRight,
    variant: 'outline',
  } as const;
};

export function TopicList({ topics }: TopicListProps) {
  const { getTopicProgress } = useProgress();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => {
        const progress = getTopicProgress(topic.id);
        const status = getStatus(progress);
        const accuracy = progress.attempted > 0 ? Math.round((progress.correct / progress.attempted) * 100) : 0;

        return (
          <Card key={topic.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline">{topic.name}</CardTitle>
                <Badge variant={status.variant}>
                  <status.Icon className="h-4 w-4 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <CardDescription>{topic.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {progress.attempted > 0 ? (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Accuracy</span>
                        <span>{accuracy}%</span>
                    </div>
                  <Progress value={accuracy} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center pt-1">{progress.correct} / {progress.attempted} correct</p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6">
                  Start practicing to see your progress!
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/practice/${topic.id}`}>
                  {progress.attempted > 0 ? 'Continue Practice' : 'Start Practice'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
