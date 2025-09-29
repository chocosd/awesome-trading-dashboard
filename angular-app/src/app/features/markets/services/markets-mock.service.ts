import { Injectable, signal } from '@angular/core';
import data from '../consts/markets.mock.json';
import {
  Candle,
  PastTrade,
  WatchlistItem,
} from '../interfaces/market.interfaces';

@Injectable({ providedIn: 'root' })
export class MarketsMockService {
  public watchlist = signal<WatchlistItem[]>(data.watchlist);
  public selectedSymbol = signal<string | null>(
    data.watchlist[0]?.symbol ?? null
  );
  public pastTrades = signal<PastTrade[]>(data.pastTrades as PastTrade[]);

  candlesFor(symbol: string | null): Candle[] {
    if (!symbol) {
      return [];
    }

    const series = (data.candles as Record<string, Candle[]>)[symbol] ?? [];
    return series;
  }

  select(symbol: string) {
    this.selectedSymbol.set(symbol);
  }
}
