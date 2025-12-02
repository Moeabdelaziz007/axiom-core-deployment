import { useEffect, useRef, useState } from 'react';
import type { AssemblyStage, DashboardMetrics } from '@/types/landing';

export interface FactoryRealtimeUpdate {
  type: 'ASSEMBLY_PROGRESS_UPDATE' | 'METRICS_UPDATE' | 'AGENT_DEPLOYED';
  data: {
    assemblyStages?: AssemblyStage[];
    metrics?: Partial<DashboardMetrics>;
    agentId?: string;
  };
  timestamp: number;
}

export interface UseFactoryRealtimeOptions {
  enabled?: boolean;
  onUpdate?: (update: FactoryRealtimeUpdate) => void;
  onError?: (error: Error) => void;
  reconnectInterval?: number;
}

export function useFactoryRealtime(options: UseFactoryRealtimeOptions = {}) {
  const {
    enabled = true,
    onUpdate,
    onError,
    reconnectInterval = 3000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<FactoryRealtimeUpdate | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws/factory';

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[Factory WebSocket] Connected');
          setIsConnected(true);
          
          // Send initial subscription message
          ws.send(JSON.stringify({
            type: 'SUBSCRIBE',
            channels: ['assembly_line', 'metrics'],
          }));
        };

        ws.onmessage = (event) => {
          try {
            const update: FactoryRealtimeUpdate = JSON.parse(event.data);
            setLastUpdate(update);
            onUpdate?.(update);
          } catch (error) {
            console.error('[Factory WebSocket] Failed to parse message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('[Factory WebSocket] Error:', error);
          const wsError = new Error('WebSocket connection error');
          onError?.(wsError);
        };

        ws.onclose = () => {
          console.log('[Factory WebSocket] Disconnected');
          setIsConnected(false);
          wsRef.current = null;

          // Attempt to reconnect
          if (enabled) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('[Factory WebSocket] Attempting to reconnect...');
              connect();
            }, reconnectInterval);
          }
        };
      } catch (error) {
        console.error('[Factory WebSocket] Connection failed:', error);
        onError?.(error as Error);
      }
    };

    connect();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, onUpdate, onError, reconnectInterval]);

  return {
    isConnected,
    lastUpdate,
    send: (message: unknown) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    },
  };
}