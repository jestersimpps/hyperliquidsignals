import WebSocket from 'ws';
import { RedisService } from './redisService.js';
import { HyperliquidAPI } from '../api/hyperliquid.js';

export class CandleService {
  private static readonly SUPPORTED_INTERVALS = ['5m'];
  private static readonly SUPPORTED_COINS = ['BTC', 'ETH'];
  private static readonly RECONNECT_DELAY = 5000;
  private wsInstance: WebSocket | null = null;
  private api: HyperliquidAPI;
  private redisService: RedisService;

  constructor() {
    this.api = new HyperliquidAPI();
    this.redisService = new RedisService();
  }

  private setupWebSocket(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
        this.wsInstance = ws;

        ws.on('open', () => {
          console.log('WebSocket connected');
          for (const coin of CandleService.SUPPORTED_COINS) {
            ws.send(JSON.stringify({
              method: "subscribe",
              subscription: {
                type: "candles",
                coin: coin,
                interval: "5m"
              },
            }));
          }
          resolve(ws);
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });

        ws.on('close', () => {
          console.log('WebSocket disconnected, attempting to reconnect...');
          this.wsInstance = null;
          setTimeout(() => {
            this.start().catch(console.error);
          }, CandleService.RECONNECT_DELAY);
        });

        ws.on('message', async (data) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.type === 'candle') {
              await this.handleCandleUpdate(message);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  private async handleCandleUpdate(message: any) {
    const { coin, interval, data: candleData } = message;
    const existingData = await this.redisService.getCandleData(coin, interval) || [];
    const updatedData = [...existingData, this.redisService.transformCandleData([candleData])[0]]
      .slice(-100);
    await this.redisService.setCandleData(coin, interval, updatedData);
    console.log(`Updated candle data for ${coin} ${interval}`);
  }

  async start() {
    try {
      if (this.wsInstance) {
        this.wsInstance.close();
        this.wsInstance = null;
      }

      // Initial data fetch and cache
      for (const coin of CandleService.SUPPORTED_COINS) {
        for (const interval of CandleService.SUPPORTED_INTERVALS) {
          try {
            const rawCandleData = await this.api.getCandles(coin, interval);
            const transformedData = this.redisService.transformCandleData(rawCandleData);
            await this.redisService.setCandleData(coin, interval, transformedData);
            console.log(`Initial candle data cached for ${coin} ${interval}`);
          } catch (error) {
            console.error(`Error fetching initial candle data for ${coin} ${interval}:`, error);
          }
        }
      }

      // Set up WebSocket connection
      await this.setupWebSocket();

    } catch (error) {
      console.error('Error in candle service:', error);
      setTimeout(() => {
        this.start().catch(console.error);
      }, CandleService.RECONNECT_DELAY);
    }
  }
}
