import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchJournals, fetchJournalStats, fetchJournalByTradeId } from '../../store/journalSlice';
import { fetchTrades } from '../../store/tradingSlice';
import { TradeJournal } from '../../types';
import JournalList from '../JournalList';
import JournalDetail from '../JournalDetail';
import { Button } from '../ui/button';
import { BookOpen, TrendingUp, Star } from 'lucide-react';

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
      // Trade has a journal entry, use it
      return {
        ...existingJournal,
        trade: trade, // Ensure trade data is up to date
      };
    } else {
      // Trade has no journal entry, create a placeholder with "new" status
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
    // Symbol filter
    if (filters.symbol !== 'all' && journal.trade?.symbol !== filters.symbol) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'pending') {
        // "Pending" shows trades that haven't been journaled (status = 'new')
        return journal.status === 'new';
      } else if (filters.status === 'journaled') {
        // "Journaled" shows only completed journal entries
        return journal.status === 'journaled';
      } else {
        // Match the exact status
        return journal.status === filters.status;
      }
    }

    return true;
  });

  const handleSelectJournal = async (journal: TradeJournal) => {
    // Fetch or create the journal for this trade
    if (journal.trade?.id) {
      await dispatch(fetchJournalByTradeId(journal.trade.id));
    }
  };

  const handleSave = () => {
    // Refresh trades, journals, and stats after save
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
            <h1 className="text-3xl font-bold">Trade Journal</h1>
            <p className="text-muted-foreground mt-1">
              {stats ? `${stats.total} total entries` : 'Document your trading journey'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setFilters({ ...filters, status: 'all' })}>
              Live
            </Button>
            <Button variant="outline">
              {filteredJournals.length} entries
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Journaled</p>
                  <p className="text-2xl font-bold">
                    {stats.statusCounts.journaled || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">
                    {stats.averageRating.toFixed(1)}/10
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.statusCounts.new || 0}</p>
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
          >
            All
            <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
              {filteredJournals.length}
            </span>
          </Button>
          <Button
            variant={filters.status === 'journaled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, status: 'journaled' })}
          >
            Journaled
            <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
              {stats?.statusCounts.journaled || 0}
            </span>
          </Button>
          <Button
            variant={filters.status === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, status: 'pending' })}
          >
            Pending
            <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
              {stats?.statusCounts.new || 0}
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100%+11rem)]">
        {/* Left Sidebar - Journal List */}
        <div className="col-span-12 md:col-span-4 bg-card rounded-lg border p-4 overflow-y-auto">
          <JournalList
            journals={filteredJournals}
            selectedJournalId={selectedJournal?.id || null}
            onSelectJournal={handleSelectJournal}
            isLoading={isLoading}
          />
        </div>

        {/* Right Panel - Journal Detail */}
        <div className="col-span-12 md:col-span-8 bg-card rounded-lg border overflow-hidden min-h-0">
          <JournalDetail journal={selectedJournal} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
