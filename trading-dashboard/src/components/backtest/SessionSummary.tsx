import { Trophy, TrendingUp, TrendingDown, Target, BarChart3, RefreshCw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetSession, saveSessionResults, computeSummary } from '@/store/backtestSlice';
import { useEffect, useState } from 'react';

const SessionSummary = () => {
  const dispatch = useAppDispatch();
  const { summary, activeSession, closedTrades } = useAppSelector((state) => state.backtest);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dispatch(computeSummary());
  }, [dispatch]);

  const handleSave = async () => {
    if (!activeSession || !summary) return;
    setIsSaving(true);
    await dispatch(saveSessionResults({ sessionId: activeSession.id, summary }));
    setIsSaving(false);
    setSaved(true);
  };

  const handleNewSession = () => {
    dispatch(resetSession());
  };

  if (!summary) {
    return (
      <div className="bg-card border rounded-xl p-6 text-center">
        <p className="text-muted-foreground">No trades were made during this session.</p>
        <Button onClick={handleNewSession} className="mt-4" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> New Session
        </Button>
      </div>
    );
  }

  const stats = [
    { label: 'Total P&L', value: `${summary.totalPnL >= 0 ? '+' : ''}$${summary.totalPnL.toFixed(2)}`, color: summary.totalPnL >= 0 ? 'text-green-500' : 'text-red-500', icon: TrendingUp },
    { label: 'Win Rate', value: `${summary.winRate.toFixed(1)}%`, color: summary.winRate >= 50 ? 'text-green-500' : 'text-red-500', icon: Target },
    { label: 'Profit Factor', value: summary.profitFactor === Infinity ? '∞' : summary.profitFactor.toFixed(2), color: summary.profitFactor >= 1 ? 'text-green-500' : 'text-red-500', icon: BarChart3 },
    { label: 'Total Trades', value: summary.totalTrades.toString(), color: 'text-foreground', icon: Trophy },
    { label: 'Wins / Losses', value: `${summary.wins} / ${summary.losses}`, color: 'text-foreground', icon: TrendingUp },
    { label: 'Max Drawdown', value: `$${summary.maxDrawdown.toFixed(2)}`, color: 'text-red-500', icon: TrendingDown },
    { label: 'Avg Win', value: `+$${summary.avgWin.toFixed(2)}`, color: 'text-green-500', icon: TrendingUp },
    { label: 'Avg Loss', value: `-$${summary.avgLoss.toFixed(2)}`, color: 'text-red-500', icon: TrendingDown },
    { label: 'Best Trade', value: `+$${summary.bestTrade.toFixed(2)}`, color: 'text-green-500', icon: TrendingUp },
    { label: 'Worst Trade', value: `$${summary.worstTrade.toFixed(2)}`, color: 'text-red-500', icon: TrendingDown },
  ];

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Session Complete</h2>
          <p className="text-sm text-muted-foreground">
            {activeSession?.symbol} | {activeSession?.timeframe} | {closedTrades.length} trades
          </p>
        </div>
        <div className={`text-3xl font-bold font-mono ${summary.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {summary.totalPnL >= 0 ? '+' : ''}${summary.totalPnL.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-background rounded-lg p-3 border">
            <div className="flex items-center gap-1 mb-1">
              <Icon className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving || saved}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Save className="h-4 w-4 mr-2" /> Saved</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Save Results</>
          )}
        </Button>
        <Button onClick={handleNewSession} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> New Session
        </Button>
      </div>
    </div>
  );
};

export default SessionSummary;
