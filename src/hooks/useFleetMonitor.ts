import { useState, useEffect, useRef } from 'react';

// تعريف شكل البيانات القادمة من Durable Object
export interface AgentHealth {
  id: string;
  name: string;
  type: string;
  health: number;
  cpu: number;
  status: 'active' | 'idle' | 'flagged' | 'offline';
  lastUpdate: number;
  activeConnections: number;
  tasksProcessed: number;
  responseTime: number;
  predictionStatus?: string;
  predictionColor?: string;
}

export const useFleetMonitor = () => {
  const [agents, setAgents] = useState<AgentHealth[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // رابط الـ Worker الذي نشرته للتو
  const WS_URL = 'wss://fleet-monitor-production.amrikyy.workers.dev/ws';

  useEffect(() => {
    // 1. بدء الاتصال
    const connect = () => {
      if (ws.current?.readyState === WebSocket.OPEN) return;

      setConnectionStatus('connecting');
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('🔌 Quantum Uplink Established');
        setIsConnected(true);
        setConnectionStatus('connected');

        // Clear any pending reconnection
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          // استقبال البيانات الحية وتحديث الحالة
          const data = JSON.parse(event.data);

          // إذا كانت البيانات مصفوفة وكلاء، نحدث الحالة
          if (data.type === 'fleet_update' && data.agents) {
            setAgents(data.agents);
          }
          // معالجة تحديثات فردية (اختياري)
          else if (data.type === 'UPDATE_AGENT') {
            setAgents(prev => prev.map(a => a.id === data.payload.id ? data.payload : a));
          }
        } catch (e) {
          console.error('Data parsing error:', e);
        }
      };

      ws.current.onclose = () => {
        console.log('🔌 Uplink Disconnected. Retrying...');
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // إعادة الاتصال التلقائي بعد 3 ثواني (Resilience)
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    };

    connect();

    // التنظيف عند الخروج
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      ws.current?.close();
    };
  }, []);

  // Send ping to keep connection alive
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, []);

  return { agents, isConnected, connectionStatus };
};