import React, { useState } from 'react';
import { DrawdownStats, DurationStats, SessionStats } from '../types';
import { TrendingDown, Globe, Info, Zap, Check, X, BarChart3, Timer, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { useAppSelector } from '../store/hooks';
import { getTimezoneAbbr } from '../utils/timezone';

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

const renderActiveDonutShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 6px ${fill}40)` }}
      />
    </g>
  );
};

export const TradeDurationAnalysis: React.FC<TradeDurationAnalysisProps> = ({ stats }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

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

  const total = stats.avgHoldTimeWinners + stats.avgHoldTimeLosers;
  const winnerPct = total > 0 ? ((stats.avgHoldTimeWinners / total) * 100).toFixed(0) : '0';
  const loserPct = total > 0 ? ((stats.avgHoldTimeLosers / total) * 100).toFixed(0) : '0';

  const donutData = [
    { name: 'Winners', value: stats.avgHoldTimeWinners, formatted: formatHours(stats.avgHoldTimeWinners) },
    { name: 'Losers', value: stats.avgHoldTimeLosers, formatted: formatHours(stats.avgHoldTimeLosers) },
  ];

  const DONUT_COLORS = ['hsl(152, 69%, 41%)', 'hsl(0, 72%, 51%)'];

  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs font-semibold text-foreground">{data.name}</p>
          <p className="text-sm font-mono font-bold" style={{ color: payload[0].payload.fill || payload[0].color }}>
            {data.formatted}
          </p>
        </div>
      );
    }
    return null;
  };

  // Determine hold time relationship insight
  const holdInsight = stats.avgHoldTimeWinners > stats.avgHoldTimeLosers
    ? { text: 'Healthy pattern — letting winners run', color: 'text-profit' }
    : stats.avgHoldTimeWinners < stats.avgHoldTimeLosers
    ? { text: 'Cutting winners early, holding losers too long', color: 'text-loss' }
    : { text: 'Equal hold times for winners and losers', color: 'text-muted-foreground' };

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Timer className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Trade Duration Analysis</h3>
            <p className="text-[11px] text-muted-foreground">Average hold time breakdown</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/60 rounded-md border">
          <Zap className="w-3 h-3 text-gold" />
          <span className="text-[11px] font-semibold font-mono text-gold">{stats.optimalHoldingWindow || 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-full" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                  activeIndex={activeIndex}
                  activeShape={renderActiveDonutShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  {donutData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomDonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">{formatHours(stats.avgHoldTimeAll)}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Hold</span>
            </div>
          </div>

          {/* Legend row */}
          <div className="flex items-center gap-5 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-profit" />
              <span className="text-[11px] text-muted-foreground">Winners <span className="font-mono font-semibold text-foreground">{winnerPct}%</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-loss" />
              <span className="text-[11px] text-muted-foreground">Losers <span className="font-mono font-semibold text-foreground">{loserPct}%</span></span>
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="space-y-3 flex flex-col justify-center">
          <div className="bg-gradient-to-r from-profit/8 to-profit/2 border border-profit/15 rounded-lg p-3.5 transition-all hover:border-profit/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-profit" />
                <span className="text-xs font-medium text-muted-foreground">Winners Avg</span>
              </div>
              <span className="text-lg font-bold font-mono text-profit">{formatHours(stats.avgHoldTimeWinners)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-loss/8 to-loss/2 border border-loss/15 rounded-lg p-3.5 transition-all hover:border-loss/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <X className="w-3.5 h-3.5 text-loss" />
                <span className="text-xs font-medium text-muted-foreground">Losers Avg</span>
              </div>
              <span className="text-lg font-bold font-mono text-loss">{formatHours(stats.avgHoldTimeLosers)}</span>
            </div>
          </div>

          <div className="bg-secondary/40 border rounded-lg p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">All Trades</span>
              </div>
              <span className="text-lg font-bold font-mono text-primary">{formatHours(stats.avgHoldTimeAll)}</span>
            </div>
          </div>

          {/* Insight badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed ${
            holdInsight.color === 'text-profit' ? 'border-profit/25 bg-profit/5' :
            holdInsight.color === 'text-loss' ? 'border-loss/25 bg-loss/5' : 'border-border bg-secondary/30'
          }`}>
            <Target className={`w-3.5 h-3.5 ${holdInsight.color}`} />
            <span className={`text-[11px] font-medium ${holdInsight.color}`}>{holdInsight.text}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 p-3 bg-secondary/30 border rounded-lg">
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

