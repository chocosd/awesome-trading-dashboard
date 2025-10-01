import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ArrowDown, ArrowUp, LucideAngularModule } from 'lucide-angular';
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
  ],
  templateUrl: './markets.page.html',
  styleUrl: './markets.page.scss',
})
export class MarketsPage {
  private marketsMockService = inject(MarketsMockService);

  protected arrowDown = ArrowDown;
  protected arrowUp = ArrowUp;

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

  protected portfolio = this.marketsMockService.pastTrades;

  protected select(symbol: string) {
    this.marketsMockService.select(symbol);
  }
}
