export interface Quote {
  symbol: string;
  last: number; // last traded price
  change: number; // absolute change since prev close
  changePercent: number; // % change
  volume: number;
  timestamp: string; // ISO timestamp of last update
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  quote: Quote;
}
