export interface TradeRecord {
  profit: number;
  type: string;
  openTime: Date;
  closeTime: Date;
  symbol: string;
  volume: number;
  openPrice: number;
  closePrice: number;
  commission: number;
  swap: number;
}

export interface TradeStats {
  totalPnL: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  totalTrades: number;
  wins: number;
  losses: number;
  avgWinner: number;
  avgLoser: number;
  bestTrade: number;
  worstTrade: number;
  winStreak: number;
  lossStreak: number;
  longTrades: number;
  longPnL: number;
  longWinRate: number;
  shortTrades: number;
  shortPnL: number;
  shortWinRate: number;
  grossProfit: number;
  grossLoss: number;
}

export interface DrawdownStats {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  avgDrawdown: number;
  avgDrawdownDuration: number;
  maxDrawdownDuration: number;
  recoveryFactor: number;
  currentDrawdown: number;
}

export interface DurationStats {
  avgHoldTimeWinners: number;
  avgHoldTimeLosers: number;
  avgHoldTimeAll: number;
  optimalHoldingWindow: string;
}

export interface SessionStat {
  session: string;
  trades: number;
  pnl: number;
  winRate: number;
  expectancy: number;
  avgProfit: number;
}

export class StatisticsService {
  static calculateBasicStats(trades: TradeRecord[]): TradeStats {
    if (trades.length === 0) {
      return {
        totalPnL: 0,
        winRate: 0,
        profitFactor: 0,
        expectancy: 0,
        totalTrades: 0,
        wins: 0,
        losses: 0,
        avgWinner: 0,
        avgLoser: 0,
        bestTrade: 0,
        worstTrade: 0,
        winStreak: 0,
        lossStreak: 0,
        longTrades: 0,
        longPnL: 0,
        longWinRate: 0,
        shortTrades: 0,
        shortPnL: 0,
        shortWinRate: 0,
        grossProfit: 0,
        grossLoss: 0,
      };
    }

    const winners = trades.filter((t) => t.profit > 0);
    const losers = trades.filter((t) => t.profit < 0);
    const longTrades = trades.filter((t) => t.type === 'buy');
    const shortTrades = trades.filter((t) => t.type === 'sell');

    const totalPnL = trades.reduce((sum, t) => sum + t.profit, 0);
    const grossProfit = winners.reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(losers.reduce((sum, t) => sum + t.profit, 0));

    const avgWinner = winners.length > 0 ? grossProfit / winners.length : 0;
    const avgLoser = losers.length > 0 ? grossLoss / losers.length : 0;

    const winRate = trades.length > 0 ? (winners.length / trades.length) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    const expectancy = trades.length > 0 ? totalPnL / trades.length : 0;

    const longWins = longTrades.filter((t) => t.profit > 0).length;
    const shortWins = shortTrades.filter((t) => t.profit > 0).length;

    const longPnL = longTrades.reduce((sum, t) => sum + t.profit, 0);
    const shortPnL = shortTrades.reduce((sum, t) => sum + t.profit, 0);

    // Calculate streaks
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    trades.forEach((trade) => {
      if (trade.profit > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else if (trade.profit < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }
    });

    return {
      totalPnL,
      winRate,
      profitFactor,
      expectancy,
      totalTrades: trades.length,
      wins: winners.length,
      losses: losers.length,
      avgWinner,
      avgLoser,
      bestTrade: winners.length > 0 ? Math.max(...winners.map((t) => t.profit)) : 0,
      worstTrade: losers.length > 0 ? Math.min(...losers.map((t) => t.profit)) : 0,
      winStreak: maxWinStreak,
      lossStreak: maxLossStreak,
      longTrades: longTrades.length,
      longPnL,
      longWinRate: longTrades.length > 0 ? (longWins / longTrades.length) * 100 : 0,
      shortTrades: shortTrades.length,
      shortPnL,
      shortWinRate: shortTrades.length > 0 ? (shortWins / shortTrades.length) * 100 : 0,
      grossProfit,
      grossLoss,
    };
  }

  static calculateDrawdown(trades: TradeRecord[]): DrawdownStats {
    if (trades.length === 0) {
      return {
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        avgDrawdown: 0,
        avgDrawdownDuration: 0,
        maxDrawdownDuration: 0,
        recoveryFactor: 0,
        currentDrawdown: 0,
      };
    }

    const sortedTrades = [...trades].sort(
      (a, b) => a.closeTime.getTime() - b.closeTime.getTime()
    );

    let equity = 0;
    let peak = 0;
    let maxDD = 0;
    let maxDDPercent = 0;
    let currentDD = 0;
    const drawdowns: number[] = [];
    const drawdownDurations: number[] = [];
    let drawdownStart: Date | null = null;

    sortedTrades.forEach((trade) => {
      equity += trade.profit;

      if (equity > peak) {
        if (drawdownStart) {
          const duration =
            (trade.closeTime.getTime() - drawdownStart.getTime()) / (1000 * 60 * 60 * 24);
          drawdownDurations.push(duration);
          drawdownStart = null;
        }
        peak = equity;
        currentDD = 0;
      } else {
        currentDD = peak - equity;

        if (!drawdownStart) {
          drawdownStart = trade.closeTime;
        }

        if (currentDD > maxDD) {
          maxDD = currentDD;
          maxDDPercent = peak > 0 ? (maxDD / peak) * 100 : 0;
        }

        drawdowns.push(currentDD);
      }
    });

    const avgDD = drawdowns.length > 0 ? drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length : 0;
    const avgDDDuration =
      drawdownDurations.length > 0
        ? drawdownDurations.reduce((a, b) => a + b, 0) / drawdownDurations.length
        : 0;
    const maxDDDuration = drawdownDurations.length > 0 ? Math.max(...drawdownDurations) : 0;

    const totalProfit = sortedTrades.reduce((sum, t) => sum + (t.profit > 0 ? t.profit : 0), 0);
    const recoveryFactor = maxDD > 0 ? totalProfit / maxDD : 0;

    return {
      maxDrawdown: maxDD,
      maxDrawdownPercent: maxDDPercent,
      avgDrawdown: avgDD,
      avgDrawdownDuration: avgDDDuration,
      maxDrawdownDuration: maxDDDuration,
      recoveryFactor,
      currentDrawdown: currentDD,
    };
  }

  static calculateDuration(trades: TradeRecord[]): DurationStats {
    if (trades.length === 0) {
      return {
        avgHoldTimeWinners: 0,
        avgHoldTimeLosers: 0,
        avgHoldTimeAll: 0,
        optimalHoldingWindow: 'N/A',
      };
    }

    const winners = trades.filter((t) => t.profit > 0);
    const losers = trades.filter((t) => t.profit < 0);

    const calculateHours = (trade: TradeRecord) => {
      return (trade.closeTime.getTime() - trade.openTime.getTime()) / (1000 * 60 * 60);
    };

    const avgWinnerHours =
      winners.length > 0 ? winners.reduce((sum, t) => sum + calculateHours(t), 0) / winners.length : 0;

    const avgLoserHours =
      losers.length > 0 ? losers.reduce((sum, t) => sum + calculateHours(t), 0) / losers.length : 0;

    const avgAllHours = trades.reduce((sum, t) => sum + calculateHours(t), 0) / trades.length;

    let optimalWindow = 'N/A';
    if (avgWinnerHours < 4) {
      optimalWindow = '< 4 hours (Scalping)';
    } else if (avgWinnerHours < 24) {
      optimalWindow = '4-24 hours (Intraday)';
    } else if (avgWinnerHours < 168) {
      optimalWindow = '1-7 days (Swing)';
    } else {
      optimalWindow = '> 7 days (Position)';
    }

    return {
      avgHoldTimeWinners: avgWinnerHours,
      avgHoldTimeLosers: avgLoserHours,
      avgHoldTimeAll: avgAllHours,
      optimalHoldingWindow: optimalWindow,
    };
  }

  static getTradingSession(date: Date): string {
    // Convert to total minutes since midnight UTC for precise :30 boundaries
    const totalMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();

    // Session boundaries in UTC minutes (derived from IST :30 boundaries)
    // Asia:                01:00–06:30 UTC  (6:30 AM–12:00 PM IST)
    // Asia-London Overlap: 06:30–08:00 UTC  (12:00 PM–1:30 PM IST)
    // London:              08:00–12:00 UTC  (1:30 PM–5:30 PM IST)
    // London-NY Overlap:   12:00–13:00 UTC  (5:30 PM–6:30 PM IST)
    // New York:            13:00–17:00 UTC  (6:30 PM–10:30 PM IST)
    if (totalMinutes >= 60 && totalMinutes < 390) return 'Asia';            // 01:00–06:30
    if (totalMinutes >= 390 && totalMinutes < 480) return 'Asia-London Overlap'; // 06:30–08:00
    if (totalMinutes >= 480 && totalMinutes < 720) return 'London';          // 08:00–12:00
    if (totalMinutes >= 720 && totalMinutes < 780) return 'London-NY Overlap'; // 12:00–13:00
    if (totalMinutes >= 780 && totalMinutes < 1020) return 'New York';       // 13:00–17:00
    return 'Asia';
  }

  static calculateSessionStats(trades: TradeRecord[]): SessionStat[] {
    const sessionData: {
      [key: string]: { trades: TradeRecord[]; pnl: number };
    } = {
      Asia: { trades: [], pnl: 0 },
      'Asia-London Overlap': { trades: [], pnl: 0 },
      London: { trades: [], pnl: 0 },
      'London-NY Overlap': { trades: [], pnl: 0 },
      'New York': { trades: [], pnl: 0 },
    };

    trades.forEach((trade) => {
      const session = this.getTradingSession(trade.openTime);
      sessionData[session].trades.push(trade);
      sessionData[session].pnl += trade.profit;
    });

    return Object.entries(sessionData)
      .map(([session, data]) => {
        const wins = data.trades.filter((t) => t.profit > 0).length;
        const winRate = data.trades.length > 0 ? (wins / data.trades.length) * 100 : 0;
        const expectancy = data.trades.length > 0 ? data.pnl / data.trades.length : 0;
        const avgProfit = data.trades.length > 0 ? data.pnl / data.trades.length : 0;

        return {
          session,
          trades: data.trades.length,
          pnl: data.pnl,
          winRate,
          expectancy,
          avgProfit,
        };
      })
      .sort((a, b) => b.expectancy - a.expectancy);
  }
}
