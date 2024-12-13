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

export class RedisService {
 private static readonly CANDLE_EXPIRY = 300; // 5 minutes
 private static readonly VOLUME_EXPIRY = 60; // 1 minute

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

 static transformCandleData(rawData: any[]): CandleData[] {
  return rawData.map((candle) => ({
   time: candle[0],
   open: parseFloat(candle[1]),
   high: parseFloat(candle[2]),
   low: parseFloat(candle[3]),
   close: parseFloat(candle[4]),
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
}
