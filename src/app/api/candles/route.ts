import { NextRequest, NextResponse } from 'next/server';
import { HyperliquidInfoAPI } from '@/hyperliquid/info';

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

    const api = new HyperliquidInfoAPI();
    const candleData = await api.getCandles(coin, interval);

    return NextResponse.json(candleData);
  } catch (error) {
    console.error('Error fetching candle data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candle data' },
      { status: 500 }
    );
  }
}
