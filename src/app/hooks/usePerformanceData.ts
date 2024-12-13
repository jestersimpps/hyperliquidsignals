"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useWebSocketMids } from "./useWebSocketMids";

interface PerformanceData {
 coin: string;
 markPrice: string;
 prevDayPrice: string;
 priceChange: number;
 priceChangePercentage: number;
 previousPrice?: string;
 priceChangeVsPrevious: number;
}

export type SortField =
 | "coin"
 | "markPrice"
 | "priceChange"
 | "priceChangePercentage";
export type SortDirection = "asc" | "desc";

export function usePerformanceData() {
 const [data, setData] = useState<PerformanceData[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [sortConfig, setSortConfig] = useState<{
  field: SortField;
  direction: SortDirection;
 }>({ field: "priceChangePercentage", direction: "desc" });

 const sortedData = useMemo(() => {
  const sortedArray = [...data];
  sortedArray.sort((a, b) => {
   if (sortConfig.field === "coin") {
    return sortConfig.direction === "asc"
     ? a.coin.localeCompare(b.coin)
     : b.coin.localeCompare(a.coin);
   }
   if (sortConfig.field === "markPrice") {
    return sortConfig.direction === "asc"
     ? parseFloat(a.markPrice) - parseFloat(b.markPrice)
     : parseFloat(b.markPrice) - parseFloat(a.markPrice);
   }
   return sortConfig.direction === "asc"
    ? a[sortConfig.field] - b[sortConfig.field]
    : b[sortConfig.field] - a[sortConfig.field];
  });
  return sortedArray;
 }, [data, sortConfig]);

 const requestSort = (field: SortField) => {
  setSortConfig((current) => ({
   field,
   direction:
    current.field === field && current.direction === "asc" ? "desc" : "asc",
  }));
 };

 const handleWebSocketMessage = useCallback((message: any) => {
  console.log("Processing WebSocket message:", message);
  if (message.channel === "allMids") {
   console.log("Updating data with new prices:", message);
   setData((prevData) => {
    return prevData.map((item) => {
     const newPrice = message.data.mids[item.coin];
     if (newPrice) {
      const newMarkPrice = newPrice;
      const priceChange =
       parseFloat(newMarkPrice) - parseFloat(item.prevDayPrice);
      const priceChangePercentage =
       (priceChange / parseFloat(item.prevDayPrice)) * 100;
      const priceChangeVsPrevious = item.previousPrice
       ? parseFloat(newMarkPrice) - parseFloat(item.previousPrice)
       : 0;

      return {
       ...item,
       previousPrice: item.markPrice,
       markPrice: newMarkPrice,
       priceChange,
       priceChangePercentage,
       priceChangeVsPrevious,
      };
     }
     return item;
    });
   });
  }
 }, []);

 useWebSocketMids(handleWebSocketMessage);

 useEffect(() => {
  async function fetchData() {
   try {
    const response = await fetch("/api/performance");
    if (!response.ok) throw new Error("Failed to fetch performance data");
    const performanceData = await response.json();
    setData(performanceData);
   } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred");
   } finally {
    setIsLoading(false);
   }
  }

  fetchData();
 }, []);

 return { data: sortedData, isLoading, error, sortConfig, requestSort };
}
