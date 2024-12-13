import { NextRequest, NextResponse } from 'next/server';
import { HyperliquidInfoAPI } from '@/hyperliquid-api/info';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coin = searchParams.get('coin') || undefined;

    const api = new HyperliquidInfoAPI();
    const volumeData = await api.getVolume(coin);

    return NextResponse.json(volumeData);
  } catch (error) {
    console.error('Error fetching volume data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volume data' },
      { status: 500 }
    );
  }
}
