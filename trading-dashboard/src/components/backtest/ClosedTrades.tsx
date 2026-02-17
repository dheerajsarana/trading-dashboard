import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';

const ClosedTrades = () => {
  const { closedTrades } = useAppSelector((state) => state.backtest);
  const [isExpanded, setIsExpanded] = useState(true);

  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  return (
    <div className="bg-card border rounded-xl p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Closed Trades ({closedTrades.length})</h3>
          {closedTrades.length > 0 && (
            <span className={`text-sm font-mono font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="mt-3">
          {closedTrades.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No closed trades yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left pb-2 font-medium">Type</th>
                    <th className="text-left pb-2 font-medium">Entry</th>
                    <th className="text-left pb-2 font-medium">Exit</th>
                    <th className="text-left pb-2 font-medium">Vol</th>
                    <th className="text-right pb-2 font-medium">Pips</th>
                    <th className="text-right pb-2 font-medium">P&L</th>
                    <th className="text-left pb-2 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {closedTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border/50">
                      <td className={`py-1.5 font-bold ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.type.toUpperCase()}
                      </td>
                      <td className="py-1.5 font-mono">{trade.entryPrice.toFixed(5)}</td>
                      <td className="py-1.5 font-mono">{trade.exitPrice?.toFixed(5) || '-'}</td>
                      <td className="py-1.5">{trade.volume}</td>
                      <td className={`py-1.5 text-right font-mono ${(trade.pnlPips || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(trade.pnlPips || 0) >= 0 ? '+' : ''}{(trade.pnlPips || 0).toFixed(1)}
                      </td>
                      <td className={`py-1.5 text-right font-mono font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(trade.pnl || 0) >= 0 ? '+' : ''}{(trade.pnl || 0).toFixed(2)}
                      </td>
                      <td className="py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          trade.closeReason === 'take_profit' ? 'bg-green-500/10 text-green-500' :
                          trade.closeReason === 'stop_loss' ? 'bg-red-500/10 text-red-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {trade.closeReason === 'take_profit' ? 'TP' :
                           trade.closeReason === 'stop_loss' ? 'SL' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClosedTrades;
