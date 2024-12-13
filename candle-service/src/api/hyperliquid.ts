import axios from 'axios';

export class HyperliquidAPI {
  private baseUrl = 'https://api.hyperliquid.xyz/info';

  private async post(endpoint: string, data: any): Promise<any> {
    try {
      const response = await axios.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Error in API call:', error);
      throw error;
    }
  }

  async getCandles(coin: string, interval: string, startTime?: number, endTime?: number): Promise<any[]> {
    return this.post(this.baseUrl, {
      type: 'candleSnapshot',
      coin,
      interval,
      startTime,
      endTime
    });
  }
}
