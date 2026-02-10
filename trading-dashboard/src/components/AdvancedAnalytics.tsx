import React from 'react';
import { DrawdownStats, DurationStats, SessionStats } from '../types';

interface DrawdownIntelligenceProps {
  stats: DrawdownStats;
}

export const DrawdownIntelligence: React.FC<DrawdownIntelligenceProps> = ({ stats }) => {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        <h3 className="font-semibold">Drawdown Intelligence</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted border rounded-lg p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Max Drawdown</div>
          <div className="text-red-500 text-2xl font-bold mb-1">${stats.maxDrawdown.toFixed(2)}</div>
          <div className="text-muted-foreground text-sm">{stats.maxDrawdownPercent.toFixed(2)}% of peak</div>
        </div>

        <div className="bg-muted border rounded-lg p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Current Drawdown</div>
          <div className={`text-2xl font-bold mb-1 ${stats.currentDrawdown > 0 ? 'text-red-500' : 'text-green-500'}`}>
            ${stats.currentDrawdown.toFixed(2)}
          </div>
          <div className="text-muted-foreground text-sm">
            {stats.currentDrawdown === 0 ? 'At new peak' : 'In drawdown'}
          </div>
        </div>

        <div className="bg-muted border rounded-lg p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Avg Drawdown</div>
          <div className="text-orange-400 text-xl font-semibold">${stats.avgDrawdown.toFixed(2)}</div>
        </div>

        <div className="bg-muted border rounded-lg p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Recovery Factor</div>
          <div className={`text-xl font-semibold ${stats.recoveryFactor >= 3 ? 'text-green-500' : stats.recoveryFactor >= 2 ? 'text-yellow-500' : 'text-red-500'}`}>
            {stats.recoveryFactor.toFixed(2)}
          </div>
          <div className="text-muted-foreground text-xs mt-1">
            {stats.recoveryFactor >= 3 ? 'Excellent' : stats.recoveryFactor >= 2 ? 'Good' : 'Needs improvement'}
          </div>
        </div>

        <div className="bg-muted border rounded-lg p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Avg Recovery Time</div>
          <div className="text-blue-400 text-xl font-semibold">
            {stats.avgDrawdownDuration.toFixed(1)} days
          </div>
        </div>

        <div className="bg-muted border rounded-lg p-4">
          <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Max Recovery Time</div>
          <div className="text-purple-400 text-xl font-semibold">
            {stats.maxDrawdownDuration.toFixed(1)} days
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted/50 border rounded-lg">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong className="text-foreground">Recovery Factor:</strong> Total Profit ÷ Max Drawdown. 
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
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold">Trade Duration Analysis</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-900/20 to-transparent border border-green-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-foreground font-medium">Winners</span>
            </div>
            <div className="text-green-400 text-2xl font-bold">{formatHours(stats.avgHoldTimeWinners)}</div>
          </div>
          <div className="text-muted-foreground text-sm">Average hold time for profitable trades</div>
        </div>

        <div className="bg-gradient-to-r from-red-900/20 to-transparent border border-red-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-foreground font-medium">Losers</span>
            </div>
            <div className="text-red-400 text-2xl font-bold">{formatHours(stats.avgHoldTimeLosers)}</div>
          </div>
          <div className="text-muted-foreground text-sm">Average hold time for losing trades</div>
        </div>

        <div className="bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-foreground font-medium">All Trades</span>
            </div>
            <div className="text-blue-400 text-2xl font-bold">{formatHours(stats.avgHoldTimeAll)}</div>
          </div>
          <div className="text-muted-foreground text-sm">Overall average hold time</div>
        </div>

        <div className="bg-muted border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-foreground font-medium">Optimal Holding Window</span>
          </div>
          <div className="text-yellow-400 text-xl font-semibold">{stats.optimalHoldingWindow}</div>
          <div className="text-muted-foreground text-xs mt-2">Based on your winning trades pattern</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted/50 border rounded-lg">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            If winners are held longer than losers, you're cutting profits early. 
            If losers are held longer, you're holding onto hope. Aim for winners `${'>'}` losers.
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
      case 'Asia':
        return '🌏';
      case 'London':
        return '🇬🇧';
      case 'New York':
        return '🇺🇸';
      case 'London-NY Overlap':
        return '⚡';
      default:
        return '🕐';
    }
  };

  const getSessionTime = (session: string) => {
    switch (session) {
      case 'Asia':
        return '00:00 - 09:00 UTC';
      case 'London':
        return '08:00 - 17:00 UTC';
      case 'New York':
        return '13:00 - 22:00 UTC';
      case 'London-NY Overlap':
        return '13:00 - 17:00 UTC';
      default:
        return '';
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold">Session & Kill-Zone Analytics</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">Performance by trading session (sorted by expectancy)</p>

      <div className="space-y-3">
        {sessions.map((session, index) => (
          <div
            key={session.session}
            className={`border rounded-lg p-4 ${
              index === 0
                ? 'bg-gradient-to-r from-green-900/20 to-transparent border-green-800/50'
                : 'bg-muted border'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getSessionIcon(session.session)}</span>
                <div>
                  <div className="font-semibold">{session.session}</div>
                  <div className="text-muted-foreground text-xs">{getSessionTime(session.session)}</div>
                </div>
              </div>
              {index === 0 && (
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                  <span className="text-green-400 text-xs font-semibold">⭐ Best Session</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-5 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Trades</div>
                <div className="font-semibold">{session.trades}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">P&L</div>
                <div className={`font-semibold ${session.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${session.pnl.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Win Rate</div>
                <div className="font-semibold">{session.winRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Expectancy</div>
                <div className={`font-semibold ${session.expectancy >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                  ${session.expectancy.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Avg Trade</div>
                <div className={`font-semibold ${session.avgProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${session.avgProfit.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Performance bar */}
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${session.expectancy >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{
                  width: `${Math.min(100, Math.abs(session.expectancy) * 10)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center text-muted-foreground py-8">No session data available</div>
      )}

      <div className="mt-4 p-3 bg-muted/50 border rounded-lg">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong className="text-foreground">Kill Zones:</strong> London-NY Overlap (13:00-17:00 UTC) typically has highest volatility. 
            Focus on your best performing session based on expectancy, not just win rate.
          </div>
        </div>
      </div>
    </div>
  );
};
