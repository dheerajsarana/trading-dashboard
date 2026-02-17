import React from 'react';
import { DayPerformance, Trade } from '../types';
import { Calendar, TrendingUp, TrendingDown, Award, BarChart3, Clock } from 'lucide-react';

interface DayPerformanceChartProps {
  data: DayPerformance[];
}

export const DayPerformanceChart: React.FC<DayPerformanceChartProps> = ({ data }) => {
  const maxPnL = Math.max(...data.map(d => Math.abs(d.pnl)), 1);

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary/60" />
        <h3 className="text-lg font-bold tracking-tight">Day Performance</h3>
      </div>
      <p className="text-muted-foreground text-xs mb-4">Find your best trading days</p>

      <div className="space-y-3">
        {data.map((day) => (
          <div key={day.day} className="flex items-center gap-3">
            <div className="w-10 text-muted-foreground text-xs font-medium">{day.day}</div>
            <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${day.pnl >= 0 ? 'bg-profit' : 'bg-loss'}`}
                style={{ width: `${(Math.abs(day.pnl) / maxPnL) * 100}%` }}
              />
            </div>
            <div className={`w-20 text-right text-xs font-semibold font-mono-num ${day.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {day.pnl >= 0 ? '+' : ''}${day.pnl.toFixed(0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface LongShortStatsProps {
  longTrades: number;
  longPnL: number;
  longWinRate: number;
  shortTrades: number;
  shortPnL: number;
  shortWinRate: number;
}

export const LongShortStats: React.FC<LongShortStatsProps> = ({
  longTrades,
  longPnL,
  longWinRate,
  shortTrades,
  shortPnL,
  shortWinRate,
}) => {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary/60" />
        <h3 className="text-lg font-bold tracking-tight">Long vs Short</h3>
      </div>
      <p className="text-muted-foreground text-xs mb-4">Performance by trade direction</p>

      <div className="space-y-4">
        <div className="border-l-2 border-profit pl-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-profit" />
            <span className="text-sm font-medium">Long</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">Trades</div>
              <div className="font-semibold font-mono-num">{longTrades}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">P&L</div>
              <div className={`font-semibold font-mono-num ${longPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                ${longPnL.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">Win %</div>
              <div className="font-semibold font-mono-num">{longWinRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="border-l-2 border-loss pl-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-loss" />
            <span className="text-sm font-medium">Short</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">Trades</div>
              <div className="font-semibold font-mono-num">{shortTrades}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">P&L</div>
              <div className={`font-semibold font-mono-num ${shortPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                ${shortPnL.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium">Win %</div>
              <div className="font-semibold font-mono-num">{shortWinRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TopSymbolsProps {
  symbols: { symbol: string; pnl: number; trades: number }[];
}

const getSymbolCategory = (symbol: string): { color: string; bg: string; label: string } => {
  const s = symbol.toUpperCase();
  if (s.includes('BTC') || s.includes('ETH') || s.includes('SOL') || s.includes('BNB') || s.includes('XRP')) {
    return { color: 'text-crypto', bg: 'bg-crypto/10', label: 'C' };
  }
  if (s.includes('XAU') || s.includes('XAG') || s.includes('GOLD') || s.includes('SILVER')) {
    return { color: 'text-metal', bg: 'bg-metal/10', label: 'M' };
  }
  return { color: 'text-forex', bg: 'bg-forex/10', label: 'F' };
};

export const TopSymbols: React.FC<TopSymbolsProps> = ({ symbols }) => {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-primary/60" />
        <h3 className="text-lg font-bold tracking-tight">Top Symbols</h3>
      </div>
      <p className="text-muted-foreground text-xs mb-4">Best performing assets</p>

      {symbols.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
            <Award className="h-4 w-4 text-muted-foreground/40" />
          </div>
          <p className="text-xs text-muted-foreground">No symbol data yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {symbols.map((item, index) => {
            const category = getSymbolCategory(item.symbol);
            return (
              <div key={item.symbol} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground text-xs font-mono-num w-5">#{index + 1}</div>
                  <div className={`w-6 h-6 rounded ${category.bg} flex items-center justify-center`}>
                    <span className={`text-[9px] font-bold ${category.color}`}>{category.label}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.symbol}</div>
                    <div className="text-muted-foreground text-[10px] font-mono-num">{item.trades} trades</div>
                  </div>
                </div>
                <div className={`font-semibold text-sm font-mono-num ${item.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface WinLossDistributionProps {
  grossProfit: number;
  grossLoss: number;
  netResult: number;
}

export const WinLossDistribution: React.FC<WinLossDistributionProps> = ({
  grossProfit,
  grossLoss,
  netResult,
}) => {
  const total = grossProfit + grossLoss;
  const profitPercent = total > 0 ? (grossProfit / total) * 100 : 0;

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary/60" />
        <h3 className="text-lg font-bold tracking-tight">Win/Loss Distribution</h3>
      </div>

      {grossProfit === 0 && grossLoss === 0 ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground/40" />
          </div>
          <p className="text-xs text-muted-foreground">No closed trades</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Visual bar */}
          <div className="h-3 rounded-full overflow-hidden flex bg-secondary">
            <div className="bg-profit h-full rounded-l-full transition-all" style={{ width: `${profitPercent}%` }} />
            <div className="bg-loss h-full rounded-r-full transition-all" style={{ width: `${100 - profitPercent}%` }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-profit"></div>
              <span className="text-muted-foreground text-xs">Gross Profit</span>
            </div>
            <span className="text-profit font-semibold text-sm font-mono-num">+${grossProfit.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-loss"></div>
              <span className="text-muted-foreground text-xs">Gross Loss</span>
            </div>
            <span className="text-loss font-semibold text-sm font-mono-num">-${grossLoss.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm font-medium">Net Result</span>
            <span className={`font-bold text-sm font-mono-num ${netResult >= 0 ? 'text-profit' : 'text-loss'}`}>
              {netResult >= 0 ? '+' : ''}${netResult.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface RecentTradesProps {
  trades: Trade[];
}

export const RecentTrades: React.FC<RecentTradesProps> = ({ trades }) => {
  const recentTrades = trades.slice(-10).reverse();

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary/60" />
        <h3 className="text-lg font-bold tracking-tight">Recent Trades</h3>
      </div>
      <p className="text-muted-foreground text-xs mb-4">Your last 10 trades</p>

      {recentTrades.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
            <Clock className="h-4 w-4 text-muted-foreground/40" />
          </div>
          <p className="text-xs text-muted-foreground">No recent trades</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {recentTrades.map((trade, index) => {
            const category = getSymbolCategory(trade.symbol);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    trade.type === 'buy'
                      ? 'bg-profit/10 text-profit'
                      : 'bg-loss/10 text-loss'
                  }`}>
                    {trade.type === 'buy' ? 'LONG' : 'SHORT'}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{trade.symbol}</div>
                    <div className="text-muted-foreground text-[10px]">
                      {new Date(trade.closeTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`font-semibold text-sm font-mono-num ${trade.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
