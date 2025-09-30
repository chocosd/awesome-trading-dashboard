import { Injectable, type Signal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PortfolioMockService {
  // Map of symbol -> owned whole shares
  private readonly _holdings = signal<Record<string, number>>({
    AAPL: 12,
    MSFT: 3,
    GOOG: 0,
  });

  holdings(): Signal<Record<string, number>> {
    return this._holdings.asReadonly();
  }

  holdingFor(symbol: string | null | undefined): number {
    if (!symbol) {
      return 0;
    }

    return this._holdings()[symbol] ?? 0;
  }

  setHolding(symbol: string, quantity: number) {
    const next = { ...this._holdings() };
    next[symbol] = Math.max(0, Math.trunc(quantity));
    this._holdings.set(next);
  }
}
