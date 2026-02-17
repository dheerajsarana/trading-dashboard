import React from 'react';
import { DrawdownStats, DurationStats, SessionStats } from '../types';
import { TrendingDown, Clock, Globe, Info, Zap, Check, X, BarChart3 } from 'lucide-react';

interface DrawdownIntelligenceProps {
  stats: DrawdownStats;
}

export const DrawdownIntelligence: React.FC<DrawdownIntelligenceProps> = ({ stats }) => {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown className="w-5 h-5 text-loss" />
        <h3 className="text-lg font-bold tracking-tight">Drawdown Intelligence</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 border rounded-lg p-4">
          <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Max Drawdown</div>
          <div className="text-loss text-2xl font-bold font-mono-num mb-1">${stats.maxDrawdown.toFixed(2)}</div>
          <div className="text-muted-foreground text-xs font-mono-num">{stats.maxDrawdownPercent.toFixed(2)}% of peak</div>
        </div>

        <div className="bg-secondary/50 border rounded-lg p-4">
          <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Current Drawdown</div>
          <div className={`text-2xl font-bold font-mono-num mb-1 ${stats.currentDrawdown > 0 ? 'text-loss' : 'text-profit'}`}>
            ${stats.currentDrawdown.toFixed(2)}
          </div>
          <div className="text-muted-foreground text-xs">
            {stats.currentDrawdown === 0 ? 'At new peak' : 'In drawdown'}
          </div>
        </div>

        <div className="bg-secondary/50 border rounded-lg p-4">
          <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Avg Drawdown</div>
          <div className="text-gold text-xl font-semibold font-mono-num">${stats.avgDrawdown.toFixed(2)}</div>
        </div>

        <div className="bg-secondary/50 border rounded-lg p-4">
          <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Recovery Factor</div>
          <div className={`text-xl font-semibold font-mono-num ${stats.recoveryFactor >= 3 ? 'text-profit' : stats.recoveryFactor >= 2 ? 'text-gold' : 'text-loss'}`}>
            {stats.recoveryFactor.toFixed(2)}
          </div>
          <div className="text-muted-foreground text-[10px] mt-1">
            {stats.recoveryFactor >= 3 ? 'Excellent' : stats.recoveryFactor >= 2 ? 'Good' : 'Needs improvement'}
          </div>
        </div>

        <div className="bg-secondary/50 border rounded-lg p-4">
          <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Avg Recovery Time</div>
          <div className="text-primary text-xl font-semibold font-mono-num">
            {stats.avgDrawdownDuration.toFixed(1)} days
          </div>
        </div>

        <div className="bg-secondary/50 border rounded-lg p-4">
          <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Max Recovery Time</div>
          <div className="text-crypto text-xl font-semibold font-mono-num">
            {stats.maxDrawdownDuration.toFixed(1)} days
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-secondary/30 border rounded-lg">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
          <div>
            <strong className="text-foreground">Recovery Factor:</strong> Total Profit / Max Drawdown.
            Above 3 is excellent, above 2 is good. It shows how much you earn relative to your worst loss period.
          </div>
        </div>
      </div>
    </div>
  );
};

interface TradeDurationAnalysisProps {
  stats: DurationStats;
}

