import { NextRequest, NextResponse } from 'next/server';
import type { SpotMetaResponse, SpotAssetContext } from '@/types/hyperliquid';
import { HyperliquidInfoAPI } from '@/hyperliquid-api/info';

export async function GET(request: NextRequest) {
  try {
    const api = new HyperliquidInfoAPI();
    const [meta, assetCtxs] = await api.getSpotMetaAndAssetCtxs();

    const performanceData = meta.tokens
      .filter(token => token.isCanonical)
      .map((token, index) => {
        const ctx = assetCtxs[index];
        if (!ctx) return null;

        const markPrice = parseFloat(ctx.markPx);
        const prevDayPrice = parseFloat(ctx.prevDayPx);
        const priceChange = markPrice - prevDayPrice;
        const priceChangePercentage = (priceChange / prevDayPrice) * 100;

        return {
          coin: token.name,
          markPrice: ctx.markPx,
          prevDayPrice: ctx.prevDayPx,
          priceChange,
          priceChangePercentage,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}
