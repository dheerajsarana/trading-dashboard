import { useState, useEffect } from 'react';
import { Play, Loader2, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBacktestSymbols,
  fetchCandles,
  createBacktestSession,
  setReplayStatus,
} from '@/store/backtestSlice';

const SessionSetup = () => {
  const dispatch = useAppDispatch();
  const { availableSymbols, availableTimeframes, isFetchingCandles, isLoading, error } =
    useAppSelector((state) => state.backtest);

  const [symbol, setSymbol] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1h');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (availableSymbols.length === 0) {
      dispatch(fetchBacktestSymbols());
    }
  }, [dispatch, availableSymbols.length]);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const handleStart = async () => {
    if (!symbol || !timeframe || !startDate || !endDate) return;
    await dispatch(createBacktestSession({ symbol, timeframe, startDate, endDate }));
    await dispatch(fetchCandles({ symbol, timeframe, startDate, endDate }));
    dispatch(setReplayStatus('paused'));
  };

  const isStarting = isFetchingCandles || isLoading;

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Play className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">New Replay Session</h2>
          <p className="text-xs text-muted-foreground">
            Practice trading with historical price data — no risk involved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="input-base"
          >
            {(availableSymbols.length > 0 ? availableSymbols : ['EUR/USD']).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="input-base"
          >
            {(availableTimeframes.length > 0 ? availableTimeframes : ['1h']).map((tf) => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-base"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-base"
          />
        </div>
      </div>

      {error && (
        <p className="text-loss text-sm mt-3">{error}</p>
      )}

      <Button
        onClick={handleStart}
        disabled={isStarting || !startDate || !endDate}
        className="w-full mt-5 h-11"
      >
        {isStarting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading candles...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Start Replay
          </>
        )}
      </Button>

      {/* Feature hints */}
      <div className="mt-6 pt-5 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/60" />
          <span>Step through candles at your own pace — pause, rewind, and adjust speed</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
          <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/60" />
          <span>Open and close positions to simulate real trades. Review your session P&L at the end</span>
        </div>
      </div>
    </div>
  );
};

export default SessionSetup;
