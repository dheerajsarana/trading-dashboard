import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closePosition } from '@/store/backtestSlice';

const OpenPositions = () => {
  const dispatch = useAppDispatch();
  const { openPositions, currentPrice, activeSession } = useAppSelector((state) => state.backtest);

  const getPipMultiplier = (entryPrice: number) => {
    if (entryPrice > 50) return 100; // Gold, indices
    return activeSession?.symbol.includes('JPY') ? 100 : 10000;
  };

  const calcUnrealizedPnl = (trade: typeof openPositions[0]) => {
    const pipMultiplier = getPipMultiplier(trade.entryPrice);
    const priceDiff = trade.type === 'buy'
      ? (currentPrice - trade.entryPrice)
      : (trade.entryPrice - currentPrice);
    const pnlPips = priceDiff * pipMultiplier;
    const pnl = pnlPips * trade.volume * 10;
    return { pnl, pnlPips };
  };

  if (openPositions.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-2">Open Positions</h3>
        <p className="text-xs text-muted-foreground text-center py-4">No open positions</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-4">
      <h3 className="font-semibold text-sm mb-3">
        Open Positions ({openPositions.length})
      </h3>
      <div className="space-y-2">
        {openPositions.map((pos) => {
          const { pnl, pnlPips } = calcUnrealizedPnl(pos);
          const isProfit = pnl >= 0;
          return (
            <div
              key={pos.id}
              className="flex items-center justify-between p-2 bg-background rounded-lg border text-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${pos.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {pos.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">{pos.volume} lot</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Entry: {pos.entryPrice.toFixed(5)}
                  {pos.stopLoss && <span> | SL: {pos.stopLoss.toFixed(5)}</span>}
                  {pos.takeProfit && <span> | TP: {pos.takeProfit.toFixed(5)}</span>}
                </div>
              </div>
              <div className="text-right mr-2">
                <p className={`font-mono font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                  {isProfit ? '+' : ''}{pnl.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {isProfit ? '+' : ''}{pnlPips.toFixed(1)} pips
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                onClick={() => dispatch(closePosition(pos.id))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpenPositions;
