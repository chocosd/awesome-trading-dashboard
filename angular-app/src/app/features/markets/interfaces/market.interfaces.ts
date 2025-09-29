import { Trades } from '../enums/trades.enum';

export interface MarketSymbol {
  symbol: string; // e.g. "AAPL"
  name: string; // e.g. "Apple Inc."
  exchange: string; // e.g. "NASDAQ"
  currency: string; // e.g. "USD" - will change to a currency enum shortly
}

export interface Quote {
  symbol: string;
  last: number;
  change: number; // absolute change
  changePercent: number; // -0.42 -> -0.42%
  volume: number;
  timestamp: string; // ISO
}

// Map enum keys to their underlying value types
export type Candle = {
  [K in Trades]: K extends Trades.Time ? string : number;
};

export interface WatchlistItem extends MarketSymbol {
  quote: Quote;
}

export type Side = 'BUY' | 'SELL';

export interface PastTrade {
  id: string;
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  timestamp: string; // ISO
  pnl?: number; // optional realized P&L for closed trades
}
