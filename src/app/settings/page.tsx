'use client';

import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/use-settings';
import { useProgress } from '@/hooks/use-progress';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Slider } from '@/components/ui/slider';

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
            <CardDescription>Customize your practice sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="questions-per-set">Questions per set</Label>
                  <span className="text-sm text-muted-foreground font-medium">
                    {settings.questionsPerSet}
                  </span>
                </div>
                <Slider
                  id="questions-per-set"
                  min={5}
                  max={100}
                  step={5}
                  value={[settings.questionsPerSet]}
                  onValueChange={(value) =>
                    saveSettings({ questionsPerSet: value[0] })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Appearance</CardTitle>
            <CardDescription>Adjust how the app looks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="color-theme">Color Theme</Label>
              <Select
                value={settings.colorTheme}
                onValueChange={(value) => {
                  saveSettings({ colorTheme: value });
                }}
              >
                <SelectTrigger id="color-theme" className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theme-default">Default</SelectItem>
                  <SelectItem value="theme-mint">Mint</SelectItem>
                  <SelectItem value="theme-rose">Rose</SelectItem>
                  <SelectItem value="theme-violet">Violet</SelectItem>
                  <SelectItem value="theme-amber">Amber</SelectItem>
                  <SelectItem value="theme-teal">Teal</SelectItem>
                  <SelectItem value="theme-cyan">Cyan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Mode</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => {
                  saveSettings({
                    theme: value as 'light' | 'dark' | 'system',
                  });
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
            <CardTitle className="font-headline text-destructive">
              Danger Zone
            </CardTitle>
            <CardDescription>
              These actions are irreversible. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <p className="font-medium">Clear All Progress</p>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all your practice history and
                  scores.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Clear Progress</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all your practice data from this device.
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
