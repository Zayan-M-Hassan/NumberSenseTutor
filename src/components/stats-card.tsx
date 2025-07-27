
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Topic, TopicProgressSet } from "@/lib/types";
import { CheckCircle, Clock, Percent, RotateCw, Target } from "lucide-react";

interface StatsCardProps {
  topic: Topic;
  stats: TopicProgressSet;
  onStartNewSet: () => void;
  onReturnToTopics: () => void;
}

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
        <div className="flex items-center">
            <Icon className="h-6 w-6 mr-3 text-primary" />
            <span className="font-medium">{label}</span>
        </div>
        <span className="font-bold text-lg">{value}</span>
    </div>
);

export function StatsCard({ topic, stats, onStartNewSet, onReturnToTopics }: StatsCardProps) {
  const accuracy = stats.questionsAttempted > 0 ? Math.round((stats.questionsCorrect / stats.questionsAttempted) * 100) : 0;
  const avgTime = stats.questionsAttempted > 0 ? (stats.totalTime / stats.questionsAttempted).toFixed(1) : 0;

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <CardTitle className="font-headline text-3xl">Set Complete!</CardTitle>
          <CardDescription className="text-lg">You've finished the {topic.name} practice set.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <h3 className="text-center font-semibold text-muted-foreground pb-2">Session Statistics</h3>
            <div className="grid grid-cols-1 gap-3">
                <StatItem icon={Target} label="Score" value={`${stats.questionsCorrect} / ${stats.questionsAttempted}`} />
                <StatItem icon={Percent} label="Accuracy" value={`${accuracy}%`} />
                <StatItem icon={Clock} label="Average Time" value={`${avgTime}s`} />
            </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2 pt-6">
          <Button onClick={onStartNewSet} className="w-full">
            <RotateCw className="mr-2" />
            Practice Again
          </Button>
          <Button onClick={onReturnToTopics} variant="outline" className="w-full">
            Back to Topics
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
