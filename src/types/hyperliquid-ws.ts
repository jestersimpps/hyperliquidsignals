export interface WsSubscriptionMessage {
  method: "subscribe" | "unsubscribe";
  subscription: WsSubscriptionType;
}

export type WsSubscriptionType = 
  | { type: "allMids" }
  | { type: "candle"; coin: string; interval: string }
  | { type: "l2Book"; coin: string; nSigFigs?: number; mantissa?: number }
  | { type: "trades"; coin: string }
  | { type: "notification"; user: string }
  | { type: "webData2"; user: string }
  | { type: "orderUpdates"; user: string }
  | { type: "userEvents"; user: string }
  | { type: "userFills"; user: string; aggregateByTime?: boolean }
  | { type: "userFundings"; user: string }
  | { type: "userNonFundingLedgerUpdates"; user: string };

export interface WsResponse<T> {
  channel: string;
  data: T;
}

export interface WsAllMidsData {
  mids: Record<string, string>;
}

export interface WsCandleData {
  t: number;    // open millis
  T: number;    // close millis
  s: string;    // coin
  i: string;    // interval
  o: string;    // open price
  c: string;    // close price
  h: string;    // high price
  l: string;    // low price
  v: string;    // volume (base unit)
  n: number;    // number of trades
}
