'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Maximize2, Minimize2, Moon, Sun, Monitor, Settings2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    // Check initial fullscreen state
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('Failed to toggle fullscreen:', err);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400 dark:text-slate-300">
        <Settings2 className="h-4 w-4" />
        Settings
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">
          <Settings2 className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-50">Global Settings</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Manage your dashboard theme and view preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Theme Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none dark:text-slate-200">Appearance</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`flex flex-col items-center gap-2 h-auto py-3 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 ${
                  theme === 'light' ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-500/10' : ''
                }`}
                onClick={() => setTheme('light')}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs">Light</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`flex flex-col items-center gap-2 h-auto py-3 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 ${
                  theme === 'dark' ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-500/10' : ''
                }`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs">Dark</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`flex flex-col items-center gap-2 h-auto py-3 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 ${
                  theme === 'system' ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-500/10' : ''
                }`}
                onClick={() => setTheme('system')}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-xs">System</span>
              </Button>
            </div>
          </div>

          {/* View Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium leading-none dark:text-slate-200">Monitoring View</h4>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-4 dark:bg-slate-900">
              <div className="space-y-0.5">
                <Label className="text-base dark:text-slate-200">Fullscreen Mode</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Expand the dashboard to cover the entire screen.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isFullscreen ? <Minimize2 className="h-4 w-4 text-slate-400" /> : <Maximize2 className="h-4 w-4 text-slate-400" />}
                <Switch
                  checked={isFullscreen}
                  onCheckedChange={toggleFullscreen}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
