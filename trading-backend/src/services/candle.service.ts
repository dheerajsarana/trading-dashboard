import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CandleParams {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TwelveDataResponse {
  values: {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }[];
  status?: string;
  message?: string;
}

export class CandleService {
  private static readonly AVAILABLE_SYMBOLS = [
    'EUR/USD',
    'GBP/USD',
    'USD/JPY',
    'USD/CHF',
    'AUD/USD',
    'USD/CAD',
    'NZD/USD',
    'EUR/GBP',
    'EUR/JPY',
    'GBP/JPY',
    'XAU/USD',
    'XAG/USD',
  ];

  private static readonly AVAILABLE_TIMEFRAMES = [
    '1min',
    '5min',
    '15min',
    '30min',
    '1h',
    '4h',
    '1day',
  ];

  static getAvailableSymbols(): string[] {
    return this.AVAILABLE_SYMBOLS;
  }

  static getAvailableTimeframes(): string[] {
    return this.AVAILABLE_TIMEFRAMES;
  }

  static async getCandles(params: CandleParams): Promise<Candle[]> {
    const { symbol, timeframe, startDate, endDate } = params;

    // Check cache first
    const cachedCandles = await prisma.cachedCandle.findMany({
      where: {
        symbol,
        timeframe,
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (cachedCandles.length > 0) {
      return cachedCandles.map((c) => ({
        timestamp: c.timestamp.toISOString(),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      }));
    }

    // Fetch from Twelve Data API
    const candles = await this.fetchFromTwelveData(params);

    // Cache the fetched candles
    if (candles.length > 0) {
      await prisma.cachedCandle.createMany({
        data: candles.map((c) => ({
          symbol,
          timeframe,
          timestamp: new Date(c.timestamp),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
        })),
        skipDuplicates: true,
      });
    }

    return candles;
  }

  private static async fetchFromTwelveData(params: CandleParams): Promise<Candle[]> {
    const { symbol, timeframe, startDate, endDate } = params;
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY environment variable is not set');
    }

    const url = new URL('https://api.twelvedata.com/time_series');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('interval', timeframe);
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('order', 'ASC');
    url.searchParams.set('outputsize', '5000');

    const response = await fetch(url.toString());
    const data = await response.json() as TwelveDataResponse;

    if (data.status === 'error') {
      throw new Error(`Twelve Data API error: ${data.message}`);
    }

    if (!data.values || !Array.isArray(data.values)) {
      return [];
    }

    return data.values.map((v) => {
      const volume = parseFloat(v.volume || '0');
      return {
        timestamp: v.datetime,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: isNaN(volume) ? 0 : volume,
      };
    });
  }
}
