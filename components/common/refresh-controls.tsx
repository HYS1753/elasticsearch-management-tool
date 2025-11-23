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
  refreshProgress: number;
  loading?: boolean;
}

export function RefreshControls({
  refreshInterval,
  onRefreshIntervalChange,
  onRefresh,
  isAutoRefreshing,
  refreshProgress,
  loading = false,
}: RefreshControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Interval Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-slate-200 min-w-[110px]">
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
        className="gap-2 border-slate-200 relative overflow-hidden" 
        disabled={isAutoRefreshing}
      >
        {/* Progress background */}
        {isAutoRefreshing && (
          <div 
            className="absolute inset-0 bg-slate-300 transition-all duration-75 ease-linear"
            style={{ width: `${refreshProgress}%`, left: 0 }}
          />
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
