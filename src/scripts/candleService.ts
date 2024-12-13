import { HyperliquidInfoAPI } from '../hyperliquid-api/info.js';
import { RedisService } from '../lib/redis-service.js';
import WebSocket from 'ws';

const SUPPORTED_INTERVALS = ['5m'];
const SUPPORTED_COINS = ['BTC', 'ETH']; // Add more coins as needed

async function startCandleService() {
  const api = new HyperliquidInfoAPI();
  
  // Initial data fetch and cache
  for (const coin of SUPPORTED_COINS) {
    for (const interval of SUPPORTED_INTERVALS) {
      try {
        const rawCandleData = await api.getCandles(coin, interval);
        const transformedData = RedisService.transformCandleData(rawCandleData);
        await RedisService.setCandleData(coin, interval, transformedData);
        console.log(`Initial candle data cached for ${coin} ${interval}`);
      } catch (error) {
        console.error(`Error fetching initial candle data for ${coin} ${interval}:`, error);
      }
    }
  }

  // Subscribe to real-time updates
  const ws = new WebSocket(process.env.WEBSOCKET_URL || 'wss://api.hyperliquid.xyz/ws');

  ws.on('open', () => {
    console.log('WebSocket connected');
    // Subscribe to candle updates for all supported coins
    for (const coin of SUPPORTED_COINS) {
      ws.send(JSON.stringify({
        method: "subscribe",
        subscription: {
          type: "candles",
          coin: coin,
          interval: "5m"
        },
      }));
    }
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'candle') {
        const { coin, interval, data: candleData } = message;
        
        // Get existing cached data
        const existingData = await RedisService.getCandleData(coin, interval) || [];
        
        // Update with new candle
        const updatedData = [...existingData, RedisService.transformCandleData([candleData])[0]]
          .slice(-100); // Keep last 100 candles
        
        // Update cache
        await RedisService.setCandleData(coin, interval, updatedData);
        console.log(`Updated candle data for ${coin} ${interval}`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected, attempting to reconnect...');
    setTimeout(startCandleService, 5000);
  });
}

startCandleService().catch(console.error);
