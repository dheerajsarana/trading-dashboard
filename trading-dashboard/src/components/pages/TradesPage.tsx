import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTradesWithFilters, deleteTrade, deleteAllTrades, setTimezone } from '../../store/tradingSlice';
import { TIMEZONE_OPTIONS } from '../../utils/timezone';
import { fetchMT5Accounts } from '../../store/mt5Slice';
import { TradeFiltersState } from '../../types';
import TradesTable from '../TradesTable';
import TradeFilters from '../TradeFilters';
import AddTradeModal from '../AddTradeModal';
import MT5ConnectModal from '../mt5/MT5ConnectModal';
import { Button } from '../ui/button';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

export default function TradesPage() {
  const dispatch = useAppDispatch();
  const { allTrades, isLoading, pagination, timezone } = useAppSelector((state) => state.trading);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<TradeFiltersState>({
    symbol: 'all',
    type: 'all',
    source: 'all',
    dateRange: { start: null, end: null },
    page: 1,
    limit: 50,
  });

  // Fetch MT5 accounts on mount
  useEffect(() => {
    dispatch(fetchMT5Accounts());
  }, [dispatch]);

  // Extract unique symbols from all trades
  const availableSymbols = useMemo(() => {
    const symbols = new Set(allTrades.map(trade => trade.symbol));
    return Array.from(symbols).sort();
  }, [allTrades]);

  // Fetch trades function
  const fetchTrades = useCallback(async () => {
    const params: any = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.symbol !== 'all') params.symbol = filters.symbol;
    if (filters.type !== 'all') params.type = filters.type;
    if (filters.source !== 'all') params.source = filters.source;
    if (filters.dateRange.start) params.startDate = filters.dateRange.start.toISOString();
    if (filters.dateRange.end) params.endDate = filters.dateRange.end.toISOString();

    await dispatch(fetchTradesWithFilters(params));
  }, [dispatch, filters]);

  // Fetch trades on mount
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const handleFilterChange = async (newFilters: TradeFiltersState) => {
    setFilters({ ...newFilters, page: 1 });

    const params: any = {
      page: 1,
      limit: newFilters.limit,
    };

    if (newFilters.symbol !== 'all') params.symbol = newFilters.symbol;
    if (newFilters.type !== 'all') params.type = newFilters.type;
    if (newFilters.source !== 'all') params.source = newFilters.source;
    if (newFilters.dateRange.start) params.startDate = newFilters.dateRange.start.toISOString();
    if (newFilters.dateRange.end) params.endDate = newFilters.dateRange.end.toISOString();

    await dispatch(fetchTradesWithFilters(params));
  };

  const handleDeleteTrade = async (tradeId: string) => {
    const confirmed = await confirm({
      title: 'Delete Trade',
      description: 'Are you sure you want to delete this trade? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        await dispatch(deleteTrade(tradeId)).unwrap();
        await fetchTrades();
        toast({
          title: 'Trade deleted',
          description: 'The trade has been successfully deleted.',
          variant: 'success',
        });
      } catch (error) {
        console.error('Failed to delete trade:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete trade. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteAllTrades = async () => {
    const confirmed = await confirm({
      title: 'Delete All Trades',
      description: `Are you sure you want to delete ALL ${pagination?.total || 0} trades? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      const doubleConfirmed = await confirm({
        title: 'Final Confirmation',
        description: 'This will permanently delete all your trades. Are you absolutely sure?',
        confirmText: 'Yes, Delete Everything',
        cancelText: 'Cancel',
        variant: 'destructive',
      });

      if (doubleConfirmed) {
        try {
          await dispatch(deleteAllTrades()).unwrap();
          await fetchTrades();
          toast({
            title: 'All trades deleted',
            description: 'All trades have been successfully deleted.',
            variant: 'success',
          });
        } catch (error) {
          console.error('Failed to delete all trades:', error);
          toast({
            title: 'Error',
            description: 'Failed to delete all trades. Please try again.',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const handlePageChange = async (newPage: number) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);

    const params: any = {
      page: newPage,
      limit: filters.limit,
    };

    if (filters.symbol !== 'all') params.symbol = filters.symbol;
    if (filters.type !== 'all') params.type = filters.type;
    if (filters.source !== 'all') params.source = filters.source;
    if (filters.dateRange.start) params.startDate = filters.dateRange.start.toISOString();
    if (filters.dateRange.end) params.endDate = filters.dateRange.end.toISOString();

    await dispatch(fetchTradesWithFilters(params));
  };

  const handleModalSuccess = async () => {
    await fetchTrades();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trades</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination ? `${pagination.total} total trades` : 'Manage your trading history'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Trade
          </Button>
          {allTrades.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAllTrades}
              className="text-loss/70 hover:text-loss border-loss/20 hover:border-loss/40 hover:bg-loss/5"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Timezone */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Timezone:</span>
        <select
          value={timezone}
          onChange={(e) => dispatch(setTimezone(e.target.value))}
          className="input-base w-auto"
        >
          {TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Filters */}
      <TradeFilters
        availableSymbols={availableSymbols}
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Trades Table */}
      <div className="bg-card rounded-xl border">
        <TradesTable
          trades={allTrades}
          onDeleteTrade={handleDeleteTrade}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3.5 border-t flex items-center justify-between">
            <div className="text-xs text-muted-foreground font-mono-num">
              {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0 text-xs font-mono-num"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || isLoading}
                className="h-8 px-2"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Trade Modal */}
      <AddTradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* MT5 Connect Modal */}
      <MT5ConnectModal />

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  );
}
