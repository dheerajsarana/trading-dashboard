import { TradeRecord } from './statistics.service';

export type TimePeriod = 'today' | '7days' | '30days' | '3months' | '1year' | 'all';

export class TradeFilterService {
  static filterByPeriod(trades: TradeRecord[], period: TimePeriod): TradeRecord[] {
    if (period === 'all') return trades;

    const now = new Date();
    const cutoffDate = new Date();

    switch (period) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return trades.filter((trade) => trade.closeTime >= cutoffDate);
  }

  static filterByAsset(trades: TradeRecord[], asset: string): TradeRecord[] {
    if (asset === 'all') return trades;
    return trades.filter((trade) => trade.symbol === asset);
  }

  static filterByType(trades: TradeRecord[], type: string): TradeRecord[] {
    if (type === 'all') return trades;
    if (type === 'winners') return trades.filter((t) => t.profit > 0);
    if (type === 'losers') return trades.filter((t) => t.profit < 0);
    return trades;
  }

  static getDateRangeForPeriod(period: TimePeriod): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case '3months':
        start.setMonth(end.getMonth() - 3);
        break;
      case '1year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(1970, 0, 1);
        break;
    }

    return { start, end };
  }
}
