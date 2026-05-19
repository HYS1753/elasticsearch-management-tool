import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { RefreshCw } from 'lucide-react';

export type RefreshInterval = 'manual' | '5' | '15' | '30' | '60';

interface RefreshControlsProps {
  refreshInterval: RefreshInterval;
  onRefreshIntervalChange: (interval: RefreshInterval) => void;
  onRefresh: () => void;
  isAutoRefreshing: boolean;
  resetKey: number;
  loading?: boolean;
}

export function RefreshControls({
  refreshInterval,
  onRefreshIntervalChange,
  onRefresh,
  isAutoRefreshing,
  resetKey,
  loading = false,
}: RefreshControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Interval Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-slate-200 dark:border-slate-800 min-w-[110px]">
            {refreshInterval === 'manual' ? 'Manual' : `${refreshInterval}s`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup 
            value={refreshInterval} 
            onValueChange={v => onRefreshIntervalChange(v as RefreshInterval)}
          >
            <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="5">5 Sec</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="15">15 Sec</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="30">30 Sec</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="60">60 Sec</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Refresh Button with progress */}
      <Button 
        onClick={onRefresh} 
        variant="outline" 
        className="gap-2 border-slate-200 dark:border-slate-800 relative overflow-hidden" 
        disabled={loading}
      >
        {/* Progress background */}
        {isAutoRefreshing && (
          <>
            <style>{`
              @keyframes progressBar {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
            <div 
              key={resetKey}
              className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/45 pointer-events-none origin-left left-0 top-0 bottom-0"
              style={{ 
                animation: `progressBar ${refreshInterval}s linear forwards`
              }}
            />
          </>
        )}
        {/* Button content */}
        <span className="relative z-10 flex items-center gap-2">
          {isAutoRefreshing || loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </span>
      </Button>
    </div>
  );
}
