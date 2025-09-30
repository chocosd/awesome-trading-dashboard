export type OrderSide = 'BUY' | 'SELL';

export interface OrderInput {
  symbol: string;
  side: OrderSide;
  quantity: number; // whole shares
  price: number; // execution price
  timestamp?: string; // ISO
}

export interface Lot {
  qty: number; // remaining quantity in this lot
  price: number; // execution price
  timestamp: string; // ISO
}

export interface PositionState {
  lots: Lot[]; // FIFO lots
  currentPrice: number | null; // last/mark
  realizedPnl: number; // cumulative realized PnL
}

export interface PositionMetrics {
  symbol: string;
  quantity: number; // sum of lots
  avgCost: number; // weighted avg cost of remaining lots
  currentPrice: number | null;
  marketValue: number; // quantity * currentPrice (0 if null)
  unrealizedPnl: number; // (current - avgCost) * quantity
  realizedPnl: number; // from state
}
