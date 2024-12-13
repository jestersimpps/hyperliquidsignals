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
  }, [coin, ws.current?.readyState]);
}
