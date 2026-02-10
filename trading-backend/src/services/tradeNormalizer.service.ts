import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Converts BigInt fields to strings/numbers for serialization
 */
const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = serializeBigInt(obj[key]);
      }
    }
    return serialized;
  }
  return obj;
};

export class TradeNormalizerService {
  /**
   * Normalize an array of MT5Trade records into Trade-compatible objects
   * Filters out non-trade entries (BALANCE, CREDIT, etc.)
   */
  static normalizeMT5Trades(mt5Trades: any[]): any[] {
    return mt5Trades
      .filter(t => t.type === 'BUY' || t.type === 'SELL')
      .map(trade => {
        const serialized = serializeBigInt(trade);
        return {
          id: serialized.id,
          userId: serialized.userId,
          position: String(serialized.ticket),
          symbol: serialized.symbol,
          type: serialized.type.toLowerCase(), // BUY -> buy, SELL -> sell
          volume: serialized.volume,
          openPrice: serialized.price,
          closePrice: serialized.price,
          openTime: new Date(serialized.time),
          closeTime: new Date(serialized.time),
          stopLoss: 0,
          takeProfit: 0,
          commission: serialized.commission,
          swap: serialized.swap,
          profit: serialized.profit,
          source: 'mt5',
          createdAt: serialized.createdAt,
          updatedAt: serialized.updatedAt,
        };
      });
  }

  /**
   * Fetch all MT5 trades for a user (across all active accounts), normalize them
   */
  static async fetchNormalizedMT5Trades(userId: string): Promise<any[]> {
    const mt5Trades = await prisma.mT5Trade.findMany({
      where: {
        userId,
        type: { in: ['BUY', 'SELL'] },
      },
      orderBy: { time: 'asc' },
    });

    return this.normalizeMT5Trades(mt5Trades);
  }
}
