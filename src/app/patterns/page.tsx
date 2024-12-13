'use client';

import { useState, useEffect } from 'react';
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

export default function PatternsPage() {
  const [topPairs, setTopPairs] = useState<VolumeData[]>([]);
  const [candleData, setCandleData] = useState<Record<string, CandleData[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch top pairs by volume
        const volumeResponse = await fetch('/api/volume');
        const volumeData = await volumeResponse.json();
        const sortedPairs = volumeData
          .sort((a: VolumeData, b: VolumeData) => 
            parseFloat(b.volume) - parseFloat(a.volume))
          .slice(0, 10);
        setTopPairs(sortedPairs);

        // Fetch candle data for each pair
        const candlePromises = sortedPairs.map(async (pair) => {
          const response = await fetch(`/api/candles?coin=${pair.coin}&interval=5m`);
          const data = await response.json();
          return { coin: pair.coin, data };
        });

        const candleResults = await Promise.all(candlePromises);
        const candleMap: Record<string, CandleData[]> = {};
        candleResults.forEach(result => {
          candleMap[result.coin] = result.data;
        });
        setCandleData(candleMap);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 h-full">
        {topPairs.map((pair) => (
          <div key={pair.coin} className="border border-black/[.1] dark:border-white/[.1] rounded-lg p-4">
            <CandlestickChart
              coin={pair.coin}
              data={candleData[pair.coin] || []}
              isLoading={isLoading}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
