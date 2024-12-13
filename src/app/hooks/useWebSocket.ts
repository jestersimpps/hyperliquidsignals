'use client';

import { useEffect, useRef } from 'react';
import { API_CONFIG } from '../api/config';

export function useWebSocket(onMessage: (data: any) => void) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket(API_CONFIG.WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        if (ws.current) {
          ws.current.send(JSON.stringify({
            method: "subscribe",
            subscription: {
              type: "allMids",
            },
          }));
        }
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [onMessage]);
}
