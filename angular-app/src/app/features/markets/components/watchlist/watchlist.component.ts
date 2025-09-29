import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { ArrowDown, ArrowUp, LucideAngularModule } from 'lucide-angular';
import { MarketsMockService } from '../../services/markets-mock.service';

@Component({
  standalone: true,
  selector: 'app-watchlist',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.scss',
})
export class WatchlistComponent {
  private svc = inject(MarketsMockService);

  protected arrowDown = ArrowDown;
  protected arrowUp = ArrowUp;

  protected items = this.svc.watchlist;
  protected selected = this.svc.selectedSymbol;

  selectSymbol = output<string>();

  protected onSelect(symbol: string) {
    this.svc.select(symbol);
    this.selectSymbol.emit(symbol);
  }
}
