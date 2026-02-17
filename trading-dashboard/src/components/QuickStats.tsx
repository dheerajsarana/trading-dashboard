import React from 'react';
import { ClipboardList } from 'lucide-react';

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
        <ClipboardList className="w-5 h-5 text-primary/60" />
        <h3 className="text-lg font-bold tracking-tight">Quick Stats</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Avg Winner</div>
            <div className="text-profit text-xl font-semibold font-mono-num">${avgWinner.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Avg Loser</div>
            <div className="text-loss text-xl font-semibold font-mono-num">-${avgLoser.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Best Trade</div>
            <div className="text-profit text-xl font-semibold font-mono-num">${bestTrade.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Worst Trade</div>
            <div className="text-loss text-xl font-semibold font-mono-num">${worstTrade.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Win Streak</div>
            <div className="text-xl font-semibold font-mono-num">{winStreak} <span className="text-xs text-muted-foreground">trades</span></div>
          </div>
          <div>
            <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Loss Streak</div>
            <div className="text-xl font-semibold font-mono-num">{lossStreak} <span className="text-xs text-muted-foreground">trades</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Risk-Reward</div>
            <div className={`text-xl font-semibold font-mono-num ${riskReward >= 1 ? 'text-profit' : 'text-loss'}`}>
              {riskReward.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium mb-1">Open Trades</div>
            <div className="text-xl font-semibold font-mono-num">{openTrades}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
