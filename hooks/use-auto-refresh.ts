'use client';

import { useEffect, useRef, useState } from 'react';

type RefreshInterval = 'manual' | '5' | '15' | '30' | '60';

export function useAutoRefresh(
  refreshInterval: RefreshInterval,
  onRefresh: () => void
) {
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  
  const onRefreshRef = useRef(onRefresh);

  // Update onRefresh reference without triggering effect
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const resetTimer = () => {
    setResetKey(prev => prev + 1);
  };

  useEffect(() => {
    if (refreshInterval === 'manual') {
      setIsAutoRefreshing(false);
      return;
    }
    
    setIsAutoRefreshing(true);
    resetTimer(); // Reset CSS animation on interval changes
    
    const intervalMs = Number(refreshInterval) * 1000;
    
    const timer = setInterval(() => {
      onRefreshRef.current();
      setResetKey(prev => prev + 1);
    }, intervalMs);
    
    return () => {
      clearInterval(timer);
      setIsAutoRefreshing(false);
    };
  }, [refreshInterval]);

  return { isAutoRefreshing, resetKey, resetTimer };
}
