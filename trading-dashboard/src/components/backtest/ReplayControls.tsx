import { Play, Pause, SkipForward, FastForward, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  advanceCandle,
  setReplayStatus,
  setReplaySpeed,
  computeSummary,
} from '@/store/backtestSlice';
import type { ReplaySpeed } from '@/types';

const speeds: ReplaySpeed[] = [1, 2, 5, 10];

const ReplayControls = () => {
  const dispatch = useAppDispatch();
  const { replayStatus, replaySpeed, visibleCandleCount, allCandles, currentPrice, activeSession } =
    useAppSelector((state) => state.backtest);

  const progress = allCandles.length > 0
    ? ((visibleCandleCount / allCandles.length) * 100).toFixed(1)
    : '0';

  const handlePlay = () => dispatch(setReplayStatus('playing'));
  const handlePause = () => dispatch(setReplayStatus('paused'));
  const handleStep = () => dispatch(advanceCandle());
  const handleStop = () => {
    dispatch(setReplayStatus('finished'));
    dispatch(computeSummary());
  };

  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Playback buttons */}
        <div className="flex items-center gap-2">
          {replayStatus === 'playing' ? (
            <Button size="sm" variant="outline" onClick={handlePause}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handlePlay}
              disabled={replayStatus === 'finished' || visibleCandleCount >= allCandles.length}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-1" /> Play
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleStep}
            disabled={replayStatus === 'playing' || replayStatus === 'finished' || visibleCandleCount >= allCandles.length}
          >
            <SkipForward className="h-4 w-4 mr-1" /> Step
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handleStop}
            disabled={replayStatus === 'finished' || replayStatus === 'idle'}
          >
            <Square className="h-4 w-4 mr-1" /> End
          </Button>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-1">
          <FastForward className="h-4 w-4 text-muted-foreground mr-1" />
          {speeds.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={replaySpeed === s ? 'default' : 'outline'}
              onClick={() => dispatch(setReplaySpeed(s))}
              className="w-12"
            >
              {s}x
            </Button>
          ))}
        </div>

        {/* Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{activeSession?.symbol}</span>
            {' '}{activeSession?.timeframe}
          </div>
          <div className="text-muted-foreground">
            Price: <span className="font-mono font-medium text-foreground">{currentPrice.toFixed(5)}</span>
          </div>
          <div className="text-muted-foreground">
            Candle: <span className="font-medium text-foreground">{visibleCandleCount}</span> / {allCandles.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReplayControls;
