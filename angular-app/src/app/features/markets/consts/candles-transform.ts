import { LineData, UTCTimestamp } from 'lightweight-charts';
import { Trades } from '../enums/trades.enum';
import { Candle } from '../interfaces/market.interfaces';

/**
 * Convert raw Candle[] into grouped line series data
 * (1D, 1W, 1M, 1Y).
 */
export function transformCandlesToLineData(
  candles: Candle[]
): Map<'1D' | '1W' | '1M' | '1Y', LineData<UTCTimestamp>[]> {
  const map = new Map<'1D' | '1W' | '1M' | '1Y', LineData<UTCTimestamp>[]>();

  const dayData: LineData<UTCTimestamp>[] = candles.map((c) => ({
    time: Math.floor(new Date(c[Trades.Time]).getTime() / 1000) as UTCTimestamp,
    value: c[Trades.Close],
  }));

  map.set('1D', dayData);
  map.set('1W', groupByInterval(dayData, 'week'));
  map.set('1M', groupByInterval(dayData, 'month'));
  map.set('1Y', groupByInterval(dayData, 'year'));

  return map;
}

function groupByInterval(
  data: LineData<UTCTimestamp>[],
  interval: 'week' | 'month' | 'year'
): LineData<UTCTimestamp>[] {
  // Group using Object.groupBy (ES2023)
  const grouped = Object.groupBy(data, (d) => {
    const date = new Date((d.time as number) * 1000);

    if (interval === 'week') {
      return `${date.getFullYear()}-W${getWeekNumber(date)}`;
    }
    if (interval === 'month') {
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    }
    return `${date.getFullYear()}`;
  });

  // Convert grouped object back into averaged line points
  return Object.values(grouped).map((arr) => {
    if (!arr?.length) {
      return { time: data[data.length - 1].time, value: 0 };
    }

    const avg = arr.reduce((sum, d) => sum + d.value, 0) / arr.length;
    return { time: arr[arr.length - 1].time, value: avg };
  });
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
}
