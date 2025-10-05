import { Funds } from './funds.model';
import { Position } from './portfolio.model';

export enum TradeSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface Trade {
  id: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  price: number;
  timestamp: string;
}

export interface TradePostResponse {
  trade: Trade; // the new trade entry just created
  portfolio: {
    positions: Position[]; // updated positions (not the whole portfolio object necessarily)
  };
  funds: Funds; // updated balances
}
