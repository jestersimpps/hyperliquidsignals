"use client";

import { useEffect, useRef, useCallback } from "react";
import { API_CONFIG } from "../api/config";
import { WsSubscriptionMessage, WsResponse, WsCandleData } from "../../types/hyperliquid-ws";
import { WsSubscription } from "@/types/websocket";

interface CandleSubscription {
  coin: string;
  interval: string;
}

export function useWebSocketCandles(
  onMessage: (data: any) => void,
  subscription: CandleSubscription
) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (ws.current?.readyState !== WebSocket.OPEN) {
      ws.current = new WebSocket(API_CONFIG.WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log("Candles WebSocket connected");
        const message: WsSubscriptionMessage = {
          method: "subscribe",
          subscription: {
            type: "candle",
            coin: subscription.coin,
            interval: subscription.interval,
          }
        };
        ws.current?.send(JSON.stringify(message));
      };

      ws.current.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data) as WsResponse<WsCandleData>;
          if (response.channel === "candle" && response.data) {
            onMessage(response);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onerror = (error) => {
        console.error("Candles WebSocket error:", error);
      };

      ws.current.onclose = () => {
        console.log("Candles WebSocket disconnected, attempting to reconnect...");
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    }
  }, [onMessage, subscription]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        console.log("Closing Candles WebSocket connection");
        if (ws.current.readyState === WebSocket.OPEN) {
          const unsubscribeMessage: WsSubscription = {
            method: "unsubscribe",
            subscription: {
              type: "candle",
              coin: subscription.coin,
              interval: subscription.interval,
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
