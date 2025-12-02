/**
 * Optimized React Query Hook with Smart Polling and Performance Features
 * 
 * Provides intelligent polling strategies based on:
 * - Page visibility
 * - Network conditions
 * - User interaction
 * - Performance metrics
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';

interface OptimizedQueryOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  baseInterval?: number;
  enableVisibilityOptimization?: boolean;
  enableNetworkOptimization?: boolean;
  slowNetworkThreshold?: number;
  fastNetworkInterval?: number;
  slowNetworkInterval?: number;
  staleTime?: number;
  gcTime?: number;
}

interface NetworkStatus {
  isOnline: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'fast';
  rtt: number;
  downlink: number;
}

export const useOptimizedReactQuery = (options: OptimizedQueryOptions) => {
  const queryClient = useQueryClient();
  const isVisibleRef = useRef(true);
  const lastUserInteractionRef = useRef(Date.now());
  const networkStatusRef = useRef<NetworkStatus>({
    isOnline: navigator.onLine,
    effectiveType: 'fast',
    rtt: 100,
    downlink: 0
  });

  // Monitor page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Monitor network conditions
  useEffect(() => {
    const handleOnline = () => {
      networkStatusRef.current.isOnline = true;
    };
    
    const handleOffline = () => {
      networkStatusRef.current.isOnline = false;
    };

    const handleConnectionChange = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          networkStatusRef.current = {
            isOnline: navigator.onLine,
            effectiveType: connection.effectiveType || 'fast',
            rtt: connection.rtt || 100,
            downlink: connection.downlink || 0
          };
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('change', handleConnectionChange);
    
    // Initial network detection
    handleConnectionChange();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('change', handleConnectionChange);
    };
  }, []);

  // Track user interaction for adaptive polling
  useEffect(() => {
    const handleUserInteraction = () => {
      lastUserInteractionRef.current = Date.now();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Calculate optimal polling interval
  const calculateOptimalInterval = useCallback(() => {
    const {
      baseInterval = 3000,
      enableVisibilityOptimization = true,
      enableNetworkOptimization = true,
      slowNetworkThreshold = 1000,
      fastNetworkInterval = 2000,
      slowNetworkInterval = 5000,
      networkStatusRef: currentNetworkStatus
    } = options;

    let interval = baseInterval;

    // Visibility optimization: pause when page is hidden
    if (enableVisibilityOptimization && !isVisibleRef.current) {
      return false; // Don't poll when page is hidden
    }

    // Network optimization: adjust based on connection quality
    if (enableNetworkOptimization && currentNetworkStatus) {
      const { effectiveType, rtt } = currentNetworkStatus;
      
      if (effectiveType === 'slow-2g' || rtt > slowNetworkThreshold) {
        interval = slowNetworkInterval;
      } else if (effectiveType === '2g' || rtt > 500) {
        interval = baseInterval * 1.5; // 4.5s for 2g
      } else if (effectiveType === '3g') {
        interval = baseInterval * 0.8; // 2.4s for 3g
      } else {
        interval = fastNetworkInterval || baseInterval * 0.67; // 2s for fast
      }
    }

    // User interaction optimization: more frequent when recently active
    const timeSinceLastInteraction = Date.now() - lastUserInteractionRef.current;
    if (timeSinceLastInteraction < 30000) { // Within 30 seconds
      interval = interval * 0.5; // Double frequency when active
    }

    return Math.max(1000, interval); // Minimum 1 second
  }, [options, isVisibleRef.current, networkStatusRef.current, lastUserInteractionRef.current]);

  // Invalidate queries on network reconnection
  useEffect(() => {
    const handleReconnect = () => {
      // Invalidate all queries when coming back online
      if (networkStatusRef.current.isOnline) {
        queryClient.invalidateQueries();
      }
    };

    window.addEventListener('online', handleReconnect);
    
    return () => {
      window.removeEventListener('online', handleReconnect);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    refetchInterval: calculateOptimalInterval(),
    staleTime: options.staleTime || 2000,
    gcTime: options.gcTime || 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Adaptive retry strategy
      if (error?.message?.includes('network') || failureCount < 2) {
        return 2; // Quick retry for network errors
      } else if (failureCount < 3) {
        return 3; // Standard retry
      }
      return false; // No more retries after 3 attempts
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff with jitter
      const baseDelay = 1000 * 2 ** attemptIndex;
      const jitter = Math.random() * 500; // Add jitter to prevent thundering herd
      return Math.min(baseDelay + jitter, 30000);
    },
  });

  // Manual refetch function
  const manualRefetch = useCallback(() => {
    lastUserInteractionRef.current = Date.now();
    query.refetch();
  }, [query.refetch]);

  return {
    query,
    manualRefetch,
    currentInterval: calculateOptimalInterval(),
    isVisible: isVisibleRef.current,
    networkStatus: networkStatusRef.current,
    timeSinceLastInteraction: Date.now() - lastUserInteractionRef.current
  };
};

export default useOptimizedReactQuery;