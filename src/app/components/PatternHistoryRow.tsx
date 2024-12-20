'use client';

import { useEffect } from 'react';
import { useTradesPressure } from '../hooks/useTradesPressure';

interface PatternEvent {
  coin: string;
  timestamp: number;
  type: 'support' | 'resistance';
  price: number;
  message: string;
  pressure?: 'buy' | 'sell' | 'neutral';
}

import { memo } from 'react';

export default memo(function PatternHistoryRow({ event, index }: { event: PatternEvent; index: number }) {
  const tradePressure = useTradesPressure(event.coin);
  
  // Update the event's pressure when tradePressure changes
  useEffect(() => {
    event.pressure = tradePressure.pressure;
  }, [tradePressure, event]);

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
                width: `${tradePressure.buyVolume + tradePressure.sellVolume > 0 
                  ? (tradePressure.buyVolume / (tradePressure.buyVolume + tradePressure.sellVolume) * 100) 
                  : 50}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
});
