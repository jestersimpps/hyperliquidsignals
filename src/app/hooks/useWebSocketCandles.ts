import { useEffect, useRef } from 'react';
import { WsCandle } from '@/types/websocket';

export function useWebSocketCandles(
  coin: string, 
  onCandleUpdate: (candle: WsCandle) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: {
          type: 'candle',
          coin: coin,
          interval: '5m'
        }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'candle') {
        onCandleUpdate(data);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [coin, onCandleUpdate]);
}
