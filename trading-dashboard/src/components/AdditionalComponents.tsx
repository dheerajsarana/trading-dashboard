import React from 'react';
import { DayPerformance, Trade } from '../types';

interface DayPerformanceChartProps {
  data: DayPerformance[];
}

export const DayPerformanceChart: React.FC<DayPerformanceChartProps> = ({ data }) => {
  const maxPnL = Math.max(...data.map(d => Math.abs(d.pnl)), 1);

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="font-semibold">Day Performance</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">Find your best trading days</p>

      <div className="space-y-3">
        {data.map((day) => (
          <div key={day.day} className="flex items-center gap-3">
            <div className="w-12 text-muted-foreground text-sm">{day.day}</div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${day.pnl >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                style={{ width: `${(Math.abs(day.pnl) / maxPnL) * 100}%` }}
              />
            </div>
            <div className={`w-20 text-right text-sm font-medium ${day.pnl >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              ${day.pnl.toFixed(0)}
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
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <h3 className="font-semibold">Long vs Short</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">Performance by trade direction</p>

      <div className="space-y-4">
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="font-medium">Long</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">TRADES</div>
              <div className="font-semibold">{longTrades}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">P&L</div>
              <div className={`font-semibold ${longPnL >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                ${longPnL.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">WIN %</div>
              <div className="font-semibold">{longWinRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-red-500 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <span className="font-medium">Short</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">TRADES</div>
              <div className="font-semibold">{shortTrades}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">P&L</div>
              <div className={`font-semibold ${shortPnL >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                ${shortPnL.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">WIN %</div>
              <div className="font-semibold">{shortWinRate.toFixed(1)}%</div>
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

export const TopSymbols: React.FC<TopSymbolsProps> = ({ symbols }) => {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold">Top Symbols</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">Best performing assets</p>

      {symbols.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">No symbol data yet</div>
      ) : (
        <div className="space-y-2">
          {symbols.map((item, index) => (
            <div key={item.symbol} className="flex items-center justify-between py-2 border-b border last:border-0">
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground text-sm w-6">#{index + 1}</div>
                <div>
                  <div className="font-medium">{item.symbol}</div>
                  <div className="text-muted-foreground text-xs">{item.trades} trades</div>
                </div>
              </div>
              <div className={`font-semibold ${item.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${item.pnl.toFixed(2)}
              </div>
            </div>
          ))}
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
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="font-semibold">Win/Loss Distribution</h3>
      </div>

      {grossProfit === 0 && grossLoss === 0 ? (
        <div className="text-muted-foreground text-center py-8">No closed trades</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground text-sm">Gross Profit</span>
            </div>
            <span className="text-blue-500 font-semibold">${grossProfit.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground text-sm">Gross Loss</span>
            </div>
            <span className="text-red-500 font-semibold">-${grossLoss.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">Net Result</span>
            </div>
            <span className={`font-semibold ${netResult >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              ${netResult.toFixed(2)}
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
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold">Recent Trades</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">Your last 10 trades</p>

      {recentTrades.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">No recent trades</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentTrades.map((trade, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 mr-3 border-b border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  trade.type === 'buy'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {trade.type.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{trade.symbol}</div>
                  <div className="text-muted-foreground text-xs">
                    {trade.closeTime.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className={`font-semibold ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${trade.profit.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
