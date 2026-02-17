import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchJournals, fetchJournalStats, fetchJournalByTradeId } from '../../store/journalSlice';
import { fetchTrades } from '../../store/tradingSlice';
import { TradeJournal } from '../../types';
import JournalList from '../JournalList';
import JournalDetail from '../JournalDetail';
import { Button } from '../ui/button';
import { BookOpen, TrendingUp, Star, Clock } from 'lucide-react';

export default function JournalPage() {
  const dispatch = useAppDispatch();
  const { allTrades } = useAppSelector((state) => state.trading);
  const { journals, selectedJournal, stats, isLoading } = useAppSelector((state) => state.journal);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'new' | 'journaled' | 'pending',
    symbol: 'all',
    page: 1,
    limit: 50,
  });

  // Fetch trades, journals, and stats on mount
  useEffect(() => {
    dispatch(fetchTrades());
    dispatch(fetchJournals({}));
    dispatch(fetchJournalStats());
  }, [dispatch]);

  // Create a map of existing journals by tradeId
  const journalsByTradeId = new Map(
    journals.map((journal) => [journal.tradeId, journal])
  );

  // Convert trades to journal format, merging with existing journals
  const tradesAsJournals: TradeJournal[] = allTrades.map((trade) => {
    const existingJournal = journalsByTradeId.get(trade.id || '');

    if (existingJournal) {
      return {
        ...existingJournal,
        trade: trade,
      };
    } else {
      return {
        id: trade.id || '',
        tradeId: trade.id || '',
        userId: '',
        trade: trade,
        preTradeAnalysis: undefined,
        postTradeReview: undefined,
        emotions: undefined,
        lessonsLearned: undefined,
        tags: [],
        rating: undefined,
        executionChecklist: undefined,
        screenshots: [],
        status: 'new' as const,
        createdAt: trade.closeTime,
        updatedAt: trade.closeTime,
      };
    }
  });

  // Apply filters
  const filteredJournals = tradesAsJournals.filter((journal) => {
    if (filters.symbol !== 'all' && journal.trade?.symbol !== filters.symbol) {
      return false;
    }

    if (filters.status !== 'all') {
      if (filters.status === 'pending') {
        return journal.status === 'new';
      } else if (filters.status === 'journaled') {
        return journal.status === 'journaled';
      } else {
        return journal.status === filters.status;
      }
    }

    return true;
  });

  const handleSelectJournal = async (journal: TradeJournal) => {
    if (journal.trade?.id) {
      await dispatch(fetchJournalByTradeId(journal.trade.id));
    }
  };

  const handleSave = () => {
    dispatch(fetchTrades());
    dispatch(fetchJournals({}));
    dispatch(fetchJournalStats());
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trade Journal</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {stats ? `${stats.total} total entries` : 'Document your trading journey'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium px-3 py-1.5 bg-muted rounded-lg">
              {filteredJournals.length} entries
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Entries</p>
                  <p className="text-2xl font-bold font-mono-num">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-4 hover:border-profit/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-profit/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-profit" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Journaled</p>
                  <p className="text-2xl font-bold font-mono-num">
                    {stats.statusCounts.journaled || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-4 hover:border-gold/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Avg Rating</p>
                  <p className="text-2xl font-bold font-mono-num">
                    {stats.averageRating.toFixed(1)}/10
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-4 hover:border-crypto/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-crypto/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-crypto" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Pending</p>
                  <p className="text-2xl font-bold font-mono-num">{stats.statusCounts.new || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={filters.status === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, status: 'all' })}
            className="h-8 text-xs"
          >
            All
            <span className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono-num">
              {filteredJournals.length}
            </span>
          </Button>
          <Button
            variant={filters.status === 'journaled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, status: 'journaled' })}
            className="h-8 text-xs"
          >
            Journaled
            <span className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono-num">
              {stats?.statusCounts.journaled || 0}
            </span>
          </Button>
          <Button
            variant={filters.status === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, status: 'pending' })}
            className="h-8 text-xs"
          >
            Pending
            <span className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono-num">
              {stats?.statusCounts.new || 0}
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100%+11rem)]">
        {/* Left Sidebar - Journal List */}
        <div className="col-span-12 md:col-span-4 bg-card rounded-xl border p-4 overflow-y-auto">
          <JournalList
            journals={filteredJournals}
            selectedJournalId={selectedJournal?.id || null}
            onSelectJournal={handleSelectJournal}
            isLoading={isLoading}
          />
        </div>

        {/* Right Panel - Journal Detail */}
        <div className="col-span-12 md:col-span-8 bg-card rounded-xl border overflow-hidden min-h-0">
          <JournalDetail journal={selectedJournal} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
