import { NextRequest, NextResponse } from 'next/server';
import { HyperliquidInfoAPI } from '@/hyperliquid/info';
import { getCachedData, setCachedData } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coin = searchParams.get('coin');
    const interval = searchParams.get('interval') || '5m';

    if (!coin) {
      return NextResponse.json(
        { error: 'Coin parameter is required' },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = `candles:${coin}:${interval}`;
    
    // Try to get data from cache
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // If not in cache, fetch from API
    const api = new HyperliquidInfoAPI();
    const candleData = await api.getCandles(coin, interval);

    // Cache the data (5 minutes expiry)
    await setCachedData(cacheKey, candleData, 300);

    return NextResponse.json(candleData);
  } catch (error) {
    console.error('Error fetching candle data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candle data' },
      { status: 500 }
    );
  }
}
