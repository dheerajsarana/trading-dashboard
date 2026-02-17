import { useEffect } from 'react';
import { Trash2, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBacktestSessions, deleteBacktestSession } from '@/store/backtestSlice';

const SessionHistory = () => {
  const dispatch = useAppDispatch();
  const { sessions } = useAppSelector((state) => state.backtest);

  useEffect(() => {
    dispatch(fetchBacktestSessions());
  }, [dispatch]);

  const completedSessions = sessions.filter(s => s.status === 'completed');

  if (completedSessions.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-bold mb-2">Session History</h2>
        <p className="text-sm text-muted-foreground text-center py-8">
          No completed sessions yet. Start a replay to practice trading!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">Session History</h2>
      <div className="space-y-2">
        {completedSessions.map((session) => {
          const isProfit = (session.totalPnL || 0) >= 0;
          return (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-background rounded-lg border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{session.symbol}</span>
                  <span className="text-xs text-muted-foreground">{session.timeframe}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    isProfit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {isProfit ? <TrendingUp className="h-3 w-3 inline mr-0.5" /> : <TrendingDown className="h-3 w-3 inline mr-0.5" />}
                    {isProfit ? '+' : ''}{(session.totalPnL || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span><Clock className="h-3 w-3 inline mr-0.5" />{new Date(session.completedAt || session.createdAt).toLocaleDateString()}</span>
                  <span>{session.totalTrades || 0} trades</span>
                  <span>WR: {(session.winRate || 0).toFixed(0)}%</span>
                  <span>PF: {(session.profitFactor || 0).toFixed(2)}</span>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                onClick={() => dispatch(deleteBacktestSession(session.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionHistory;
