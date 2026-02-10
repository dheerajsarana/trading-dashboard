import { Trade } from '../types';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface TradesTableProps {
  trades: Trade[];
  onDeleteTrade?: (tradeId: string) => void;
  isLoading?: boolean;
}

export default function TradesTable({ trades, onDeleteTrade, isLoading }: TradesTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getTypeColor = (type: string) => {
    return type === 'buy' ? 'text-blue-400' : 'text-orange-400';
  };

  const getPnLColor = (profit: number) => {
    if (profit > 0) return 'text-green-500';
    if (profit < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const getSourceBadge = (source: string) => {
    if (source === 'manual') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Manual
        </span>
      );
    }
    if (source === 'mt5') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          MT5
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No trades found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Entry
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Exit
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              P&L
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Source
            </th>
            {onDeleteTrade && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {trades.map((trade: any, index) => (
            <tr key={trade.id || index} className="hover:bg-gray-900/50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatDate(trade.closeTime)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-yellow-500 text-xs">$</span>
                  </div>
                  <span className="text-sm font-medium text-white">{trade.symbol}</span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${getTypeColor(trade.type)}`}>
                  {trade.type === 'buy' ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Long
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                      Short
                    </>
                  )}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatPrice(trade.openPrice)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatPrice(trade.closePrice)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                {trade.volume.toFixed(2)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`text-sm font-semibold ${getPnLColor(trade.profit)}`}>
                  {trade.profit > 0 && '+'}${trade.profit.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {getSourceBadge(trade.source || 'upload')}
              </td>
              {onDeleteTrade && (
                <td className="px-4 py-4 whitespace-nowrap">
                  {trade.source !== 'mt5' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTrade(trade.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Synced</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
