/**
 * Hook for real-time dashboard updates via WebSocket
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { DashboardData, DashboardUpdateType } from './types';
import { DashboardWebSocketService } from './websocket-service';

interface UseDashboardUpdatesOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
  updateTypes?: DashboardUpdateType[];
}

export function useDashboardUpdates(
  initialData: DashboardData,
  wsService: DashboardWebSocketService,
  options: UseDashboardUpdatesOptions = {}
) {
  const { enabled = true, onError, updateTypes = ['metric', 'chart', 'activity'] } = options;

  const [data, setData] = useState<DashboardData>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const unsubscribesRef = useRef<Array<() => void>>([]);

  // Connect to WebSocket
  useEffect(() => {
    if (!enabled) return;

    const connect = async () => {
      try {
        await wsService.connect();
        setIsConnected(true);

        // Subscribe to updates
        updateTypes.forEach(type => {
          const unsubscribe = wsService.subscribe(type, (updateData: any) => {
            setData(prev => {
              const updated = { ...prev };

              if (type === 'metric') {
                updated.kpis = updateData.kpis || prev.kpis;
              } else if (type === 'chart') {
                updated.charts = updateData.charts || prev.charts;
              } else if (type === 'activity') {
                updated.activities = updateData.activities || prev.activities;
              }

              return updated;
            });

            setLastUpdate(new Date());
          });

          unsubscribesRef.current.push(unsubscribe);
        });

        // Request initial update
        wsService.requestUpdate('all');
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to connect to dashboard WebSocket:', error);
        onError?.(error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      // Unsubscribe from all updates
      unsubscribesRef.current.forEach(unsubscribe => unsubscribe());
      unsubscribesRef.current = [];
    };
  }, [enabled, wsService, updateTypes, onError]);

  // Manually request update
  const requestUpdate = useCallback(
    (type: DashboardUpdateType = 'all') => {
      if (isConnected) {
        wsService.requestUpdate(type);
      }
    },
    [isConnected, wsService]
  );

  // Manually update data
  const updateData = useCallback((updates: Partial<DashboardData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setLastUpdate(new Date());
  }, []);

  return {
    data,
    isConnected,
    lastUpdate,
    requestUpdate,
    updateData,
  };
}
