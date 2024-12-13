import axios from 'axios';

export class HyperliquidAPI {
  private baseUrl = 'https://api.hyperliquid.xyz';

  async getCandles(coin: string, interval: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/info/candles`, {
        params: {
          coin,
          interval
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching candles:', error);
      throw error;
    }
  }
}
