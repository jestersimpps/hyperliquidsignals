export interface Trade {
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  entryTime: number;
  pattern: string;
  confidence: number;
  exitPrice?: number;
  exitTime?: number;
  profit?: number;
}

export interface Position extends Trade {
  currentPrice?: number;
}
