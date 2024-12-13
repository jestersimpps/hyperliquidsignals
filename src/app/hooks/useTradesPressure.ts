'use client';

import { useState, useEffect, useCallback } from 'react';
import { WsSubscriptionMessage, WsResponse } from '../../types/hyperliquid-ws';

interface TradePressure {
  buyVolume: number;
  sellVolume: number;
  netVolume: number;
  pressure: 'buy' | 'sell' | 'neutral';
}

export function useTradesPressure(coin: string) {
  const [pressure, setPressure] = useState<TradePressure>({
    buyVolume: 0,
    sellVolume: 0,
    netVolume: 0,
    pressure: 'neutral'
  });

  const ws = useCallback((onMessage: (data: any) => void) => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'wss://api.hyperliquid.xyz/ws');

    socket.onopen = () => {
      console.log('Trade WebSocket connected');
      const message: WsSubscriptionMessage = {
        method: 'subscribe',
        subscription: {
          type: 'trades',
          coin
        }
      };
      socket.send(JSON.stringify(message));
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.channel === "trades") {
          onMessage(response);
        }
      } catch (error) {
        console.error("Error parsing trade WebSocket message:", error);
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        const unsubscribeMessage: WsSubscriptionMessage = {
          method: 'unsubscribe',
          subscription: {
            type: 'trades',
            coin
          }
        };
        socket.send(JSON.stringify(unsubscribeMessage));
      }
      socket.close();
    };
  }, [coin]);

  useEffect(() => {
    const WINDOW_SIZE = 5 * 60 * 1000; // 5 minutes
    let trades: Array<{ timestamp: number; volume: number }> = [];

    const cleanup = ws((message: WsResponse<any>) => {
      const trade = message.data;
      const volume = parseFloat(trade.sz);
      const isBuy = trade.isBuy || trade.side === 'B';
      
      // Add new trade
      trades.push({
        timestamp: Date.now(),
        volume: isBuy ? volume : -volume
      });

      // Remove trades older than window size
      const cutoff = Date.now() - WINDOW_SIZE;
      trades = trades.filter(t => t.timestamp > cutoff);

      // Calculate pressure
      const buyVolume = trades
        .filter(t => t.volume > 0)
        .reduce((sum, t) => sum + t.volume, 0);
      
      const sellVolume = Math.abs(trades
        .filter(t => t.volume < 0)
        .reduce((sum, t) => sum + t.volume, 0));

      const netVolume = buyVolume - sellVolume;
      
      // Determine pressure (threshold of 20% difference)
      let pressure: 'buy' | 'sell' | 'neutral' = 'neutral';
      const totalVolume = buyVolume + sellVolume;
      if (totalVolume > 0) {
        const buyPercentage = (buyVolume / totalVolume) * 100;
        if (buyPercentage >= 60) pressure = 'buy';
        else if (buyPercentage <= 40) pressure = 'sell';
      }

      setPressure({
        buyVolume,
        sellVolume,
        netVolume,
        pressure
      });
    });

    return cleanup;
  }, [ws]);

  return pressure;
}
