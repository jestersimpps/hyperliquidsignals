import { NextRequest, NextResponse } from 'next/server';
import { HyperliquidInfoAPI } from '@/hyperliquid-api/info';
import type { SpotMetaResponse, SpotAssetContext } from '@/types/hyperliquid';

export async function GET(request: NextRequest) {
  try {
    const api = new HyperliquidInfoAPI();
    const [meta, assetCtxs] = await api.getSpotMetaAndAssetCtxs();

    const volumeData = meta.tokens
      .filter(token => token.isCanonical)
      .map((token, index) => ({
        coin: token.name,
        volume: assetCtxs[index]?.dayNtlVlm || '0',
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
