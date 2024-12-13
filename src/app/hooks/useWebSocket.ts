'use client';

import { useEffect, useRef, useCallback } from 'react';
import { API_CONFIG } from '../api/config';
import { WsSubscription } from '../../types/websocket';

interface Subscription {
  type: string;
  coin?: string;
  interval?: string;
}

export function useWebSocket(onMessage: (data: any) => void, subscriptions: Subscription[] = []) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const subscribe = useCallback((subscription: Subscription) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WsSubscription = {
        method: 'subscribe',
        subscription: {
          type: subscription.type,
          coin: subscription.coin,
          interval: subscription.interval,
        },
      };
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const connect = useCallback(() => {
    if (ws.current?.readyState !== WebSocket.OPEN) {
      ws.current = new WebSocket(API_CONFIG.WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        // Subscribe to all requested subscriptions
        subscriptions.forEach(subscription => subscribe(subscription));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        onMessage(data);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    }
  }, [onMessage, subscriptions, subscribe]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);

  return { subscribe };
}
