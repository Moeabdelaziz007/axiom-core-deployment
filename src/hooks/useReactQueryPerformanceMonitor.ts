/**
 * React Hook for React Query Performance Monitoring
 * 
 * Provides easy integration with React components for performance tracking
 * including render monitoring, query analysis, and real-time metrics
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import ReactQueryPerformanceMonitor, {
  PerformanceMetrics,
  MemoryMetrics,
  PollingMetrics,
  RenderMetrics
} from '@/utils/reactQueryPerformanceMonitor';

interface UsePerformanceMonitorOptions {
  componentName?: string;
  enableRenderTracking?: boolean;
  enableMemoryTracking?: boolean;
  enablePollingTracking?: boolean;
  pollingQueries?: Array<{
    queryKey: string[];
    interval: number;
  }>;
}

interface PerformanceData {
  isMonitoring: boolean;
  metrics: {
    queries: PerformanceMetrics[];
    memory: MemoryMetrics[];
    polling: PollingMetrics[];
    renders: RenderMetrics[];
  };
  summary: {
    totalQueries: number;
    averageResponseTime: number;
    slowQueries: number;
    memoryTrend: 'increasing' | 'decreasing' | 'stable';
    pollingEfficiency: number;
  };
  recommendations: string[];
}

export const useReactQueryPerformanceMonitor = (options: UsePerformanceMonitorOptions = {}) => {
  const {
    componentName = 'UnknownComponent',
    enableRenderTracking = true,
    enableMemoryTracking = true,
    enablePollingTracking = true,
    pollingQueries = []
  } = options;

  const queryClient = useQueryClient();
  const monitorRef = useRef<ReactQueryPerformanceMonitor | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialize performance monitor
  useEffect(() => {
    if (!monitorRef.current && queryClient) {
      monitorRef.current = new ReactQueryPerformanceMonitor(queryClient);
      setIsMonitoring(true);
      
      console.log(`[Performance Monitor] Started monitoring for ${componentName}`);
    }

    return () => {
      if (monitorRef.current) {
        monitorRef.current.stopMonitoring();
        monitorRef.current = null;
        setIsMonitoring(false);
        console.log(`[Performance Monitor] Stopped monitoring for ${componentName}`);
      }
    };
  }, [queryClient, componentName]);

  // Track component renders
  const trackRender = useCallback(() => {
    if (!enableRenderTracking || !monitorRef.current) return;
    
    const finishRender = monitorRef.current!.trackRender(componentName);
    
    // Return cleanup function to be called after render completes
    return () => {
      if (finishRender) finishRender();
    };
  }, [componentName, enableRenderTracking]);

  // Monitor polling queries
  useEffect(() => {
    if (!enablePollingTracking || !monitorRef.current) return;

    pollingQueries.forEach(({ queryKey, interval }) => {
      monitorRef.current!.monitorPolling(queryKey, interval);
    });
  }, [pollingQueries, enablePollingTracking]);

  // Update performance data periodically
  useEffect(() => {
    if (!isMonitoring || !monitorRef.current) return;

    const updateInterval = setInterval(() => {
      try {
        const report = monitorRef.current!.getPerformanceReport();
        setPerformanceData({
          isMonitoring: true,
          metrics: {
            queries: report.queries,
            memory: report.memory,
            polling: report.polling,
            renders: report.renders
          },
          summary: report.summary,
          recommendations: report.recommendations
        });
      } catch (error) {
        console.error('[Performance Monitor] Error updating performance data:', error);
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(updateInterval);
  }, [isMonitoring]);

  // Export performance data
  const exportMetrics = useCallback(() => {
    if (!monitorRef.current) return null;
    return monitorRef.current.exportMetrics();
  }, []);

  // Get current performance summary
  const getPerformanceSummary = useCallback(() => {
    if (!monitorRef.current) return null;
    return monitorRef.current!.getPerformanceReport();
  }, []);

  // Log performance warnings
  useEffect(() => {
    if (!performanceData) return;

    const { summary, recommendations } = performanceData;

    // Log performance warnings
    if (summary.averageResponseTime > 100) {
      console.warn(`[Performance Monitor] High average response time: ${summary.averageResponseTime.toFixed(2)}ms`);
    }

    if (summary.slowQueries > 0) {
      console.warn(`[Performance Monitor] ${summary.slowQueries} slow queries detected`);
    }

    if (summary.pollingEfficiency < 90) {
      console.warn(`[Performance Monitor] Low polling efficiency: ${summary.pollingEfficiency.toFixed(1)}%`);
    }

    if (recommendations.length > 0) {
      console.group(`[Performance Monitor] Recommendations for ${componentName}:`);
      recommendations.forEach(rec => console.warn(`⚠️ ${rec}`));
      console.groupEnd();
    }
  }, [performanceData, componentName]);

  return {
    isMonitoring,
    performanceData,
    trackRender,
    exportMetrics,
    getPerformanceSummary
  };
};

/**
 * Higher-order component for automatic performance monitoring
 */
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  options: UsePerformanceMonitorOptions = {}
) => {
  const WrappedComponent = (props: P) => {
    const { trackRender } = useReactQueryPerformanceMonitor(options);
    const renderTrackerRef = useRef<(() => void) | null>(null);

    // Track render start
    useEffect(() => {
      renderTrackerRef.current = trackRender();
      
      return () => {
        // Complete render tracking
        if (renderTrackerRef.current) {
          renderTrackerRef.current();
        }
      };
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default useReactQueryPerformanceMonitor;