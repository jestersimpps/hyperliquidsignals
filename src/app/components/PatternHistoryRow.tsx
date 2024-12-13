'use client';

import { useState, useEffect } from 'react';
import { useWebSocketMids } from '../hooks/useWebSocketMids';

interface PatternEvent {
  coin: string;
  timestamp: number;
  type: 'support' | 'resistance';
  price: number;
  message: string;
  pressure?: 'buy' | 'sell' | 'neutral';
}

export default function PatternHistoryRow({ event, index }: { event: PatternEvent; index: number }) {
  const [pressure, setPressure] = useState<'buy' | 'sell' | 'neutral'>(event.pressure || 'neutral');

  const handleMidsMessage = (mids: Array<{ coin: string; mid: string }>) => {
    if (Array.isArray(mids)) {
      const coinData = mids.find(mid => mid.coin === event.coin);
      if (coinData) {
        // Simple pressure calculation based on mid price changes
        const currentMid = parseFloat(coinData.mid);
        setPressure(currentMid > event.price ? 'buy' : currentMid < event.price ? 'sell' : 'neutral');
      }
    }
  };

  useWebSocketMids(handleMidsMessage);
  return (
    <div key={`${event.coin}-${event.timestamp}-${index}`} className="flex items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-2">
        <div 
          className={`w-2 h-2 rounded-full ${
            event.type === 'support' 
              ? 'bg-[rgb(22,199,132)]'
              : 'bg-[rgb(255,99,132)]'
          }`} 
        />
        <span className="font-medium">{event.coin}</span>
        <span className="text-gray-500">
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
        <span>
          {event.type === 'support' ? 'Support' : 'Resistance'} at ${event.price.toFixed(2)}
        </span>
        <span className="text-gray-500">
          {event.message}
        </span>
      </div>
      {event.pressure && (
        <div className="flex items-center gap-2">
          <span className={`${
            event.pressure === 'buy' 
              ? 'text-green-500' 
              : event.pressure === 'sell' 
                ? 'text-red-500' 
                : 'text-gray-500'
          }`}>
            {event.pressure} pressure
          </span>
          <div className="bg-gray-200 dark:bg-gray-800 rounded h-2 w-20">
            <div 
              className={`h-full rounded ${
                event.pressure === 'buy' 
                  ? 'bg-green-500' 
                  : event.pressure === 'sell'
                    ? 'bg-red-500'
                    : 'bg-gray-500'
              }`}
              style={{ 
                width: `${event.pressure === 'buy' ? '60%' : event.pressure === 'sell' ? '40%' : '50%'}`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
