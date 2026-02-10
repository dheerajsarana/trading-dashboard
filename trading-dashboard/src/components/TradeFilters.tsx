import { useState, useEffect } from 'react';
import { TradeFiltersState } from '../types';
import { Button } from './ui/button';
import { Filter, X } from 'lucide-react';

interface TradeFiltersProps {
  availableSymbols: string[];
  onFilterChange: (filters: TradeFiltersState) => void;
  initialFilters?: Partial<TradeFiltersState>;
}

export default function TradeFilters({ availableSymbols, onFilterChange, initialFilters }: TradeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<TradeFiltersState>({
    symbol: initialFilters?.symbol || 'all',
    type: initialFilters?.type || 'all',
    source: initialFilters?.source || 'all',
    dateRange: initialFilters?.dateRange || { start: null, end: null },
    page: initialFilters?.page || 1,
    limit: initialFilters?.limit || 50,
  });

  const [tempFilters, setTempFilters] = useState<TradeFiltersState>(filters);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    onFilterChange(tempFilters);
    setIsExpanded(false);
  };

  const handleResetFilters = () => {
    const resetFilters: TradeFiltersState = {
      symbol: 'all',
      type: 'all',
      source: 'all',
      dateRange: { start: null, end: null },
      page: 1,
      limit: 50,
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = filters.symbol !== 'all' || filters.type !== 'all' || filters.source !== 'all' || filters.dateRange.start || filters.dateRange.end;

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setTempFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value ? new Date(value) : null,
      },
    }));
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-800">
          {/* Row 1: Symbol and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="symbol-filter" className="text-sm font-medium text-gray-300">
                Symbol
              </label>
              <select
                id="symbol-filter"
                value={tempFilters.symbol}
                onChange={(e) => setTempFilters(prev => ({ ...prev, symbol: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Symbols</option>
                {availableSymbols.map(symbol => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="type-filter" className="text-sm font-medium text-gray-300">
                Type
              </label>
              <select
                id="type-filter"
                value={tempFilters.type}
                onChange={(e) => setTempFilters(prev => ({ ...prev, type: e.target.value as 'all' | 'buy' | 'sell' }))}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="buy">Long (Buy)</option>
                <option value="sell">Short (Sell)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="source-filter" className="text-sm font-medium text-gray-300">
                Source
              </label>
              <select
                id="source-filter"
                value={tempFilters.source}
                onChange={(e) => setTempFilters(prev => ({ ...prev, source: e.target.value as 'all' | 'manual' | 'upload' | 'mt5' }))}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="manual">Manual</option>
                <option value="upload">Upload</option>
                <option value="mt5">MT5</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="limit-filter" className="text-sm font-medium text-gray-300">
                Per Page
              </label>
              <select
                id="limit-filter"
                value={tempFilters.limit}
                onChange={(e) => setTempFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="start-date" className="text-sm font-medium text-gray-300">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={tempFilters.dateRange.start ? tempFilters.dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="end-date" className="text-sm font-medium text-gray-300">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={tempFilters.dateRange.end ? tempFilters.dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters Summary (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.symbol !== 'all' && (
            <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md border border-gray-700">
              Symbol: {filters.symbol}
            </span>
          )}
          {filters.type !== 'all' && (
            <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md border border-gray-700">
              Type: {filters.type === 'buy' ? 'Long' : 'Short'}
            </span>
          )}
          {filters.source !== 'all' && (
            <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md border border-gray-700">
              Source: {filters.source}
            </span>
          )}
          {filters.dateRange.start && (
            <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md border border-gray-700">
              From: {filters.dateRange.start.toLocaleDateString()}
            </span>
          )}
          {filters.dateRange.end && (
            <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md border border-gray-700">
              To: {filters.dateRange.end.toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
