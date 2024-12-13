'use client';

import { useState, useEffect } from 'react';

interface PerformanceData {
  coin: string;
  markPrice: string;
  prevDayPrice: string;
  priceChange: number;
  priceChangePercentage: number;
}

export function usePerformanceData() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/performance');
        if (!response.ok) throw new Error('Failed to fetch performance data');
        const performanceData = await response.json();
        setData(performanceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, isLoading, error };
}
