import { NextRequest, NextResponse } from 'next/server';
import { HyperliquidInfoAPI } from '@/hyperliquid/info';
import { RedisService } from '@/lib/redis-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coin = searchParams.get('coin') || undefined;

    // Try to get data from cache
    const cachedData = await RedisService.getVolumeData(coin);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // If not in cache, fetch from API
    const api = new HyperliquidInfoAPI();
    const rawVolumeData = await api.getVolume(coin);
    
    // Transform and structure the data
    const transformedData = RedisService.transformVolumeData(rawVolumeData);
    
    // Cache the transformed data
    await RedisService.setVolumeData(transformedData, coin);

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching volume data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volume data' },
      { status: 500 }
    );
  }
}
