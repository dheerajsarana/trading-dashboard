import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { advanceCandle } from '@/store/backtestSlice';

/**
 * Hook that manages the setInterval-based candle progression for the FX Replay
 * backtesting feature. Dispatches `advanceCandle()` at a rate determined by
 * `replaySpeed` while `replayStatus` is 'playing'.
 *
 * The interval is automatically cleaned up on unmount or whenever the replay
 * status or speed changes. When all candles have been revealed, the
 * `advanceCandle` reducer in the slice is responsible for setting the status
 * to 'finished'.
 */
export function useReplayEngine() {
  const dispatch = useAppDispatch();

  const replayStatus = useAppSelector((state) => state.backtest.replayStatus);
  const replaySpeed = useAppSelector((state) => state.backtest.replaySpeed);
  const visibleCandleCount = useAppSelector((state) => state.backtest.visibleCandleCount);
  const allCandles = useAppSelector((state) => state.backtest.allCandles);

  useEffect(() => {
    if (replayStatus !== 'playing') {
      return;
    }

    const intervalMs = 1000 / replaySpeed;

    const intervalId = setInterval(() => {
      dispatch(advanceCandle());
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [replayStatus, replaySpeed, dispatch]);

  return {
    replayStatus,
    replaySpeed,
    visibleCandleCount,
    totalCandles: allCandles.length,
  };
}
