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
    const socket = new WebSocket('wss://api.hyperliquid.xyz/ws');

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
    const cleanup = ws((message: WsResponse<any>) => {
      if (!Array.isArray(message.data)) return;
      
      message.data.forEach(trade => {
        if (trade.coin !== coin) return;
        
        const volume = parseFloat(trade.sz);
        const isBuy = trade.side === 'B';
        
        // Update pressure based on this single trade
        setPressure(prev => {
          const newBuyVolume = isBuy ? prev.buyVolume + volume : prev.buyVolume;
          const newSellVolume = !isBuy ? prev.sellVolume + volume : prev.sellVolume;
          const newNetVolume = newBuyVolume - newSellVolume;
          
          // Determine pressure based on this trade's size relative to recent activity
          let newPressure: 'buy' | 'sell' | 'neutral';
          if (volume > (prev.buyVolume + prev.sellVolume) * 0.1) { // If trade is significant (>10% of recent volume)
            newPressure = isBuy ? 'buy' : 'sell';
          } else {
            newPressure = prev.pressure; // Maintain current pressure for smaller trades
          }
          
          return {
            buyVolume: newBuyVolume,
            sellVolume: newSellVolume,
            netVolume: newNetVolume,
            pressure: newPressure
          };
        });
      });
    });

    return cleanup;
  }, [ws]);

  return pressure;
}
