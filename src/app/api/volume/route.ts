import { NextRequest, NextResponse } from 'next/server';
import { HyperliquidInfoAPI } from '@/hyperliquid-api/info';
import type { AssetContext } from '@/types/hyperliquid';

export async function GET(request: NextRequest) {
  try {
    const api = new HyperliquidInfoAPI();
    const assetCtx = await api.getAssetCtx() as AssetContext[];

    const volumeData = assetCtx.map((ctx, index) => ({
      coin: index.toString(),
      volume: ctx.dayNtlVlm,
    }));

    return NextResponse.json(volumeData);
  } catch (error) {
    console.error('Error fetching volume data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volume data' },
      { status: 500 }
    );
  }
}
