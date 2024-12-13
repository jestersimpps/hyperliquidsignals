import { WsCandle } from "@/types/websocket";
import { getCachedData, setCachedData } from "./redis";

interface CandleData {
 time: number;
 open: number;
 high: number;
 low: number;
 close: number;
}

interface VolumeData {
 coin: string;
 volume: string;
}

interface PerformanceData {
 coin: string;
 markPrice: string;
 prevDayPrice: string;
 priceChange: number;
 priceChangePercentage: number;
}

export class RedisService {
 private static readonly CANDLE_EXPIRY = 300; // 5 minutes
 private static readonly VOLUME_EXPIRY = 60; // 1 minute
 private static readonly PERFORMANCE_EXPIRY = 30; // 30 seconds

 static async getCandleData(
  coin: string,
  interval: string
 ): Promise<CandleData[] | null> {
  const cacheKey = `candles:${coin}:${interval}`;
  return await getCachedData<CandleData[]>(cacheKey);
 }

 static async setCandleData(
  coin: string,
  interval: string,
  data: CandleData[]
 ): Promise<void> {
  const cacheKey = `candles:${coin}:${interval}`;
  await setCachedData(cacheKey, data, this.CANDLE_EXPIRY);
 }

 static transformCandleData(rawData: WsCandle[]): CandleData[] {
  return rawData.map((candle: WsCandle) => ({
   time: candle.t,
   open: parseFloat(candle.o),
   high: parseFloat(candle.h),
   low: parseFloat(candle.l),
   close: parseFloat(candle.c),
  }));
 }

 static async getVolumeData(coin?: string): Promise<VolumeData[] | null> {
  const cacheKey = coin ? `volume:${coin}` : 'volume:all';
  return await getCachedData<VolumeData[]>(cacheKey);
 }

 static async setVolumeData(data: VolumeData[], coin?: string): Promise<void> {
  const cacheKey = coin ? `volume:${coin}` : 'volume:all';
  await setCachedData(cacheKey, data, this.VOLUME_EXPIRY);
 }

 static transformVolumeData(rawData: any[]): VolumeData[] {
  return rawData.map((item) => ({
   coin: item.coin,
   volume: item.volume,
  }));
 }

 static async getPerformanceData(): Promise<PerformanceData[] | null> {
  const cacheKey = 'performance:all';
  return await getCachedData<PerformanceData[]>(cacheKey);
 }

 static async setPerformanceData(data: PerformanceData[]): Promise<void> {
  const cacheKey = 'performance:all';
  await setCachedData(cacheKey, data, this.PERFORMANCE_EXPIRY);
 }

 static transformPerformanceData(meta: any[], assetCtxs: any[]): PerformanceData[] {
  return meta
   .map((token: any, index: number) => {
    const ctx = assetCtxs[index];
    if (!ctx) return null;

    const markPrice = parseFloat(ctx.markPx);
    const prevDayPrice = parseFloat(ctx.prevDayPx);
    const priceChange = markPrice - prevDayPrice;
    const priceChangePercentage = (priceChange / prevDayPrice) * 100;

    return {
     coin: token.name,
     markPrice: ctx.markPx,
     prevDayPrice: ctx.prevDayPx,
     priceChange,
     priceChangePercentage,
    };
   })
   .filter((item): item is NonNullable<typeof item> => item !== null);
 }
}
