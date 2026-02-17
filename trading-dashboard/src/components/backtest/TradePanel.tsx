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
    // Reset SL/TP after placing trade
    setStopLoss('');
    setTakeProfit('');
  };

  return (
    <div className="bg-card border rounded-xl p-4 space-y-4">
      <h3 className="font-semibold text-sm">Place Trade</h3>

      {/* Current Price */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">Current Price</p>
        <p className="text-2xl font-mono font-bold">{currentPrice.toFixed(5)}</p>
        <p className="text-xs text-muted-foreground">{activeSession?.symbol}</p>
      </div>

      {/* Volume */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Volume (lots)</label>
        <input
          type="number"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value) || 0.01)}
          min="0.01"
          step="0.01"
          className="w-full px-3 py-2 bg-background border rounded-lg text-sm font-mono"
          disabled={!canTrade}
        />
      </div>

      {/* Stop Loss */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Stop Loss (optional)</label>
        <input
          type="number"
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          step="0.00001"
          placeholder="e.g. 1.08500"
          className="w-full px-3 py-2 bg-background border rounded-lg text-sm font-mono"
          disabled={!canTrade}
        />
      </div>

      {/* Take Profit */}
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Take Profit (optional)</label>
        <input
          type="number"
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
          step="0.00001"
          placeholder="e.g. 1.09500"
          className="w-full px-3 py-2 bg-background border rounded-lg text-sm font-mono"
          disabled={!canTrade}
        />
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleTrade('buy')}
          disabled={!canTrade}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-6"
        >
          <ArrowUpCircle className="h-5 w-5 mr-2" />
          BUY
        </Button>
        <Button
          onClick={() => handleTrade('sell')}
          disabled={!canTrade}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-6"
        >
          <ArrowDownCircle className="h-5 w-5 mr-2" />
          SELL
        </Button>
      </div>
    </div>
  );
};

export default TradePanel;
