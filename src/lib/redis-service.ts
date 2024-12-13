import { Redis } from 'ioredis';
import { getCachedData, setCachedData } from './redis';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export class RedisService {
  private static readonly CANDLE_EXPIRY = 300; // 5 minutes

  static async getCandleData(coin: string, interval: string): Promise<CandleData[] | null> {
    const cacheKey = `candles:${coin}:${interval}`;
    return await getCachedData<CandleData[]>(cacheKey);
  }

  static async setCandleData(coin: string, interval: string, data: CandleData[]): Promise<void> {
    const cacheKey = `candles:${coin}:${interval}`;
    await setCachedData(cacheKey, data, this.CANDLE_EXPIRY);
  }

  static transformCandleData(rawData: any[]): CandleData[] {
    return rawData.map(candle => ({
      time: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4])
    }));
  }
}
