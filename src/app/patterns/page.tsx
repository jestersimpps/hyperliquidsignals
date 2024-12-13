'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function PatternsPage() {
  const [topPairs, setTopPairs] = useState<VolumeData[]>([]);
  const [trendlineMap, setTrendlineMap] = useState<Record<string, Trendline[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const volumeResponse = await fetch('/api/volume');
        const volumeData = await volumeResponse.json();
        
        const sortedPairs = volumeData
          .sort((a: VolumeData, b: VolumeData) => 
            parseFloat(b.volume) - parseFloat(a.volume))
          .slice(0, 10);
        
        setTopPairs(sortedPairs);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Memoize the trendline update handler
  const handleTrendlinesUpdate = useCallback((coin: string, trendlines: Trendline[]) => {
    setTrendlineMap(prev => {
      // Only update if trendlines have actually changed
      if (JSON.stringify(prev[coin]) === JSON.stringify(trendlines)) {
        return prev;
      }
      return {
        ...prev,
        [coin]: trendlines
      };
    });
  }, []);

  const getTrendlineMessage = (line: Trendline, currentPrice?: number) => {
    if (!line.intersectionPrice || !currentPrice) return '';

    if (line.type === 'support') {
      return currentPrice < line.intersectionPrice
        ? 'Support broken - watch for further downside movement and potential retest from below'
        : 'Potential bounce zone - watch for buying pressure';
    } else {
      return currentPrice > line.intersectionPrice
        ? 'Resistance broken - watch for continued upside movement and potential retest from above'
        : 'Potential reversal zone - watch for selling pressure';
    }
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 h-full">
        {topPairs.map((pair) => (
          <Card key={pair.coin}>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{pair.coin.toUpperCase()} Analysis</h2>
              <p className="text-sm text-muted-foreground">
                24h Volume: {Number(pair.volume).toLocaleString()} USDC
              </p>
              <div className="flex flex-col gap-4">
                <CandlestickChart
                  coin={pair.coin}
                  isLoading={isLoading}
                  onTrendlinesUpdate={(trendlines) => handleTrendlinesUpdate(pair.coin, trendlines)}
                />
                <div className="space-y-2 text-sm">
                  {trendlineMap[pair.coin]?.map((line, index) => line.isIntersecting && (
                    <div key={index} className="flex items-center gap-2">
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
