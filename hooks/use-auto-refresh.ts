import { useEffect, useRef, useState, useCallback } from 'react';

type RefreshInterval = 'manual' | '5' | '15' | '30' | '60';

export function useAutoRefresh(
  refreshInterval: RefreshInterval,
  onRefresh: () => void
) {
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onRefreshRef = useRef(onRefresh);

  // Update onRefresh reference without triggering effect
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (refreshInterval === 'manual') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (refreshProgressIntervalRef.current) {
        clearInterval(refreshProgressIntervalRef.current);
        refreshProgressIntervalRef.current = null;
      }
      setIsAutoRefreshing(false);
      setRefreshProgress(0);
      return;
    }
    
    setIsAutoRefreshing(true);
    setRefreshProgress(0);
    
    const intervalMs = Number(refreshInterval) * 1000;
    const updateInterval = 50;
    const increment = (updateInterval / intervalMs) * 100;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (refreshProgressIntervalRef.current) clearInterval(refreshProgressIntervalRef.current);
    
    refreshProgressIntervalRef.current = setInterval(() => {
      setRefreshProgress(prev => {
        const next = prev + increment;
        if (next >= 100) return 0;
        return next;
      });
    }, updateInterval);
    
    intervalRef.current = setInterval(() => {
      setRefreshProgress(0);
      onRefreshRef.current();
    }, intervalMs);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (refreshProgressIntervalRef.current) {
        clearInterval(refreshProgressIntervalRef.current);
        refreshProgressIntervalRef.current = null;
      }
      setIsAutoRefreshing(false);
      setRefreshProgress(0);
    };
  }, [refreshInterval]);

  return { isAutoRefreshing, refreshProgress };
}
