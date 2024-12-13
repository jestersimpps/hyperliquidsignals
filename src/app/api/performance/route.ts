import { NextRequest, NextResponse } from "next/server";
import { HyperliquidInfoAPI } from "@/hyperliquid/info";
import { RedisService } from "@/lib/redis-service";

export async function GET(_request: NextRequest) {
 try {
  // Try to get data from cache
  const cachedData = await RedisService.getPerformanceData();
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  // If not in cache, fetch from API
  const api = new HyperliquidInfoAPI();
  const [meta, assetCtxs] = await api.getMetaAndAssetCtxs();
  
  // Transform and structure the data
  const transformedData = RedisService.transformPerformanceData(meta.universe, assetCtxs);
  
  // Cache the transformed data
  await RedisService.setPerformanceData(transformedData);

  return NextResponse.json(transformedData);
 } catch (error) {
  console.error("Error fetching performance data:", error);
  return NextResponse.json(
   { error: "Failed to fetch performance data" },
   { status: 500 }
  );
 }
}