// Session time ranges in UTC (hour, minute)
const SESSION_UTC_RANGES: Record<string, { start: [number, number]; end: [number, number] }> = {
  'Asia':                { start: [1, 0],  end: [7, 0] },
  'Asia-London Overlap': { start: [7, 0],  end: [8, 0] },
  'London':              { start: [8, 0],  end: [12, 0] },
  'London-NY Overlap':   { start: [12, 0], end: [13, 0] },
  'New York':            { start: [13, 0], end: [17, 0] },
};

function formatSessionTime(session: string, timezone: string): string {
  const range = SESSION_UTC_RANGES[session];
  if (!range) return '';

  const fmt = (h: number, m: number) => {
    const d = new Date(Date.UTC(2024, 0, 1, h, m));
    return d.toLocaleString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return `${fmt(range.start[0], range.start[1])}–${fmt(range.end[0], range.end[1])} ${getTimezoneAbbr(timezone)}`;
}

const SESSION_COLORS: Record<string, string> = {
  'Asia': 'hsl(199, 89%, 48%)',
  'Asia-London Overlap': 'hsl(180, 70%, 45%)',
  'London': 'hsl(271, 76%, 53%)',
  'New York': 'hsl(152, 69%, 41%)',
  'London-NY Overlap': 'hsl(45, 93%, 47%)',
};

const SESSION_TW_COLORS: Record<string, string> = {
  'Asia': 'text-[hsl(199,89%,48%)]',
  'Asia-London Overlap': 'text-[hsl(180,70%,45%)]',
  'London': 'text-crypto',
  'New York': 'text-profit',
  'London-NY Overlap': 'text-gold',
};

const SESSION_BG_COLORS: Record<string, string> = {
  'Asia': 'bg-[hsl(199,89%,48%)]/10 border-[hsl(199,89%,48%)]/20',
  'Asia-London Overlap': 'bg-[hsl(180,70%,45%)]/10 border-[hsl(180,70%,45%)]/20',
  'London': 'bg-crypto/10 border-crypto/20',
  'New York': 'bg-profit/10 border-profit/20',
  'London-NY Overlap': 'bg-gold/10 border-gold/20',
};

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ sessions }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const timezone = useAppSelector((state) => state.trading.timezone);

  const getSessionTime = (session: string) => formatSessionTime(session, timezone);

  const getSessionIcon = (session: string) => {
    switch (session) {
      case 'Asia': return '🌏';
      case 'Asia-London Overlap': return '🌐';
      case 'London': return '🇬🇧';
      case 'New York': return '🇺🇸';
      case 'London-NY Overlap': return '⚡';
      default: return '🕐';
    }
  };

  // Pie data for trade distribution
  const pieData = sessions.map(s => ({
    name: s.session,
    value: s.trades,
    pnl: s.pnl,
    winRate: s.winRate,
    expectancy: s.expectancy,
  }));

  // PnL pie data
  const pnlPieData = sessions
    .filter(s => s.pnl !== 0)
    .map(s => ({
      name: s.session,
      value: Math.abs(s.pnl),
      actualPnl: s.pnl,
      isProfit: s.pnl >= 0,
    }));

  const totalTrades = sessions.reduce((sum, s) => sum + s.trades, 0);
  const bestSession = sessions.length > 0 ? sessions[0] : null;

  const CustomSessionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border/60 rounded-lg px-3.5 py-2.5 shadow-xl">
          <p className="text-xs font-semibold text-foreground mb-1">{data.name}</p>
          <div className="space-y-0.5">
            <p className="text-[11px] text-muted-foreground">
              Trades: <span className="font-mono font-semibold text-foreground">{data.value}</span>
            </p>
            {data.winRate !== undefined && (
              <p className="text-[11px] text-muted-foreground">
                Win Rate: <span className="font-mono font-semibold text-foreground">{data.winRate.toFixed(1)}%</span>
              </p>
            )}
            {data.expectancy !== undefined && (
              <p className="text-[11px] text-muted-foreground">
                Expectancy: <span className={`font-mono font-semibold ${data.expectancy >= 0 ? 'text-profit' : 'text-loss'}`}>${data.expectancy.toFixed(2)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPnlTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border/60 rounded-lg px-3.5 py-2.5 shadow-xl">
          <p className="text-xs font-semibold text-foreground mb-1">{data.name}</p>
          <p className={`text-sm font-mono font-bold ${data.actualPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            ${data.actualPnl.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderActiveSessionShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: `drop-shadow(0 0 8px ${fill}50)` }}
        />
      </g>
    );
  };

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-crypto/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-crypto" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Session & Kill-Zone Analytics</h3>
            <p className="text-[11px] text-muted-foreground">Performance by trading session, sorted by expectancy</p>
          </div>
        </div>
        {bestSession && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-profit/10 border border-profit/20 rounded-md">
            <span className="text-sm">{getSessionIcon(bestSession.session)}</span>
            <span className="text-[11px] font-semibold text-profit">{bestSession.session}</span>
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <Globe className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No session data available</p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Trade Distribution Pie */}
            <div className="bg-secondary/20 border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Trade Distribution</h4>
              <div className="relative" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                      activeIndex={activeIndex}
                      activeShape={renderActiveSessionShape}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(undefined)}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={SESSION_COLORS[entry.name] || 'hsl(220, 10%, 46%)'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomSessionTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold font-mono text-foreground">{totalTrades}</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Trades</span>
                </div>
              </div>
              {/* Compact legend */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
                {sessions.map(s => (
                  <div key={s.session} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SESSION_COLORS[s.session] }} />
                    <span className="text-[10px] text-muted-foreground">{s.session}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* P&L Distribution Pie */}
            <div className="bg-secondary/20 border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">P&L by Session</h4>
              <div className="relative" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pnlPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pnlPieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={SESSION_COLORS[entry.name] || 'hsl(220, 10%, 46%)'}
                          opacity={entry.isProfit ? 1 : 0.6}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPnlTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`text-lg font-bold font-mono ${sessions.reduce((s, x) => s + x.pnl, 0) >= 0 ? 'text-profit' : 'text-loss'}`}>
                    ${sessions.reduce((s, x) => s + x.pnl, 0).toFixed(0)}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Total P&L</span>
                </div>
              </div>
              {/* P&L legend */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
                {sessions.map(s => (
                  <div key={s.session} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SESSION_COLORS[s.session], opacity: s.pnl >= 0 ? 1 : 0.6 }} />
                    <span className={`text-[10px] font-mono ${s.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>${s.pnl.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Session Detail Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sessions.map((session, index) => {
              const twColor = SESSION_TW_COLORS[session.session] || 'text-muted-foreground';
              const bgColor = SESSION_BG_COLORS[session.session] || 'bg-secondary/30 border-border';

              return (
                <div
                  key={session.session}
                  className={`relative border rounded-lg p-4 transition-all hover:shadow-md ${
                    index === 0
                      ? 'bg-gradient-to-br from-profit/5 via-transparent to-transparent border-profit/20 ring-1 ring-profit/10'
                      : 'bg-secondary/20 border-border hover:border-border/80'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{getSessionIcon(session.session)}</span>
                      <div>
                        <div className="text-sm font-semibold">{session.session}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{getSessionTime(session.session)}</div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="px-2 py-0.5 bg-profit/10 border border-profit/20 rounded-full">
                        <span className="text-profit text-[9px] font-bold uppercase tracking-wider">Best</span>
                      </div>
                    )}
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`rounded-md p-2 border ${bgColor}`}>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Trades</div>
                      <div className={`text-sm font-bold font-mono ${twColor}`}>{session.trades}</div>
                    </div>
                    <div className={`rounded-md p-2 border ${bgColor}`}>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Win Rate</div>
                      <div className={`text-sm font-bold font-mono ${session.winRate >= 50 ? 'text-profit' : 'text-loss'}`}>{session.winRate.toFixed(0)}%</div>
                    </div>
                    <div className={`rounded-md p-2 border ${bgColor}`}>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">P&L</div>
                      <div className={`text-sm font-bold font-mono ${session.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>${session.pnl.toFixed(0)}</div>
                    </div>
                  </div>

                  {/* Expectancy bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider w-16">Expectancy</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${session.expectancy >= 0 ? 'bg-profit' : 'bg-loss'}`}
                        style={{ width: `${Math.min(100, Math.abs(session.expectancy) * 10)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono font-semibold ${session.expectancy >= 0 ? 'text-profit' : 'text-loss'}`}>
                      ${session.expectancy.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-5 p-3 bg-secondary/30 border rounded-lg">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
          <div>
            <strong className="text-foreground">Kill Zones:</strong> London-NY Overlap ({formatSessionTime('London-NY Overlap', timezone)}) typically has highest volatility.
            Focus on your best performing session based on expectancy, not just win rate.
          </div>
        </div>
      </div>
    </div>
  );
};
