import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  ColorType,
  createChart,
  // 👇 v5 markers plugin + types
  createSeriesMarkers,
  IChartApi,
  ISeriesApi,
  ISeriesMarkersPluginApi,
  LineData,
  LineSeries,
  SeriesMarker,
  UTCTimestamp,
} from 'lightweight-charts';
import { transformCandlesToLineData } from '../../consts/candles-transform';
import { Candle } from '../../interfaces/market.interfaces';

interface PortfolioTrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: number;
  price: number;
  timestamp: string; // ISO datetime
}

export type LineDataMap = Map<
  '1D' | '1W' | '1M' | '1Y',
  LineData<UTCTimestamp>[]
>;

@Component({
  selector: 'app-market-chart',
  templateUrl: './market-chart.component.html',
  styleUrls: ['./market-chart.component.scss'],
})
export class MarketChartComponent implements OnDestroy {
  // Inputs
  public marketData = input<Candle[]>([]);
  public portfolio = input<PortfolioTrade[]>([]);

  // Derived line data by interval
  protected lineDataMap = computed<LineDataMap>(() =>
    transformCandlesToLineData(this.marketData())
  );

  // DOM + chart state
  protected container = viewChild<ElementRef<HTMLDivElement>>('container');
  private chart = signal<IChartApi | null>(null);
  private lineSeries = signal<ISeriesApi<'Line'> | null>(null);
  private markersPlugin = signal<ISeriesMarkersPluginApi<UTCTimestamp> | null>(
    null
  );
  private resizeObserver: ResizeObserver | null = null;

  // Reactive state
  public activeInterval = signal<'1D' | '1W' | '1M' | '1Y'>('1D');
  public activeTrades = signal<PortfolioTrade[]>([]);

  // Config
  readonly intervals: Array<'1D' | '1W' | '1M' | '1Y'> = [
    '1D',
    '1W',
    '1M',
    '1Y',
  ];
  private readonly injector = inject(Injector);

  private intervalColors: Record<'1D' | '1W' | '1M' | '1Y', string> = {
    '1D': '#2962FF',
    '1W': 'rgb(225, 87, 90)',
    '1M': 'rgb(242, 142, 44)',
    '1Y': 'rgb(164, 89, 209)',
  };

  constructor() {
    this.initChartEffect();
    this.updateSeriesEffect();
    this.updateMarkersEffect();
  }

  // Create chart & series once
  private initChartEffect() {
    effect(
      () => {
        const host = this.container()?.nativeElement;
        if (!host) {
          return;
        }

        const chart = createChart(host, {
          layout: {
            textColor: 'black',
            background: { type: ColorType.Solid, color: 'white' },
          },
          height: host.clientHeight || 300,
        });
        this.chart.set(chart);

        const series = chart.addSeries(LineSeries, {
          color: this.intervalColors[untracked(() => this.activeInterval())],
        });
        this.lineSeries.set(series);

        const markers = createSeriesMarkers(series, []);

        this.markersPlugin.set(
          markers as ISeriesMarkersPluginApi<UTCTimestamp>
        );

        this.resizeObserver = new ResizeObserver((entries) => {
          entries.forEach((entry) => {
            chart.resize(
              entry.contentRect.width,
              entry.contentRect.height || 300
            );
          });
        });
        this.resizeObserver.observe(host);
      },
      { injector: this.injector }
    );
  }

  private updateSeriesEffect() {
    effect(
      () => {
        const interval = this.activeInterval();
        const data = this.lineDataMap()?.get(interval) ?? [];
        const series = this.lineSeries();
        const chart = this.chart();

        if (!series || !chart) {
          return;
        }

        series.setData(data);
        series.applyOptions({ color: this.intervalColors[interval] });
        chart.timeScale().fitContent();

        this.updateActiveTrades(data);
      },
      { injector: this.injector }
    );
  }

  // Paint markers whenever trades/interval/series change
  private updateMarkersEffect() {
    effect(
      () => {
        const plugin = this.markersPlugin();
        const series = this.lineSeries();
        const interval = this.activeInterval();
        const data = this.lineDataMap()?.get(interval) ?? [];
        const trades = this.activeTrades();

        if (!plugin || !series) {
          return;
        }

        const dayIndex = new Map<string, UTCTimestamp>();
        for (const d of data) {
          const ts = d.time as number;
          const key = new Date(ts * 1000).toISOString().slice(0, 10);
          dayIndex.set(key, ts as UTCTimestamp);
        }

        const markers: SeriesMarker<UTCTimestamp>[] = [];

        for (const t of trades) {
          const dayKey = new Date(t.timestamp).toISOString().slice(0, 10);
          const barTime = dayIndex.get(dayKey);
          if (!barTime) {
            continue;
          }
          markers.push({
            time: barTime,
            position: t.side === 'BUY' ? 'belowBar' : 'aboveBar',
            shape: t.side === 'BUY' ? 'arrowUp' : 'arrowDown',
            color: t.side === 'BUY' ? '#2ecc71' : '#e74c3c',
            text: `${t.side} ${t.qty}@${t.price}`,
          });
        }

        plugin.setMarkers(markers);
      },
      { injector: this.injector }
    );
  }

  private updateActiveTrades(data: LineData<UTCTimestamp>[]) {
    const trades = this.portfolio();
    if (!trades.length || !data.length) {
      this.activeTrades.set([]);
      return;
    }

    const startTime = data[0].time as number;
    const endTime = data[data.length - 1].time as number;

    const tradesInRange = trades.filter((t) => {
      const ts = Math.floor(new Date(t.timestamp).getTime() / 1000);
      return ts >= startTime && ts <= endTime;
    });

    this.activeTrades.set(tradesInRange);
  }

  // Button handler
  public setChartInterval(interval: '1D' | '1W' | '1M' | '1Y') {
    this.activeInterval.set(interval);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.chart()) {
      this.chart()?.remove();
      this.chart.set(null);
    }
    this.lineSeries.set(null);
    this.markersPlugin.set(null);
  }
}
