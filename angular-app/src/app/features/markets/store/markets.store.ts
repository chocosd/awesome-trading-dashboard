import { Injectable, signal } from '@angular/core';
import {
  Lot,
  OrderInput,
  PositionMetrics,
  PositionState,
} from './markets.store.interfaces';

@Injectable({ providedIn: 'root' })
export class MarketsStore {
  private readonly _portfolio = signal<Record<string, PositionState>>({});
  public readonly portfolio = this._portfolio.asReadonly();
  private readonly _cash = signal<number>(100_000);
  public readonly cash = this._cash.asReadonly();
  private readonly feeRate = 0.001;

  getFeeRate(): number {
    return this.feeRate;
  }

  updateCurrentPrice(symbol: string, price: number) {
    const next = { ...this._portfolio() };
    const position = next[symbol] ?? this.createEmptyPosition();
    position.currentPrice = price;
    next[symbol] = position;
    this._portfolio.set(next);
  }

  applyOrder(order: OrderInput) {
    if (!order.symbol) {
      return;
    }

    const next = { ...this._portfolio() };
    const position: PositionState =
      next[order.symbol] ?? this.createEmptyPosition();

    if (order.side === 'BUY') {
      position.lots = [...position.lots, this.createBuyLot(order)];
      const shares = Math.max(1, Math.trunc(order.quantity));
      const fee = order.price * shares * this.feeRate;
      this._cash.set(this._cash() - order.price * shares - fee);
      next[order.symbol] = position;
      this._portfolio.set(next);
      return;
    }

    const reduced = this.reduceLotsForSale(
      position.lots,
      order.price,
      order.quantity
    );
    position.lots = reduced.lots;
    position.realizedPnl += reduced.realizedDelta;

    const shares = Math.max(1, Math.trunc(order.quantity));
    const fee = order.price * shares * this.feeRate;

    this._cash.set(this._cash() + order.price * shares - fee);
    next[order.symbol] = position;
    this._portfolio.set(next);
  }

  getPosition(symbol: string | null | undefined): PositionMetrics {
    if (!symbol) {
      return this.createEmptyMetrics('');
    }
    const pos = this._portfolio()[symbol] ?? this.createEmptyPosition();
    const quantity = pos.lots.reduce((sum, lot) => sum + lot.qty, 0);
    const costBasis = pos.lots.reduce(
      (sum, lot) => sum + lot.qty * lot.price,
      0
    );
    const avgCost = quantity > 0 ? costBasis / quantity : 0;
    const marketValue =
      pos.currentPrice != null ? quantity * pos.currentPrice : 0;
    const unrealizedPnl =
      pos.currentPrice != null ? (pos.currentPrice - avgCost) * quantity : 0;
    return {
      symbol,
      quantity,
      avgCost,
      currentPrice: pos.currentPrice,
      marketValue,
      unrealizedPnl,
      realizedPnl: pos.realizedPnl,
    };
  }

  // Helpers
  private createEmptyPosition(): PositionState {
    return { lots: [], currentPrice: null, realizedPnl: 0 };
  }

  private createEmptyMetrics(symbol: string): PositionMetrics {
    return {
      symbol,
      quantity: 0,
      avgCost: 0,
      currentPrice: null,
      marketValue: 0,
      unrealizedPnl: 0,
      realizedPnl: 0,
    };
  }

  private createBuyLot(order: OrderInput): Lot {
    return {
      qty: Math.max(1, Math.trunc(order.quantity)),
      price: order.price,
      timestamp: order.timestamp ?? new Date().toISOString(),
    };
  }

  private reduceLotsForSale(
    lots: Lot[],
    sellPrice: number,
    qty: number
  ): { lots: Lot[]; realizedDelta: number } {
    let toSell = Math.max(1, Math.trunc(qty));
    let realizedDelta = 0;
    const nextLots: Lot[] = [];
    for (const lot of lots) {
      if (toSell <= 0) {
        nextLots.push(lot);
        continue;
      }
      const sellQty = Math.min(lot.qty, toSell);
      realizedDelta += (sellPrice - lot.price) * sellQty;
      const remaining = lot.qty - sellQty;
      if (remaining > 0) {
        nextLots.push({ ...lot, qty: remaining });
      }
      toSell -= sellQty;
    }
    return { lots: nextLots, realizedDelta };
  }
}
