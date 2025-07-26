'use client';

import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/use-settings';
import { useProgress } from '@/hooks/use-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { settings, saveSettings } = useSettings();
  const { clearProgress } = useProgress();
  const { setTheme } = useTheme();
  const { toast } = useToast();

  const handleClearProgress = () => {
    clearProgress();
    toast({
      title: 'Progress Cleared',
      description: 'Your practice history has been successfully reset.',
    });
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold font-headline mb-8">Settings</h1>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Practice</CardTitle>
            <CardDescription>
              Customize your practice sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="questions-per-set">Questions per set</Label>
                <Select
                  value={settings.questionsPerSet.toString()}
                  onValueChange={(value) =>
                    saveSettings({ questionsPerSet: parseInt(value, 10) })
                  }
                >
                  <SelectTrigger id="questions-per-set" className="w-[180px]">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="15">15 questions</SelectItem>
                    <SelectItem value="20">20 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Appearance</CardTitle>
            <CardDescription>
              Adjust how the app looks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => {
                  saveSettings({ theme: value as 'light' | 'dark' | 'system' });
                  setTheme(value as 'light' | 'dark' | 'system');
                }}
              >
                <SelectTrigger id="theme" className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              These actions are irreversible. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between">
                <div className="pr-4">
                    <p className="font-medium">Clear All Progress</p>
                    <p className="text-sm text-muted-foreground">This will permanently delete all your practice history and scores.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Clear Progress</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your
                        practice data from this device.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearProgress}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
