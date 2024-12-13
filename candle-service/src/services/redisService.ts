import { Redis } from 'ioredis';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export class RedisService {
  private redis: Redis;
  private static readonly CANDLE_EXPIRY = 300; // 5 minutes

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async getCandleData(
    coin: string,
    interval: string
  ): Promise<CandleData[] | null> {
    const cacheKey = `candles:${coin}:${interval}`;
    const data = await this.redis.get(cacheKey);
    return data ? JSON.parse(data) : null;
  }

  async setCandleData(
    coin: string,
    interval: string,
    data: CandleData[]
  ): Promise<void> {
    const cacheKey = `candles:${coin}:${interval}`;
    await this.redis.setex(cacheKey, RedisService.CANDLE_EXPIRY, JSON.stringify(data));
  }

  transformCandleData(rawData: any[]): CandleData[] {
    return rawData.map((candle) => ({
      time: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
    }));
  }
}
