'use client';

import { useEffect, useRef, useCallback } from 'react';
import { API_CONFIG } from '../api/config';
import { WsSubscriptionMessage, WsResponse, WsAllMidsData } from '../../types/hyperliquid-ws';

export function useWebSocketMids(onMessage: (data: any) => void) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (ws.current?.readyState !== WebSocket.OPEN) {
      ws.current = new WebSocket(API_CONFIG.WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        const message: WsSubscriptionMessage = {
          method: 'subscribe',
          subscription: {
            type: 'allMids'
          }
        };
        ws.current?.send(JSON.stringify(message));
      };

      ws.current.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data) as WsResponse<WsAllMidsData>;
          if (response.channel === "allMids" && response.data?.mids) {
            onMessage(response);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
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
  }, [onMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        console.log('Closing AllMids WebSocket connection');
        if (ws.current.readyState === WebSocket.OPEN) {
          const unsubscribeMessage: WsSubscription = {
            method: 'unsubscribe',
            subscription: {
              type: 'allMids'
            },
          };
          ws.current.send(JSON.stringify(unsubscribeMessage));
        }
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);
}
