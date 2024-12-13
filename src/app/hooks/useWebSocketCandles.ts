import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { WsCandle } from '@/types/websocket';

export function useWebSocketCandles(
  coin: string, 
  onCandleUpdate: (candle: WsCandle) => void
) {
  const handleMessage = (data: any) => {
    if (data.channel === 'candle' && data.data) {
      onCandleUpdate(data.data);
    }
  };

  const ws = useWebSocket(handleMessage);

  useEffect(() => {
    const subscribe = () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          method: 'subscribe',
          subscription: {
            type: 'candle',
            coin: coin,
            interval: '5m'
          }
        }));
      }
    };

    // Subscribe immediately if connection is already open
    subscribe();

    // Add event listener for when the connection opens
    if (ws.current) {
      ws.current.addEventListener('open', subscribe);
    }

    return () => {
      if (ws.current) {
        ws.current.removeEventListener('open', subscribe);
      }
    };
  }, [coin]);
}
