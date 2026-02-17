import { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
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

  // Set default dates (1 month ago to today)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const handleStart = async () => {
    if (!symbol || !timeframe || !startDate || !endDate) return;

    // Create session first, then fetch candles
    await dispatch(createBacktestSession({ symbol, timeframe, startDate, endDate }));
    await dispatch(fetchCandles({ symbol, timeframe, startDate, endDate }));
    dispatch(setReplayStatus('paused'));
  };

  const isStarting = isFetchingCandles || isLoading;

  return (
    <div className="bg-card border rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">New Replay Session</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Symbol */}
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
          >
            {(availableSymbols.length > 0 ? availableSymbols : ['EUR/USD']).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Timeframe */}
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
          >
            {(availableTimeframes.length > 0 ? availableTimeframes : ['1h']).map((tf) => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="text-sm text-muted-foreground block mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-3">{error}</p>
      )}

      <Button
        onClick={handleStart}
        disabled={isStarting || !startDate || !endDate}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
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
    </div>
  );
};

export default SessionSetup;
