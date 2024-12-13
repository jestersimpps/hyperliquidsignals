'use client';

import { useState, useEffect, useMemo } from 'react';

interface PerformanceData {
  coin: string;
  markPrice: string;
  prevDayPrice: string;
  priceChange: number;
  priceChangePercentage: number;
}

export type SortField = 'coin' | 'markPrice' | 'priceChange' | 'priceChangePercentage';
export type SortDirection = 'asc' | 'desc';

export function usePerformanceData() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: 'coin', direction: 'asc' });

  const sortedData = useMemo(() => {
    const sortedArray = [...data];
    sortedArray.sort((a, b) => {
      if (sortConfig.field === 'coin') {
        return sortConfig.direction === 'asc' 
          ? a.coin.localeCompare(b.coin)
          : b.coin.localeCompare(a.coin);
      }
      if (sortConfig.field === 'markPrice') {
        return sortConfig.direction === 'asc'
          ? parseFloat(a.markPrice) - parseFloat(b.markPrice)
          : parseFloat(b.markPrice) - parseFloat(a.markPrice);
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.field] - b[sortConfig.field]
        : b[sortConfig.field] - a[sortConfig.field];
    });
    return sortedArray;
  }, [data, sortConfig]);

  const requestSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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

  return { data: sortedData, isLoading, error, sortConfig, requestSort };
}
