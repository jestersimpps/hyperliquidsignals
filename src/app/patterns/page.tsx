
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { findTrendlines } from '../services/trendlineService';
import Card from "../components/Card";
import CandlestickChart from "../components/CandlestickChart";

interface VolumeData {
  coin: string;
  volume: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Trendline {
  type: 'support' | 'resistance';
  intersectionPrice?: number;
  isIntersecting?: boolean;
  strength: number;
}

interface PatternEvent {
  coin: string;
  timestamp: number;
  type: 'support' | 'resistance';
  price: number;
  message: string;
  pressure?: 'buy' | 'sell' | 'neutral';
}

const MAX_PATTERN_HISTORY = 100; // Limit pattern history size
const POLL_INTERVAL = 30000; // 30 seconds

export default function PatternsPage() {
  const [patternHistory, setPatternHistory] = useState<PatternEvent[]>([]);
  const [topPairs, setTopPairs] = useState<VolumeData[]>([]);
  const [trendlineMap, setTrendlineMap] = useState<Record<string, Trendline[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candleData, setCandleData] = useState<Record<string, CandleData[]>>({});
  const [tradePressures, setTradePressures] = useState<Record<string, TradePressure>>({});

  // Memoize the trendline message generator
  const getTrendlineMessage = useCallback((line: Trendline, currentPrice?: number, pressure?: 'buy' | 'sell' | 'neutral') => {
    if (!line.intersectionPrice || !currentPrice) return '';

    const pressureText = pressure ? ` (${pressure} pressure detected)` : '';

    if (line.type === 'support') {
      return currentPrice < line.intersectionPrice
        ? `Support broken - watch for further downside movement and potential retest from below${pressureText}`
        : `Potential bounce zone - watch for buying pressure${pressureText}`;
    } else {
      return currentPrice > line.intersectionPrice
        ? `Resistance broken - watch for continued upside movement and potential retest from above${pressureText}`
        : `Potential reversal zone - watch for selling pressure${pressureText}`;
    }
  }, []);

  // Memoize the trendline calculation
  const calculateTrendlines = useCallback((coin: string, data: CandleData[]) => {
    if (!data?.length) return;
    
    const trendlines = findTrendlines(data);
    
    setTrendlineMap(prev => {
      // Only update if trendlines have actually changed
      if (JSON.stringify(prev[coin]) === JSON.stringify(trendlines)) {
        return prev;
      }

      // Find new intersecting trendlines
      const prevTrendlines = prev[coin] || [];
      const newIntersectingTrendlines = trendlines.filter(line => 
        line.isIntersecting && 
        line.intersectionPrice &&
        !prevTrendlines.some(prevLine => 
          prevLine.isIntersecting &&
          prevLine.type === line.type &&
          prevLine.intersectionPrice === line.intersectionPrice
        )
      );

      // Add new pattern events
      const newEvents = newIntersectingTrendlines.map(line => ({
        coin,
        timestamp: Date.now(),
        type: line.type,
        price: line.intersectionPrice!,
        message: getTrendlineMessage(line, line.intersectionPrice)
      }));

      if (newEvents.length > 0) {
        setPatternHistory(prev => {
          // filter for duplicates
          const combined = [...newEvents, ...prev].filter((event, index, self) =>
            index === self.findIndex(e => e.coin === event.coin && e.type === event.type && e.price === event.price)
          );
          return combined.slice(0, MAX_PATTERN_HISTORY); // Limit the history size
        });
      }

      return {
        ...prev,
        [coin]: trendlines
      };
    });
  }, [getTrendlineMessage]);

  // Fetch candle data for each coin
  useEffect(() => {
    const fetchCandleData = async () => {
      const newCandleData: Record<string, CandleData[]> = {};
      setError(null);
      
      for (const pair of topPairs) {
        try {
          const response = await fetch(`/api/candles?coin=${pair.coin}&interval=5m`);
          if (!response.ok) throw new Error(`Failed to fetch candle data for ${pair.coin}`);
          const data = await response.json();
          newCandleData[pair.coin] = data;
          
          if (data.length) {
            calculateTrendlines(pair.coin, data);
          }
        } catch (error) {
          console.error(`Error fetching candle data for ${pair.coin}:`, error);
          setError(`Failed to fetch data for ${pair.coin}`);
        }
      }
      
      setCandleData(newCandleData);
    };

    if (topPairs.length) {
      fetchCandleData();
      const pollInterval = setInterval(fetchCandleData, POLL_INTERVAL);
      return () => clearInterval(pollInterval);
    }
  }, [topPairs, calculateTrendlines]);

  // Fetch initial volume data
  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const volumeResponse = await fetch('/api/volume');
        if (!volumeResponse.ok) throw new Error('Failed to fetch volume data');
        
        const volumeData = await volumeResponse.json();
        
        const sortedPairs = volumeData
          .sort((a: VolumeData, b: VolumeData) => 
            parseFloat(b.volume) - parseFloat(a.volume))
          .slice(0, 10);
        
        setTopPairs(sortedPairs);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch volume data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4">
      <div className="mb-4">
        <Card
          title="Recent Pattern Signals"
          description="Historical pattern signals across all pairs"
        >
          <div className="max-h-[200px] overflow-y-auto">
            <div className="space-y-2">
              {patternHistory.map((event, index) => (
                <div key={`${event.coin}-${event.timestamp}-${index}`} className="flex items-center gap-2 text-sm">
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
                    {event.pressure && (
                      <>
                        <span className={`ml-2 ${
                          event.pressure === 'buy' 
                            ? 'text-green-500' 
                            : event.pressure === 'sell' 
                              ? 'text-red-500' 
                              : 'text-gray-500'
                        }`}>
                          ({event.pressure} pressure)
                        </span>
                        <div className="inline-flex items-center ml-2 bg-gray-200 dark:bg-gray-800 rounded h-2 w-20">
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
                      </>
                    )}
                  </span>
                </div>
              ))}
              {patternHistory.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No pattern signals detected yet
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {topPairs.map((pair) => (
          <Card 
            key={pair.coin}
            title={`${pair.coin.toUpperCase()} Analysis`}
            description={`24h Volume: ${Number(pair.volume).toLocaleString()} USDC`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-4">
                <CandlestickChart
                  coin={pair.coin}
                  isLoading={isLoading}
                  data={candleData[pair.coin] || []}
                  trendlines={trendlineMap[pair.coin] || []}
                />
                <div className="space-y-2 text-sm">
                  {trendlineMap[pair.coin]?.map((line, index) => line.isIntersecting && (
                    <div key={`${pair.coin}-${index}`} className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          line.type === 'support' 
                            ? 'bg-[rgb(22,199,132)]'
                            : 'bg-[rgb(255,99,132)]'
                        }`} 
                      />
                      <p>
                        <span className="font-medium">
                          {line.type === 'support' ? 'Support' : 'Resistance'} 
                          {line.intersectionPrice && ` at ${line.intersectionPrice.toFixed(2)}`}:
                        </span>
                        {' '}
                        {getTrendlineMessage(line, line.intersectionPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
