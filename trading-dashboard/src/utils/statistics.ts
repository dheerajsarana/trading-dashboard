import { Trade, TradeStats, TimePeriod, DayPerformance, EquityPoint } from '../types';

export const filterTradesByPeriod = (trades: Trade[], period: TimePeriod): Trade[] => {
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

  return trades.filter(trade => trade.closeTime >= cutoffDate);
};

export const calculateStats = (trades: Trade[]): TradeStats => {
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

  const winners = trades.filter(t => t.profit > 0);
  const losers = trades.filter(t => t.profit < 0);
  const longTrades = trades.filter(t => t.type === 'buy');
  const shortTrades = trades.filter(t => t.type === 'sell');

  const totalPnL = trades.reduce((sum, t) => sum + t.profit, 0);
  const grossProfit = winners.reduce((sum, t) => sum + t.profit, 0);
  const grossLoss = Math.abs(losers.reduce((sum, t) => sum + t.profit, 0));

  const avgWinner = winners.length > 0 ? grossProfit / winners.length : 0;
  const avgLoser = losers.length > 0 ? grossLoss / losers.length : 0;

  const winRate = trades.length > 0 ? (winners.length / trades.length) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
  const expectancy = trades.length > 0 ? totalPnL / trades.length : 0;

  const longWins = longTrades.filter(t => t.profit > 0).length;
  const shortWins = shortTrades.filter(t => t.profit > 0).length;

  const longPnL = longTrades.reduce((sum, t) => sum + t.profit, 0);
  const shortPnL = shortTrades.reduce((sum, t) => sum + t.profit, 0);

  // Calculate streaks
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  trades.forEach(trade => {
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
    bestTrade: winners.length > 0 ? Math.max(...winners.map(t => t.profit)) : 0,
    worstTrade: losers.length > 0 ? Math.min(...losers.map(t => t.profit)) : 0,
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
};

export const getDayPerformance = (trades: Trade[]): DayPerformance[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats: { [key: string]: { trades: number; pnl: number } } = {};

  days.forEach(day => {
    dayStats[day] = { trades: 0, pnl: 0 };
  });

  trades.forEach(trade => {
    const dayName = days[trade.closeTime.getDay()];
    dayStats[dayName].trades++;
    dayStats[dayName].pnl += trade.profit;
  });

  return days.map(day => ({
    day,
    trades: dayStats[day].trades,
    pnl: dayStats[day].pnl,
  }));
};

export const getEquityCurve = (trades: Trade[]): EquityPoint[] => {
  if (trades.length === 0) return [];

  const sortedTrades = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
  let runningTotal = 0;

  return sortedTrades.map(trade => {
    runningTotal += trade.profit;
    return {
      date: trade.closeTime.toISOString().split('T')[0],
      equity: runningTotal,
    };
  });
};

export const getTopSymbols = (trades: Trade[]): { symbol: string; pnl: number; trades: number }[] => {
  const symbolStats: { [key: string]: { pnl: number; trades: number } } = {};

  trades.forEach(trade => {
    if (!symbolStats[trade.symbol]) {
      symbolStats[trade.symbol] = { pnl: 0, trades: 0 };
    }
    symbolStats[trade.symbol].pnl += trade.profit;
    symbolStats[trade.symbol].trades++;
  });

  return Object.entries(symbolStats)
    .map(([symbol, stats]) => ({ symbol, ...stats }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 10);
};

export const getTradesByDate = (trades: Trade[], date: Date): Trade[] => {
  return trades.filter(trade => {
    const tradeDate = new Date(trade.closeTime);
    return (
      tradeDate.getDate() === date.getDate() &&
      tradeDate.getMonth() === date.getMonth() &&
      tradeDate.getFullYear() === date.getFullYear()
    );
  });
};

export const getUniqueSymbols = (trades: Trade[]): string[] => {
  const symbols = new Set(trades.map(trade => trade.symbol).filter(Boolean));
  return ['all', ...Array.from(symbols).sort()];
};

export const calculateDrawdown = (trades: Trade[]): import('../types').DrawdownStats => {
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

  const sortedTrades = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
  
  let equity = 0;
  let peak = 0;
  let maxDD = 0;
  let maxDDPercent = 0;
  let currentDD = 0;
  let drawdowns: number[] = [];
  let drawdownDurations: number[] = [];
  let drawdownStart: Date | null = null;
  
  sortedTrades.forEach(trade => {
    equity += trade.profit;
    
    if (equity > peak) {
      // New peak - end of drawdown if we were in one
      if (drawdownStart) {
        const duration = (trade.closeTime.getTime() - drawdownStart.getTime()) / (1000 * 60 * 60 * 24);
        drawdownDurations.push(duration);
        drawdownStart = null;
      }
      peak = equity;
      currentDD = 0;
    } else {
      // In drawdown
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
  const avgDDDuration = drawdownDurations.length > 0 
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
};

export const calculateDurationStats = (trades: Trade[]): import('../types').DurationStats => {
  if (trades.length === 0) {
    return {
      avgHoldTimeWinners: 0,
      avgHoldTimeLosers: 0,
      avgHoldTimeAll: 0,
      optimalHoldingWindow: 'N/A',
    };
  }

  const winners = trades.filter(t => t.profit > 0);
  const losers = trades.filter(t => t.profit < 0);

  const calculateHours = (trade: Trade) => {
    return (trade.closeTime.getTime() - trade.openTime.getTime()) / (1000 * 60 * 60);
  };

  const avgWinnerHours = winners.length > 0
    ? winners.reduce((sum, t) => sum + calculateHours(t), 0) / winners.length
    : 0;

  const avgLoserHours = losers.length > 0
    ? losers.reduce((sum, t) => sum + calculateHours(t), 0) / losers.length
    : 0;

  const avgAllHours = trades.reduce((sum, t) => sum + calculateHours(t), 0) / trades.length;

  // Determine optimal holding window based on winner average
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
};

export const getTradingSession = (date: Date): import('../types').TradingSession => {
  const hour = date.getUTCHours();
  
  // Asia: 00:00 - 09:00 UTC
  if (hour >= 0 && hour < 9) {
    return 'Asia';
  }
  // London: 08:00 - 17:00 UTC (overlaps with Asia 08:00-09:00)
  // London-NY Overlap: 13:00 - 17:00 UTC
  else if (hour >= 13 && hour < 17) {
    return 'London-NY Overlap';
  }
  else if (hour >= 8 && hour < 17) {
    return 'London';
  }
  // New York: 13:00 - 22:00 UTC (overlaps handled above)
  else if (hour >= 17 && hour < 22) {
    return 'New York';
  }
  // Late NY / Early Asia
  else {
    return 'Asia';
  }
};

export const calculateSessionStats = (trades: Trade[]): import('../types').SessionStats[] => {
  const sessionData: { [key: string]: { trades: Trade[], pnl: number } } = {
    'Asia': { trades: [], pnl: 0 },
    'London': { trades: [], pnl: 0 },
    'New York': { trades: [], pnl: 0 },
    'London-NY Overlap': { trades: [], pnl: 0 },
  };

  trades.forEach(trade => {
    const session = getTradingSession(trade.openTime);
    sessionData[session].trades.push(trade);
    sessionData[session].pnl += trade.profit;
  });

  return Object.entries(sessionData).map(([session, data]) => {
    const wins = data.trades.filter(t => t.profit > 0).length;
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
  }).sort((a, b) => b.expectancy - a.expectancy); // Sort by best expectancy
};

