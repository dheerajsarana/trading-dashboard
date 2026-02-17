import { Trade } from '../types';
import { Trash2, TrendingUp, TrendingDown, Pencil, Upload, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useAppSelector } from '../store/hooks';
import { formatDateInTimezone } from '../utils/timezone';

interface TradesTableProps {
  trades: Trade[];
  onDeleteTrade?: (tradeId: string) => void;
  isLoading?: boolean;
}

const getSymbolCategory = (symbol: string): { color: string; bg: string; label: string } => {
  const s = symbol.toUpperCase();
  if (s.includes('BTC') || s.includes('ETH') || s.includes('SOL') || s.includes('BNB') || s.includes('XRP')) {
    return { color: 'text-crypto', bg: 'bg-crypto/10', label: 'C' };
  }
  if (s.includes('XAU') || s.includes('XAG') || s.includes('GOLD') || s.includes('SILVER')) {
    return { color: 'text-metal', bg: 'bg-metal/10', label: 'M' };
  }
  return { color: 'text-forex', bg: 'bg-forex/10', label: 'F' };
};

export default function TradesTable({ trades, onDeleteTrade, isLoading }: TradesTableProps) {
  const timezone = useAppSelector((state) => state.trading.timezone);

  const formatDate = (date: Date) => {
    return formatDateInTimezone(date, timezone, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="py-16 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-4">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-5 w-20" />
            <div className="skeleton h-5 w-16" />
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-5 w-12" />
            <div className="skeleton h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No trades found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Entry
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Exit
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Size
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              P&L
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Source
            </th>
            {onDeleteTrade && (
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {trades.map((trade: any, index) => {
            const category = getSymbolCategory(trade.symbol);
            const isProfit = trade.profit > 0;
            const isLoss = trade.profit < 0;

            return (
              <tr key={trade.id || index} className="table-row-hover group">
                <td className="px-4 py-3.5 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(trade.closeTime)}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-md ${category.bg} flex items-center justify-center`}>
                      <span className={`text-[10px] font-bold ${category.color}`}>{category.label}</span>
                    </div>
                    <span className="text-sm font-semibold">{trade.symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                    trade.type === 'buy'
                      ? 'text-profit bg-profit/10'
                      : 'text-loss bg-loss/10'
                  }`}>
                    {trade.type === 'buy' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {trade.type === 'buy' ? 'Long' : 'Short'}
                  </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-sm font-mono-num text-muted-foreground">
                  {formatPrice(trade.openPrice)}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-sm font-mono-num text-muted-foreground">
                  {formatPrice(trade.closePrice)}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-sm font-mono-num text-muted-foreground">
                  {trade.volume.toFixed(2)}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className={`text-sm font-semibold font-mono-num ${
                    isProfit ? 'text-profit' : isLoss ? 'text-loss' : 'text-muted-foreground'
                  }`}>
                    {isProfit && '+'}${trade.profit.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {trade.source === 'manual' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-crypto/10 text-crypto border border-crypto/20">
                      <Pencil className="w-3 h-3" />
                      Manual
                    </span>
                  ) : trade.source === 'mt5' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-profit/10 text-profit border border-profit/20">
                      <Zap className="w-3 h-3" />
                      MT5
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-forex/10 text-forex border border-forex/20">
                      <Upload className="w-3 h-3" />
                      Upload
                    </span>
                  )}
                </td>
                {onDeleteTrade && (
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {trade.source !== 'mt5' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTrade(trade.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-loss hover:bg-loss/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Synced</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
