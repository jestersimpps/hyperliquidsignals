import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getCachedData<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCachedData(key: string, data: any, expirySeconds: number = 300): Promise<void> {
  await redis.setex(key, expirySeconds, JSON.stringify(data));
}

export default redis;