export const TradeDurationAnalysis: React.FC<TradeDurationAnalysisProps> = ({ stats }) => {
  const formatHours = (hours: number): string => {
    if (hours < 1) {
      return `${(hours * 60).toFixed(0)} min`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)} hrs`;
    } else {
      const days = hours / 24;
      return `${days.toFixed(1)} days`;
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary/60" />
        <h3 className="text-lg font-bold tracking-tight">Trade Duration Analysis</h3>
      </div>

      <div className="space-y-3">
        <div className="bg-gradient-to-r from-profit/5 to-transparent border border-profit/15 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-profit" />
              <span className="text-sm font-medium">Winners</span>
            </div>
            <div className="text-profit text-2xl font-bold font-mono-num">{formatHours(stats.avgHoldTimeWinners)}</div>
          </div>
          <div className="text-muted-foreground text-xs">Average hold time for profitable trades</div>
        </div>

        <div className="bg-gradient-to-r from-loss/5 to-transparent border border-loss/15 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-loss" />
              <span className="text-sm font-medium">Losers</span>
            </div>
            <div className="text-loss text-2xl font-bold font-mono-num">{formatHours(stats.avgHoldTimeLosers)}</div>
          </div>
          <div className="text-muted-foreground text-xs">Average hold time for losing trades</div>
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/15 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">All Trades</span>
            </div>
            <div className="text-primary text-2xl font-bold font-mono-num">{formatHours(stats.avgHoldTimeAll)}</div>
          </div>
          <div className="text-muted-foreground text-xs">Overall average hold time</div>
        </div>

        <div className="bg-secondary/50 border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">Optimal Holding Window</span>
          </div>
          <div className="text-gold text-xl font-semibold font-mono-num">{stats.optimalHoldingWindow}</div>
          <div className="text-muted-foreground text-[10px] mt-2">Based on your winning trades pattern</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-secondary/30 border rounded-lg">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
          <div>
            If winners are held longer than losers, you're cutting profits early.
            If losers are held longer, you're holding onto hope. Aim for winners {'>'} losers.
          </div>
        </div>
      </div>
    </div>
  );
};

interface SessionAnalyticsProps {
  sessions: SessionStats[];
}

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ sessions }) => {
  const getSessionIcon = (session: string) => {
    switch (session) {
      case 'Asia': return '🌏';
      case 'London': return '🇬🇧';
      case 'New York': return '🇺🇸';
      case 'London-NY Overlap': return '⚡';
      default: return '🕐';
    }
  };

  const getSessionTime = (session: string) => {
    switch (session) {
      case 'Asia': return '00:00 - 09:00 UTC';
      case 'London': return '08:00 - 17:00 UTC';
      case 'New York': return '13:00 - 22:00 UTC';
      case 'London-NY Overlap': return '13:00 - 17:00 UTC';
      default: return '';
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-crypto" />
        <h3 className="text-lg font-bold tracking-tight">Session & Kill-Zone Analytics</h3>
      </div>
      <p className="text-muted-foreground text-xs mb-4">Performance by trading session (sorted by expectancy)</p>

      <div className="space-y-3">
        {sessions.map((session, index) => (
          <div
            key={session.session}
            className={`border rounded-lg p-4 ${
              index === 0
                ? 'bg-gradient-to-r from-profit/5 to-transparent border-profit/20'
                : 'bg-secondary/30 border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getSessionIcon(session.session)}</span>
                <div>
                  <div className="text-sm font-semibold">{session.session}</div>
                  <div className="text-muted-foreground text-[10px]">{getSessionTime(session.session)}</div>
                </div>
              </div>
              {index === 0 && (
                <div className="px-2.5 py-1 bg-profit/10 border border-profit/20 rounded-md">
                  <span className="text-profit text-[10px] font-semibold">Best Session</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-5 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Trades</div>
                <div className="font-semibold font-mono-num">{session.trades}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wider">P&L</div>
                <div className={`font-semibold font-mono-num ${session.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  ${session.pnl.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Win Rate</div>
                <div className="font-semibold font-mono-num">{session.winRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Expectancy</div>
                <div className={`font-semibold font-mono-num ${session.expectancy >= 0 ? 'text-primary' : 'text-loss'}`}>
                  ${session.expectancy.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wider">Avg Trade</div>
                <div className={`font-semibold font-mono-num ${session.avgProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                  ${session.avgProfit.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${session.expectancy >= 0 ? 'bg-profit' : 'bg-loss'}`}
                style={{
                  width: `${Math.min(100, Math.abs(session.expectancy) * 10)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
            <Globe className="h-4 w-4 text-muted-foreground/40" />
          </div>
          <p className="text-xs text-muted-foreground">No session data available</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-secondary/30 border rounded-lg">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
          <div>
            <strong className="text-foreground">Kill Zones:</strong> London-NY Overlap (13:00-17:00 UTC) typically has highest volatility.
            Focus on your best performing session based on expectancy, not just win rate.
          </div>
        </div>
      </div>
    </div>
  );
};
