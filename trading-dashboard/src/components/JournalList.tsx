import { TradeJournal } from '../types';
import { cn } from '../lib/utils';

interface JournalListProps {
  journals: TradeJournal[];
  selectedJournalId: string | null;
  onSelectJournal: (journal: TradeJournal) => void;
  isLoading: boolean;
}

export default function JournalList({ journals, selectedJournalId, onSelectJournal, isLoading }: JournalListProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'NEW', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      journaled: { label: 'JOURNALED', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      pending: { label: 'PENDING', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

    return (
      <span className={cn('px-2 py-0.5 text-xs font-medium rounded border', config.className)}>
        {config.label}
      </span>
    );
  };

  const getTypeColor = (type: string) => {
    return type === 'buy' ? 'text-blue-400' : 'text-orange-400';
  };

  const getPnLColor = (profit: number) => {
    if (profit > 0) return 'text-green-500';
    if (profit < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (journals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No journal entries found</p>
        <p className="text-sm mt-2">Start by adding a trade</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {journals.map((journal) => {
        const trade = journal.trade;
        if (!trade) return null;

        const isSelected = journal.id === selectedJournalId;
        const isProfitable = trade.profit > 0;

        return (
          <button
            key={journal.id}
            onClick={() => onSelectJournal(journal)}
            className={cn(
              'w-full text-left p-4 rounded-lg border transition-all',
              isSelected
                ? 'bg-muted border-primary'
                : 'bg-background border hover:bg-muted/50'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-yellow-500 text-sm font-bold">$</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{trade.symbol}</span>
                    {isProfitable && getStatusBadge('journaled')}
                  </div>
                </div>
              </div>
              {getStatusBadge(journal.status)}
            </div>

            {/* Trade Details */}
            <div className="flex items-center justify-between">
              <div>
                <span className={cn('font-medium capitalize', getTypeColor(trade.type))}>
                  {trade.type === 'buy' ? 'Long' : 'Short'}
                </span>
                <span className="text-muted-foreground text-sm ml-2">
                  Entry ${trade.openPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <div className={cn('font-semibold text-lg', getPnLColor(trade.profit))}>
                  {trade.profit > 0 && '+'}${trade.profit.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Size {trade.volume.toFixed(2)}</span>
              <span>{formatDate(trade.closeTime)}</span>
            </div>

            {/* Journal Preview */}
            {journal.status === 'journaled' && (journal.preTradeAnalysis || journal.postTradeReview) && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {journal.rating && (
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span>{journal.rating}/10</span>
                    </div>
                  )}
                  {journal.tags && journal.tags.length > 0 && (
                    <span className="truncate">
                      {journal.tags.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
