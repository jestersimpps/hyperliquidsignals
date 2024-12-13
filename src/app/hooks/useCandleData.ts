"use client";

import { useState, useEffect } from "react";

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function useCandleData(coin: string, interval: string = "5m") {
  const [data, setData] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/candles?coin=${coin}&interval=${interval}`
        );
        if (!response.ok) throw new Error("Failed to fetch candle data");
        const candleData = await response.json();
        setData(candleData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    // Initial fetch
    setIsLoading(true);
    fetchData();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(fetchData, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [coin, interval]);

  return { data, isLoading, error, setData };
}
