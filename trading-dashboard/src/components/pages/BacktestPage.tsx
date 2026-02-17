import { useAppSelector } from '@/store/hooks';
import { useReplayEngine } from '@/hooks/useReplayEngine';
import SessionSetup from '../backtest/SessionSetup';
import SessionHistory from '../backtest/SessionHistory';
import SessionSummary from '../backtest/SessionSummary';
import ReplayChart from '../backtest/ReplayChart';
import ReplayControls from '../backtest/ReplayControls';
import TradePanel from '../backtest/TradePanel';
import OpenPositions from '../backtest/OpenPositions';
import ClosedTrades from '../backtest/ClosedTrades';

const BacktestPage = () => {
  const { replayStatus, activeSession, allCandles } = useAppSelector(
    (state) => state.backtest
  );

  // Start the replay engine (handles setInterval for candle progression)
  useReplayEngine();

  const isSessionActive = activeSession && allCandles.length > 0 && replayStatus !== 'idle';
  const isFinished = replayStatus === 'finished';

  // Setup screen
  if (!isSessionActive) {
    return (
      <div className="space-y-6">
        <SessionSetup />
        <SessionHistory />
      </div>
    );
  }

  // Finished screen
  if (isFinished) {
    return (
      <div className="space-y-6">
        <SessionSummary />
        <ClosedTrades />
      </div>
    );
  }

  // Active replay screen
  return (
    <div className="space-y-4">
      {/* Chart + Trade Panel */}
      <div className="flex gap-4">
        {/* Chart area - 70% */}
        <div className="flex-1 min-w-0">
          <ReplayChart />
        </div>
        {/* Trade panel - 30% */}
        <div className="w-80 space-y-4 flex-shrink-0">
          <TradePanel />
          <OpenPositions />
        </div>
      </div>

      {/* Controls */}
      <ReplayControls />

      {/* Closed trades */}
      <ClosedTrades />
    </div>
  );
};

export default BacktestPage;
