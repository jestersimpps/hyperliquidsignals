"use client";

import { useState, useEffect, useCallback } from "react";
import { WsCandle } from "../../types/websocket";
import { useWebSocketCandles } from "./useWebSocketCandles";

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

 const handleWebSocketMessage = useCallback(
  (message: any) => {
   if (message.channel === "candle" && message.data) {
    const wsCandle = message.data as WsCandle;
    if (wsCandle.s === coin && wsCandle.i === interval) {
     const newCandle: CandleData = {
      time: wsCandle.t,
      open: parseFloat(wsCandle.o),
      high: parseFloat(wsCandle.h),
      low: parseFloat(wsCandle.l),
      close: parseFloat(wsCandle.c),
     };

     setData((prevData) => {
      const existingIndex = prevData.findIndex(
       (candle) => candle.time === newCandle.time
      );
      if (existingIndex !== -1) {
       // Update existing candle
       const updatedData = [...prevData];
       updatedData[existingIndex] = newCandle;
       return updatedData;
      } else {
       // Add new candle
       return [...prevData, newCandle].sort((a, b) => a.time - b.time);
      }
     });
    }
   }
  },
  [coin, interval]
 );

 useWebSocketCandles(handleWebSocketMessage, {
  coin: coin,
  interval: interval,
 });

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

  setIsLoading(true);
  fetchData();
 }, [coin, interval]);

 return { data, isLoading, error };
}
