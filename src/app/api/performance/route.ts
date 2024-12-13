import { NextRequest, NextResponse } from 'next/server';
import type { AssetContext, MetaResponse } from '@/types/hyperliquid';
import { HyperliquidInfoAPI } from '@/hyperliquid/info';

export async function GET(request: NextRequest) {
  try {
    const api = new HyperliquidInfoAPI();
    const meta = await api.getMeta() as MetaResponse;
    const assetCtx = await api.getAssetCtx() as AssetContext[];

    const performanceData = meta.universe.map((asset) => {
      const ctx = assetCtx.find((ctx, index) => index === asset.name);
      if (!ctx) return null;

      const markPrice = parseFloat(ctx.markPx);
      const prevDayPrice = parseFloat(ctx.prevDayPx);
      const priceChange = markPrice - prevDayPrice;
      const priceChangePercentage = (priceChange / prevDayPrice) * 100;

      return {
        coin: asset.name,
        markPrice: ctx.markPx,
        prevDayPrice: ctx.prevDayPx,
        priceChange,
        priceChangePercentage,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}
