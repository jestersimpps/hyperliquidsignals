"use client";

import { useEffect, useRef, useCallback } from "react";
import { API_CONFIG } from "../api/config";
import { WsSubscription } from "../../types/websocket";

export function useWebSocketMids(onMessage: (data: any) => void) {
 const ws = useRef<WebSocket | null>(null);
 const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

 const connect = useCallback(() => {
  if (ws.current?.readyState !== WebSocket.OPEN) {
   ws.current = new WebSocket(API_CONFIG.WEBSOCKET_URL);

   ws.current.onopen = () => {
    console.log("WebSocket connected");
    // Subscribe to allMids
    const message: WsSubscription = {
     method: "subscribe",
     subscription: {
      type: "allMids",
     },
    };
    ws.current?.send(JSON.stringify(message));
   };

   ws.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("WebSocket message received:", data);
    onMessage(data);
   };

   ws.current.onerror = (error) => {
    console.error("WebSocket error:", error);
   };

   ws.current.onclose = () => {
    console.log("WebSocket disconnected, attempting to reconnect...");
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
    ws.current.close();
    ws.current = null;
   }
  };
 }, [connect]);
}
"use client";

import { useEffect, useRef, useCallback } from "react";
import { API_CONFIG } from "../api/config";
import { WsSubscription } from "../../types/websocket";

export function useWebSocketMids(onMessage: (data: any) => void) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (ws.current?.readyState !== WebSocket.OPEN) {
      ws.current = new WebSocket(API_CONFIG.WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log("Mids WebSocket connected");
        const message: WsSubscription = {
          method: "subscribe",
          subscription: {
            type: "allMids"
          },
        };
        ws.current?.send(JSON.stringify(message));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      ws.current.onerror = (error) => {
        console.error("Mids WebSocket error:", error);
      };

      ws.current.onclose = () => {
        console.log("Mids WebSocket disconnected, attempting to reconnect...");
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
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);
}
