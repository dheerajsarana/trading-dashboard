import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openPosition } from '@/store/backtestSlice';

const TradePanel = () => {
  const dispatch = useAppDispatch();
  const { currentPrice, replayStatus, activeSession } = useAppSelector((state) => state.backtest);

  const [volume, setVolume] = useState(1.0);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const canTrade = replayStatus === 'playing' || replayStatus === 'paused';

  const handleTrade = (type: 'buy' | 'sell') => {
    dispatch(openPosition({
      type,
      volume,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    }));
    setStopLoss('');
    setTakeProfit('');
  };

  return (
    <div className="bg-card border rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-bold tracking-tight">Place Trade</h3>

      {/* Current Price */}
      <div className="text-center p-3 bg-secondary/50 rounded-lg border">
        <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground mb-1">Current Price</p>
        <p className="text-2xl font-mono-num font-bold">{currentPrice.toFixed(5)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{activeSession?.symbol}</p>
      </div>

      {/* Volume */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Volume (lots)</label>
        <input
          type="number"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value) || 0.01)}
          min="0.01"
          step="0.01"
          className="input-base font-mono-num"
          disabled={!canTrade}
        />
      </div>

      {/* Stop Loss */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Stop Loss (optional)</label>
        <input
          type="number"
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          step="0.00001"
          placeholder="e.g. 1.08500"
          className="input-base font-mono-num"
          disabled={!canTrade}
        />
      </div>

      {/* Take Profit */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Take Profit (optional)</label>
        <input
          type="number"
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
          step="0.00001"
          placeholder="e.g. 1.09500"
          className="input-base font-mono-num"
          disabled={!canTrade}
        />
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleTrade('buy')}
          disabled={!canTrade}
          className="bg-profit hover:bg-profit/90 text-white font-bold py-6"
        >
          <ArrowUpCircle className="h-5 w-5 mr-2" />
          BUY
        </Button>
        <Button
          onClick={() => handleTrade('sell')}
          disabled={!canTrade}
          className="bg-loss hover:bg-loss/90 text-white font-bold py-6"
        >
          <ArrowDownCircle className="h-5 w-5 mr-2" />
          SELL
        </Button>
      </div>
    </div>
  );
};

export default TradePanel;
