import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ArrowDown, ArrowUp, LucideAngularModule } from 'lucide-angular';
import { ColumnType, TableConfig } from '../../../shared/table.types';
import { TableComponent } from '../../../shared/table/table.component';
import { MarketChartComponent } from '../components/market-chart/market-chart.component';
import { TradePanelComponent } from '../components/trade-panel/trade-panel.component';
import { WatchlistComponent } from '../components/watchlist/watchlist.component';
import { MarketsMockService } from '../services/markets-mock.service';
@Component({
  standalone: true,
  selector: 'app-markets-page',
  imports: [
    CommonModule,
    LucideAngularModule,
    WatchlistComponent,
    TradePanelComponent,
    MarketChartComponent,
    TableComponent,
  ],
  templateUrl: './markets.page.html',
  styleUrl: './markets.page.scss',
})
export class MarketsPage {
  private marketsMockService = inject(MarketsMockService);

  protected readonly arrowDown = ArrowDown;
  protected readonly arrowUp = ArrowUp;

  protected watchlist = this.marketsMockService.watchlist;
  protected selected = this.marketsMockService.selectedSymbol;
  protected series = computed(() =>
    this.selected() ? this.marketsMockService.candlesFor(this.selected()) : []
  );

  protected quote = computed(() => {
    const selected = this.selected();

    if (!selected) {
      return null;
    }

    return (
      this.marketsMockService.watchlist().find((w) => w.symbol === selected)
        ?.quote || null
    );
  });

  protected trades = computed(() => {
    const portfolio = this.portfolio();

    const selected = this.selected();

    return portfolio
      .map((trade) => ({
        ...trade,
        currency: 'USD',
        total: trade.qty * trade.price,
        // Placeholder PnL and ROI: positive for SELL, zero for BUY
        pnl: trade.side === 'SELL' ? trade.qty * trade.price * 0.02 : 0,
        roi: trade.side === 'SELL' ? 2 : 0,
      }))
      .filter((trade) => trade.symbol === selected);
  });

  protected portfolio = this.marketsMockService.tradeHistory;

  protected tradesTable: TableConfig<{
    id: string;
    symbol: string;
    side: string;
    qty: number;
    price: number;
    timestamp: string;
    currency: string;
    total: number;
    pnl: number;
    roi: number;
  }> = {
    rows: [
      {
        key: 'symbol',
        label: 'Symbol',
      },
      {
        key: 'side',
        label: 'Side',
        type: ColumnType.Indicator,
      },
      {
        key: 'currency',
        label: 'Currency',
      },
      {
        key: 'qty',
        label: 'Quantity',
        type: ColumnType.Number,
      },
      {
        key: 'price',
        label: 'Price',
        type: ColumnType.Currency,
      },
      {
        key: 'total',
        label: 'Total',
        type: ColumnType.Currency,
      },
      {
        key: 'pnl',
        label: 'P&L',
        type: ColumnType.Currency,
        colorBySign: true,
      },
      {
        key: 'roi',
        label: 'ROI %',
        type: ColumnType.Number,
        styles: { cell: 'mono' },
        colorBySign: true,
      },
      {
        key: 'timestamp',
        label: 'Time',
        type: ColumnType.Time,
      },
    ],
  };

  protected select(symbol: string) {
    this.marketsMockService.select(symbol);
  }
}
