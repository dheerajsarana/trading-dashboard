import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTradesWithFilters, deleteTrade, deleteAllTrades } from '../../store/tradingSlice';
import { fetchMT5Accounts, syncMT5Account, deleteMT5Account, setConnectModalOpen } from '../../store/mt5Slice';
import { TradeFiltersState } from '../../types';
import TradesTable from '../TradesTable';
import TradeFilters from '../TradeFilters';
import AddTradeModal from '../AddTradeModal';
import MT5ConnectModal from '../mt5/MT5ConnectModal';
import { Button } from '../ui/button';
import { Plus, Trash2, ChevronLeft, ChevronRight, RefreshCw, Link, X } from 'lucide-react';

export default function TradesPage() {
  const dispatch = useAppDispatch();
  const { allTrades, isLoading, pagination } = useAppSelector((state) => state.trading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<TradeFiltersState>({
    symbol: 'all',
    type: 'all',
    source: 'all',
    dateRange: { start: null, end: null },
    page: 1,
    limit: 50,
  });

  const { accounts, selectedAccountId, isSyncing } = useAppSelector((state) => state.mt5);

  // Fetch MT5 accounts on mount
  useEffect(() => {
    dispatch(fetchMT5Accounts());
  }, [dispatch]);

  const handleConnectAccount = () => {
    dispatch(setConnectModalOpen(true));
  };

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

  const handleSync = async () => {
    if (selectedAccountId) {
      await dispatch(syncMT5Account(selectedAccountId));
      // Re-fetch trades after sync to include new MT5 data
      fetchTrades();
    }
  };

  const handleDeleteAccount = async (accountId: string, accountNumber: number) => {
    if (window.confirm(`Are you sure you want to disconnect MT5 account #${accountNumber}? This will remove all synced trades from this account.`)) {
      try {
        await dispatch(deleteMT5Account(accountId)).unwrap();
        fetchTrades();
      } catch (error) {
        console.error('Failed to delete MT5 account:', error);
        alert('Failed to disconnect account. Please try again.');
      }
    }
  };

  const handleFilterChange = async (newFilters: TradeFiltersState) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filters change

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
    if (window.confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
      try {
        await dispatch(deleteTrade(tradeId)).unwrap();
        await fetchTrades(); // Refresh trades after deletion
      } catch (error) {
        console.error('Failed to delete trade:', error);
        alert('Failed to delete trade. Please try again.');
      }
    }
  };

  const handleDeleteAllTrades = async () => {
    const confirmMessage = `Are you sure you want to delete ALL ${pagination?.total || 0} trades? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      const doubleConfirm = window.confirm('This will permanently delete all your trades. Are you absolutely sure?');
      if (doubleConfirm) {
        try {
          await dispatch(deleteAllTrades()).unwrap();
          await fetchTrades();
        } catch (error) {
          console.error('Failed to delete all trades:', error);
          alert('Failed to delete all trades. Please try again.');
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
    await fetchTrades(); // Refresh trades after adding new trade
  };

  return (
    <div className="space-y-6">
      {/* MT5 Account Management */}
      {/* <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Link className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">MT5 Integration</h3>
              <p className="text-sm text-muted-foreground">
                {accounts.length > 0
                  ? `${accounts.length} account${accounts.length > 1 ? 's' : ''} connected`
                  : 'Connect your MT5 account to sync trades automatically'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {accounts.length > 0 && selectedAccountId && (
              <Button
                onClick={handleSync}
                variant="outline"
                size="sm"
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
            )}
            <Button onClick={handleConnectAccount} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
          </div>
        </div>

        {accounts.length > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${account.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <span className="text-sm font-medium">#{account.accountNumber}</span>
                    <span className="text-sm text-muted-foreground ml-2">{account.server}</span>
                    {account.isPrimary && (
                      <span className="ml-2 text-xs bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">Primary</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAccount(account.id, account.accountNumber)}
                  className="text-muted-foreground hover:text-red-500 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div> */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trades</h1>
          <p className="text-muted-foreground mt-1">
            {pagination ? `${pagination.total} total trades` : 'Manage your trading history'}
          </p>
        </div>
        <div className="flex gap-3">
          {allTrades.length > 0 && (
            <Button
              variant="outline"
              onClick={handleDeleteAllTrades}
              className="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          )}
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TradeFilters
        availableSymbols={availableSymbols}
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Trades Table */}
      <div className="bg-card rounded-lg border">
        <TradesTable
          trades={allTrades}
          onDeleteTrade={handleDeleteTrade}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} trades
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
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
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className="w-10"
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
              >
                Next
                <ChevronRight className="h-4 w-4" />
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
    </div>
  );
}
