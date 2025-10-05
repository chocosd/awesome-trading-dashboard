export interface Position {
  symbol: string;
  quantity: number; // net quantity
  averageBuyPrice: number; // weighted average buy price
  marketPrice: number; // current market price
  currency: string;
  unrealisedPnl: number; // unrealised profit/loss. ( marketPrice - averageBuyPrice ) * quantity
  roiPercent: number; // return on investment percentage. ( unrealisedPnl / ( averageBuyPrice * quantity ) ) * 100
}
