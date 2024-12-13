import { HyperliquidInfoAPI } from '../hyperliquid-api/info.js';
import { RedisService } from '../lib/redis-service.js';
import WebSocket from 'ws';

const SUPPORTED_INTERVALS = ['5m'];
const SUPPORTED_COINS = ['BTC', 'ETH']; // Add more coins as needed
const RECONNECT_DELAY = 5000;
let wsInstance: WebSocket | null = null;

function setupWebSocket(api: HyperliquidInfoAPI): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(process.env.WEBSOCKET_URL || 'wss://api.hyperliquid.xyz/ws');
      wsInstance = ws;

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
        resolve(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      });

      ws.on('close', () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        wsInstance = null;
        setTimeout(() => {
          startCandleService().catch(console.error);
        }, RECONNECT_DELAY);
      });

    } catch (error) {
      reject(error);
    }
  });
}

async function startCandleService() {
  try {
  const api = new HyperliquidInfoAPI();
  
    // If there's an existing connection, close it
    if (wsInstance) {
      wsInstance.close();
      wsInstance = null;
    }

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

    // Set up WebSocket connection
    const ws = await setupWebSocket(api);

    // Handle incoming messages
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

  } catch (error) {
    console.error('Error in candle service:', error);
    // Attempt to reconnect after delay
    setTimeout(() => {
      startCandleService().catch(console.error);
    }, RECONNECT_DELAY);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down candle service...');
  if (wsInstance) {
    wsInstance.close();
  }
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Start the service
startCandleService().catch((error) => {
  console.error('Failed to start candle service:', error);
  process.exit(1);
});
