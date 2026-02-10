import React from 'react';

interface QuickStatsProps {
  avgWinner: number;
  avgLoser: number;
  bestTrade: number;
  worstTrade: number;
  winStreak: number;
  lossStreak: number;
  riskReward: number;
  openTrades: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  avgWinner,
  avgLoser,
  bestTrade,
  worstTrade,
  winStreak,
  lossStreak,
  riskReward,
  openTrades,
}) => {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="font-semibold">Quick Stats</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">AVG WINNER</div>
            <div className="text-blue-500 text-xl font-semibold">${avgWinner.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">AVG LOSER</div>
            <div className="text-red-500 text-xl font-semibold">-${avgLoser.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">BEST TRADE</div>
            <div className="text-blue-500 text-xl font-semibold">${bestTrade.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">WORST TRADE</div>
            <div className="text-red-500 text-xl font-semibold">${worstTrade.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">WIN STREAK</div>
            <div className="text-xl font-semibold">{winStreak} trades</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">LOSS STREAK</div>
            <div className="text-xl font-semibold">{lossStreak} trades</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">RISK-REWARD</div>
            <div className={`text-xl font-semibold ${riskReward >= 1 ? 'text-green-500' : 'text-red-500'}`}>
              {riskReward.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">OPEN TRADES</div>
            <div className="text-xl font-semibold">{openTrades}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
