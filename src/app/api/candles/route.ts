import { NextRequest, NextResponse } from "next/server";
import { HyperliquidInfoAPI } from "@/hyperliquid/info";
import { RedisService } from "@/lib/redis-service";

export async function GET(request: NextRequest) {
 try {
  const { searchParams } = new URL(request.url);
  const coin = searchParams.get("coin");
  const interval = searchParams.get("interval") || "5m";

  if (!coin) {
   return NextResponse.json(
    { error: "Coin parameter is required" },
    { status: 400 }
   );
  }

  // Try to get data from cache
  const cachedData = await RedisService.getCandleData(coin, interval);
  if (cachedData) {
   return NextResponse.json(cachedData);
  }

  // If not in cache, fetch from API
  const api = new HyperliquidInfoAPI();
  const endTime = Date.now();
  const startTime = endTime - 24 * 60 * 60 * 1000; // 24 hours ago
  const rawCandleData = await api.getCandles(
   coin,
   interval,
   startTime,
   endTime
  );

  // Transform and structure the data
  const transformedData = RedisService.transformCandleData(rawCandleData);

  // Cache the transformed data
  await RedisService.setCandleData(coin, interval, transformedData);

  return NextResponse.json(transformedData);
 } catch (error) {
  console.error("Error fetching candle data:", error);
  return NextResponse.json(
   { error: "Failed to fetch candle data" },
   { status: 500 }
  );
 }
}
