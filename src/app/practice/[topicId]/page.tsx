
'use client';

import { useState, useEffect, useCallback, useMemo, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { generateEstimationQuestion, GenerateEstimationQuestionOutput } from '@/ai/flows/generate-estimation-questions';
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

type Status = 'idle' | 'correct' | 'incorrect';
type View = 'practice' | 'stats';

export default function PracticePage({ params }: { params: { topicId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { topicId } = use(params);
  const topic = useMemo(() => getTopic(topicId), [topicId]);
  
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState<GenerateEstimationQuestionOutput | null>(null);
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

  const questionsAttemptedInSet = topicProgress.currentSet.questionsAttempted;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const fetchQuestion = useCallback(async () => {
    if (!topic) return;
    setLoading(true);
    setStatus('idle');
    setUserAnswer('');
    setTime(0);
    try {
      const data = await generateEstimationQuestion({
        topic: topic.name,
        exampleQuestions: topic.exampleQuestions.join('\n'),
      });
      setQuestionData(data);
      setTimerRunning(true);
    } catch (error) {
      console.error('Failed to generate question:', error);
      toast({
        title: 'Error',
        description: 'Could not generate a new question. Please try again later.',
        variant: 'destructive',
      });
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [topic, router, toast]);

  useEffect(() => {
    if (!topic) {
      notFound();
      return;
    }
    const currentProgress = getTopicProgress(topicId);
    if(currentProgress.currentSet.questionsAttempted === 0) {
      fetchQuestion();
    } else if (currentProgress.currentSet.questionsAttempted >= settings.questionsPerSet) {
      setView('stats');
    } else {
      fetchQuestion();
    }
  }, [topicId, fetchQuestion, getTopicProgress, settings.questionsPerSet, topic]);
  
  useEffect(() => {
    const currentProgress = getTopicProgress(topicId);
    if (currentProgress.currentSet.questionsAttempted === 0 && view === 'practice') {
        startNewSet(topicId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, view]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer || !questionData) return;
    setTimerRunning(false);

    setIsSubmitting(true);
    const userAnswerNumber = parseFloat(userAnswer.replace(/,/g, ''));
    const correctAnswer = questionData.answer;

    let isCorrect: boolean;
    if (questionData.hasErrorRange) {
      const errorMargin = 0.25;
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
          fetchQuestion();
        }, 1500);
      }
    } else {
      setStatus('incorrect');
      const errorMargin = 0.25;
      const lowerBound = correctAnswer * (1 - errorMargin);
      const upperBound = correctAnswer * (1 + errorMargin);
      
      let feedbackText = `The correct answer is ${correctAnswer.toLocaleString()}.`;
      if(questionData.hasErrorRange) {
        feedbackText = `The correct answer is in the range of ${lowerBound.toLocaleString()} to ${upperBound.toLocaleString()}. The exact answer is ${correctAnswer.toLocaleString()}.`
      }
      setFeedback(feedbackText);
      setShowFeedbackModal(true);
    }
    setIsSubmitting(false);
  };

  const handleNextFromModal = () => {
    setShowFeedbackModal(false);
    const currentProgress = getTopicProgress(topicId); // get latest progress
    const setFinished = currentProgress.currentSet.questionsAttempted >= settings.questionsPerSet;
    if (setFinished) {
      setView('stats');
    } else {
      fetchQuestion();
    }
  };
  
  const handleStartNewSet = () => {
    startNewSet(topicId);
    setView('practice');
    fetchQuestion();
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
  
  // Get latest progress for rendering
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
          <Progress value={((currentProgressForRender.currentSet.questionsAttempted + 1) / settings.questionsPerSet) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="min-h-[200px]">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question" className="text-xl font-semibold text-foreground">
                  {questionData?.hasErrorRange && <span className="text-destructive mr-1">*</span>}
                  {questionData?.question}
                </Label>
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
                    // Allow only numbers, commas, and a single decimal point
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
