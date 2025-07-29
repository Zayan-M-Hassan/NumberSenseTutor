
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getTopic } from '@/data/topics';
import { useProgress } from '@/hooks/use-progress';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lightbulb, Loader2, TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/stats-card';
import { Latex } from '@/components/ui/latex';
import React from 'react';
import type { Question } from '@/lib/types';

type Status = 'idle' | 'correct' | 'incorrect';
type View = 'practice' | 'stats';

export default function PracticePage({ params }: { params: { topicId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { topicId } = React.use(params);
  const topic = useMemo(() => getTopic(topicId), [topicId]);
  
  const [loading, setLoading] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [view, setView] = useState<View>('practice');
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  
  const { settings } = useSettings();
  const { getTopicProgress, updateTopicProgress, startNewSet } = useProgress();
  
  const topicProgress = getTopicProgress(topicId);

  const fetchQuestion = useCallback(() => {
    if (!topic) return;

    const currentProgress = getTopicProgress(topicId);
    if (view === 'practice') {
      if (currentProgress.currentSet.questionsAttempted >= settings.questionsPerSet) {
          setView('stats');
          return;
      }
      setLoading(true);
      const question = topic.questions[questionIndex];
      if (question) {
        setCurrentQuestion(question);
        setStatus('idle');
        setUserAnswer('');
        setTime(0);
        setTimerRunning(true);
      } else {
        setView('stats');
      }
      setLoading(false);
    }
  }, [topic, view, questionIndex, settings.questionsPerSet, getTopicProgress]);

  useEffect(() => {
    if (!topic) {
      notFound();
      return;
    }
    fetchQuestion();
  }, [topicId, view, topic, questionIndex, notFound, fetchQuestion]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if(timerRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer || !currentQuestion) return;
    setTimerRunning(false);

    setIsSubmitting(true);
    const userAnswerNumber = parseFloat(userAnswer.replace(/,/g, ''));
    const correctAnswer = currentQuestion.answer;

    let isCorrect: boolean;
    if (currentQuestion.hasErrorRange) {
      const errorMargin = 0.05;
      isCorrect = Math.abs(userAnswerNumber - correctAnswer) / correctAnswer <= errorMargin;
    } else {
      isCorrect = userAnswerNumber === correctAnswer;
    }

    const newProgress = updateTopicProgress(topicId, { isCorrect, timeTaken: time });

    const setFinished = newProgress.currentSet.questionsAttempted >= settings.questionsPerSet;

    if (isCorrect) {
      setStatus('correct');
      if (setFinished) {
        toast({ title: 'Set Complete!', description: 'Great job! Here are your stats.' });
        setView('stats');
      } else {
        toast({
          title: 'Correct!',
          description: 'Great answer! Loading next question...',
        });
        setTimeout(() => {
          setQuestionIndex(prev => prev + 1);
        }, 1500);
      }
    } else {
      setStatus('incorrect');
      const errorMargin = 0.05;
      const lowerBound = correctAnswer * (1 - errorMargin);
      const upperBound = correctAnswer * (1 + errorMargin);
      
      let feedbackText = `The correct answer is ${correctAnswer.toLocaleString()}.`;
      if(currentQuestion.hasErrorRange) {
        feedbackText = `The correct answer is in the range of ${lowerBound.toLocaleString()} to ${upperBound.toLocaleString()}. The exact answer is ${correctAnswer.toLocaleString()}.`
      }
      setFeedback(feedbackText);
      setShowFeedbackModal(true);
    }
    setIsSubmitting(false);
  };
  
  const handleProceed = () => {
    const newProgress = getTopicProgress(topicId);
    const setFinished = newProgress.currentSet.questionsAttempted >= settings.questionsPerSet;
    if (setFinished) {
      setView('stats');
    } else {
      setQuestionIndex(prev => prev + 1);
    }
  }

  const handleNextFromModal = () => {
    setShowFeedbackModal(false);
    handleProceed();
  };
  
  const handleStartNewSet = () => {
    startNewSet(topicId);
    setQuestionIndex(0);
    setView('practice');
  }

  const handleReturnToTopics = () => {
    router.push('/');
  }
  
  const inputBorderColor = {
    idle: 'border-input',
    correct: 'border-primary ring-2 ring-primary',
    incorrect: 'border-destructive ring-2 ring-destructive',
  }[status];

  if (!topic) {
    return null;
  }
  
  const currentProgressForRender = getTopicProgress(topicId);

  if (view === 'stats') {
    return (
      <StatsCard 
        topic={topic} 
        stats={currentProgressForRender.currentSet}
        onStartNewSet={handleStartNewSet}
        onReturnToTopics={handleReturnToTopics}
      />
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Topics
      </Button>

      <Card className="overflow-hidden transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-2xl">{topic.name} Practice</CardTitle>
            <div className="flex items-center text-lg font-semibold text-muted-foreground">
              <TimerIcon className="mr-2 h-5 w-5" />
              <span>{time}s</span>
            </div>
          </div>
          <CardDescription>Question {currentProgressForRender.currentSet.questionsAttempted + 1} of {settings.questionsPerSet}</CardDescription>
          <Progress value={((currentProgressForRender.currentSet.questionsAttempted) / settings.questionsPerSet) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="min-h-[200px]">
          {loading || !currentQuestion ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="text-xl font-semibold text-foreground">
                  {currentQuestion?.hasErrorRange && <span className="text-destructive mr-1 text-2xl">*</span>}
                  <Latex content={currentQuestion?.text ?? ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer" className="font-medium">Your Answer</Label>
                <Input
                  id="answer"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={userAnswer}
                  onChange={(e) => {
                    const { value } = e.target;
                    const sanitizedValue = value.replace(/[^0-9.,]/g, '');
                    setUserAnswer(sanitizedValue);
                  }}
                  disabled={isSubmitting || status === 'correct'}
                  className={cn('text-lg transition-all duration-300', inputBorderColor)}
                />
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || loading || !userAnswer || status === 'correct'}
            className="w-full"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center font-headline">
              <Lightbulb className="mr-2 h-5 w-5 text-accent" />
              Incorrect
            </DialogTitle>
            <DialogDescription>
              Here is the correct answer.
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto rounded-md border bg-secondary/50 p-4">
            {feedback}
          </div>
          <DialogFooter>
            <Button onClick={handleNextFromModal} className="w-full">
              {getTopicProgress(topicId).currentSet.questionsAttempted >= settings.questionsPerSet ? 'View Stats' : 'Next Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
