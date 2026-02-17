import { TradeJournal } from '../types';
import { cn } from '../lib/utils';

interface JournalListProps {
  journals: TradeJournal[];
  selectedJournalId: string | null;
  onSelectJournal: (journal: TradeJournal) => void;
  isLoading: boolean;
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

export default function JournalList({ journals, selectedJournalId, onSelectJournal, isLoading }: JournalListProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'NEW', className: 'bg-primary/10 text-primary border-primary/20' },
      journaled: { label: 'DONE', className: 'bg-profit/10 text-profit border-profit/20' },
      pending: { label: 'PENDING', className: 'bg-gold/10 text-gold border-gold/20' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

    return (
      <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-md border', config.className)}>
        {config.label}
      </span>
    );
  };

  const getTypeColor = (type: string) => {
    return type === 'buy' ? 'text-profit' : 'text-loss';
  };

  const getPnLColor = (profit: number) => {
    if (profit > 0) return 'text-profit';
    if (profit < 0) return 'text-loss';
    return 'text-muted-foreground';
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border">
            <div className="flex items-center gap-3 mb-3">
              <div className="skeleton w-8 h-8 rounded-md" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-14 ml-auto" />
            </div>
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (journals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <span className="text-muted-foreground text-lg">📓</span>
        </div>
        <p className="text-sm text-muted-foreground">No journal entries found</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Start by adding a trade</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {journals.map((journal) => {
        const trade = journal.trade;
        if (!trade) return null;

        const isSelected = journal.id === selectedJournalId;
        const category = getSymbolCategory(trade.symbol);

        return (
          <button
            key={journal.id}
            onClick={() => onSelectJournal(journal)}
            className={cn(
              'w-full text-left p-4 rounded-lg border transition-all duration-200',
              isSelected
                ? 'bg-primary/5 border-primary/30'
                : 'bg-background border-border hover:bg-muted/50 hover:border-border/80'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-md ${category.bg} flex items-center justify-center`}>
                  <span className={`text-[10px] font-bold ${category.color}`}>{category.label}</span>
                </div>
                <span className="text-sm font-semibold">{trade.symbol}</span>
              </div>
              {getStatusBadge(journal.status)}
            </div>

            {/* Trade Details */}
            <div className="flex items-center justify-between">
              <div>
                <span className={cn('text-xs font-medium capitalize', getTypeColor(trade.type))}>
                  {trade.type === 'buy' ? 'Long' : 'Short'}
                </span>
                <span className="text-muted-foreground text-xs ml-2 font-mono-num">
                  ${trade.openPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <div className={cn('text-sm font-semibold font-mono-num', getPnLColor(trade.profit))}>
                  {trade.profit > 0 && '+'}${trade.profit.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-mono-num">Size {trade.volume.toFixed(2)}</span>
              <span>{formatDate(trade.closeTime)}</span>
            </div>

            {/* Journal Preview */}
            {journal.status === 'journaled' && (journal.preTradeAnalysis || journal.postTradeReview) && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  {journal.rating && (
                    <span className="font-mono-num text-gold">★ {journal.rating}/10</span>
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
