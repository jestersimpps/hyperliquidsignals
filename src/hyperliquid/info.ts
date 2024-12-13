import { WsCandle } from '@/types/websocket';
import { 
  MetaResponse, 
  AccountState, 
  AssetContext,
  SpotMetaResponse,
  SpotAssetContext,
  SpotAccountState,
  Position,
} from '../types/hyperliquid';
import { BaseAPI } from './base';

import { API_CONFIG } from '@/app/api/config';

const API_URL = API_CONFIG.BASE_URL;

export class HyperliquidInfoAPI extends BaseAPI {
  async getMeta(): Promise<MetaResponse> {
    return this.post(API_URL, { type: 'meta' });
  }

  async getMetaAndAssetCtxs(): Promise<[MetaResponse, AssetContext[]]> {
    return this.post(API_URL, { type: 'metaAndAssetCtxs' });
  }

  async getAccountState(userAddress: string): Promise<AccountState> {
    return this.post(API_URL, {
      type: 'clearinghouseState',
      user: userAddress.toLowerCase(),
    });
  }

  async getAccountValue(userAddress: string): Promise<string> {
    const state = await this.getAccountState(userAddress);
    return state.marginSummary.accountValue;
  }

  async getOpenPositions(userAddress: string): Promise<Position[]> {
    const state = await this.getAccountState(userAddress);
    return state.assetPositions.map(ap => ap.position);
  }

  async getFundingHistory(userAddress: string, startTime: number, endTime?: number) {
    return this.post(API_URL, {
      type: 'userFunding',
      user: userAddress,
      startTime,
      endTime,
    });
  }

  async getHistoricalFunding(coin: string, startTime: number, endTime?: number) {
    return this.post(API_URL, {
      type: 'fundingHistory',
      coin,
      startTime,
      endTime,
    });
  }

  async getCandles(coin: string, interval: string, startTime?: number, endTime?: number): Promise<WsCandle[]> {
    return this.post(API_URL, {
      type: 'candleSnapshot',
      req: {
        coin,
        interval,
        startTime,
        endTime
      }
    });
  }

  async getVolume(coin?: string): Promise<{ coin: string, volume: string }[]> {
    const [meta, assetCtxs] = await this.getMetaAndAssetCtxs();
    return meta.universe.map((asset, index) => ({
      coin: asset.name,
      volume: assetCtxs[index].dayNtlVlm
    })).filter(v => !coin || v.coin === coin);
  }

  // Spot Market Methods
  async getSpotMeta(): Promise<SpotMetaResponse> {
    return this.post(API_URL, {
      type: 'spotMeta'
    });
  }

  async getSpotMetaAndAssetCtxs(): Promise<[SpotMetaResponse, SpotAssetContext[]]> {
    return this.post(API_URL, {
      type: 'spotMetaAndAssetCtxs'
    });
  }

  async getSpotAccountState(userAddress: string): Promise<SpotAccountState> {
    return this.post(API_URL, {
      type: 'spotClearinghouseState',
      user: userAddress.toLowerCase()
    });
  }
}
