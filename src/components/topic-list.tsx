
'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Pencil } from 'lucide-react';
import type { Topic, TopicProgress, TopicStatus } from '@/lib/types';
import { useProgress } from '@/hooks/use-progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Latex } from './ui/latex';
import React, { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface TopicListProps {
  topics: Topic[];
}

const getStatus = (progress: TopicProgress): TopicStatus => {
  if (progress.completedSets > 0) {
    return 'Completed';
  }
  if (progress.overall.attempted > 0) {
    return 'In Progress';
  }
  return 'Not Started';
};

const STATUS_DETAILS: Record<TopicStatus, { label: string, Icon: React.ElementType, variant: 'default' | 'inProgress' | 'outline' }> = {
    'Completed': { label: 'Completed', Icon: CheckCircle, variant: 'default' },
    'In Progress': { label: 'In Progress', Icon: Pencil, variant: 'inProgress' },
    'Not Started': { label: 'Not Started', Icon: ArrowRight, variant: 'outline' },
}


export function TopicList({ topics }: TopicListProps) {
  const { getTopicProgress } = useProgress();
  const [filter, setFilter] = useState<TopicStatus | 'all'>('all');

  const filteredTopics = topics.filter(topic => {
    if (filter === 'all') {
      return true;
    }
    const progress = getTopicProgress(topic.id);
    return getStatus(progress) === filter;
  })

  return (
    <>
      <div className="flex justify-center mb-8">
        <ToggleGroup 
          type="single" 
          value={filter}
          onValueChange={(value: TopicStatus | 'all') => {
            if (value) setFilter(value);
          }}
          defaultValue="all" 
          className="flex-wrap justify-center"
        >
          <ToggleGroupItem value="all" aria-label="Toggle all">All</ToggleGroupItem>
          <ToggleGroupItem value="Not Started" aria-label="Toggle not started">Not Started</ToggleGroupItem>
          <ToggleGroupItem value="In Progress" aria-label="Toggle in progress">In Progress</ToggleGroupItem>
          <ToggleGroupItem value="Completed" aria-label="Toggle completed">Completed</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => {
          const progress = getTopicProgress(topic.id);
          const status = getStatus(progress);
          const statusDetails = STATUS_DETAILS[status];
          const accuracy = progress.overall.attempted > 0 ? Math.round((progress.overall.correct / progress.overall.attempted) * 100) : 0;

          return (
            <Card key={topic.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="font-headline">{topic.name}</CardTitle>
                  <Badge variant={statusDetails.variant}>
                    <statusDetails.Icon className="h-4 w-4 mr-1" />
                    {statusDetails.label}
                  </Badge>
                </div>
                <CardDescription>
                  <Latex content={topic.description} />
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {progress.overall.attempted > 0 ? (
                  <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Overall Accuracy</span>
                          <span>{accuracy}%</span>
                      </div>
                    <Progress value={accuracy} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center pt-1">{progress.overall.correct} / {progress.overall.attempted} correct</p>
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
                    {progress.overall.attempted > 0 ? 'Continue Practice' : 'Start Practice'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
