
'use client';

import { useState, useEffect, useCallback, useMemo, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { generateEstimationQuestion, GenerateEstimationQuestionOutput } from '@/ai/flows/generate-estimation-questions';
import { provideFeedbackOnEstimate } from '@/ai/flows/provide-feedback-on-estimate';
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
import { ArrowLeft, Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Status = 'idle' | 'correct' | 'incorrect';

export default function PracticePage({ params }: { params: { topicId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { topicId } = use(params);
  const topic = useMemo(() => getTopic(topicId), [topicId]);
  
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState<GenerateEstimationQuestionOutput | null>(null);
  const [userEstimate, setUserEstimate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  
  const { settings } = useSettings();
  const { getTopicProgress, updateTopicProgress } = useProgress();
  const topicProgress = getTopicProgress(topicId);

  const questionsAttemptedInSet = topicProgress.attempted % settings.questionsPerSet;

  const fetchQuestion = useCallback(async () => {
    if (!topic) return;
    setLoading(true);
    setStatus('idle');
    setUserEstimate('');
    try {
      const data = await generateEstimationQuestion({
        topic: topic.name,
        exampleQuestions: topic.exampleQuestions.join('\n'),
      });
      setQuestionData(data);
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
    } else {
      fetchQuestion();
    }
  }, [topic, fetchQuestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEstimate || !questionData) return;

    setIsSubmitting(true);
    const userAnswer = parseFloat(userEstimate.replace(/,/g, ''));
    const correctAnswer = questionData.answer;

    // Consider it correct if within 25% margin of error for estimation tasks
    const isCorrect = Math.abs(userAnswer - correctAnswer) / correctAnswer <= 0.25;

    updateTopicProgress(topicId, { isCorrect });

    if (isCorrect) {
      setStatus('correct');
      toast({
        title: 'Correct!',
        description: 'Great estimation! Loading next question...',
      });
      setTimeout(() => {
        fetchQuestion();
      }, 1500);
    } else {
      setStatus('incorrect');
      try {
        const feedbackResponse = await provideFeedbackOnEstimate({
          question: questionData.question,
          userEstimate: userAnswer,
          correctAnswer: correctAnswer,
        });
        setFeedback(feedbackResponse.feedback);
        setShowFeedbackModal(true);
      } catch (error) {
        console.error('Failed to get feedback:', error);
        setFeedback('Sorry, we couldn\'t generate detailed feedback right now. The correct answer was ' + correctAnswer.toLocaleString() + '.');
        setShowFeedbackModal(true);
      }
    }
    setIsSubmitting(false);
  };

  const handleNextFromModal = () => {
    setShowFeedbackModal(false);
    fetchQuestion();
  };
  
  const inputBorderColor = {
    idle: 'border-input',
    correct: 'border-primary ring-2 ring-primary',
    incorrect: 'border-destructive ring-2 ring-destructive',
  }[status];

  if (!topic) {
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Topics
      </Button>

      <Card className="overflow-hidden transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{topic.name} Practice</CardTitle>
          <CardDescription>Question {questionsAttemptedInSet + 1} of {settings.questionsPerSet}</CardDescription>
          <Progress value={((questionsAttemptedInSet + 1) / settings.questionsPerSet) * 100} className="mt-2" />
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
                  {questionData?.question}
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimate" className="font-medium">Your Estimate</Label>
                <Input
                  id="estimate"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9,.]*"
                  placeholder="e.g., 1,200,000"
                  value={userEstimate}
                  onChange={(e) => setUserEstimate(e.target.value)}
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
            disabled={isSubmitting || loading || !userEstimate || status === 'correct'}
            className="w-full"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Checking...' : 'Submit Estimate'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center font-headline">
              <Lightbulb className="mr-2 h-5 w-5 text-accent" />
              Feedback
            </DialogTitle>
            <DialogDescription>
              Here is some feedback on your estimate.
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto rounded-md border bg-secondary/50 p-4">
            {feedback}
          </div>
          <DialogFooter>
            <Button onClick={handleNextFromModal} className="w-full">
              Next Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
