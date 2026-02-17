import { useState, useEffect } from 'react';
import { TradeFiltersState } from '../types';
import { Button } from './ui/button';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { formatDateInTimezone } from '../utils/timezone';

interface TradeFiltersProps {
  availableSymbols: string[];
  onFilterChange: (filters: TradeFiltersState) => void;
  initialFilters?: Partial<TradeFiltersState>;
}

export default function TradeFilters({ availableSymbols, onFilterChange, initialFilters }: TradeFiltersProps) {
  const timezone = useAppSelector((state) => state.trading.timezone);
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
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded">
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
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 text-xs"
          >
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-4 mt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="symbol-filter" className="text-xs font-medium text-muted-foreground">
                Symbol
              </label>
              <select
                id="symbol-filter"
                value={tempFilters.symbol}
                onChange={(e) => setTempFilters(prev => ({ ...prev, symbol: e.target.value }))}
                className="input-base"
              >
                <option value="all">All Symbols</option>
                {availableSymbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="type-filter" className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <select
                id="type-filter"
                value={tempFilters.type}
                onChange={(e) => setTempFilters(prev => ({ ...prev, type: e.target.value as 'all' | 'buy' | 'sell' }))}
                className="input-base"
              >
                <option value="all">All Types</option>
                <option value="buy">Long (Buy)</option>
                <option value="sell">Short (Sell)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="source-filter" className="text-xs font-medium text-muted-foreground">
                Source
              </label>
              <select
                id="source-filter"
                value={tempFilters.source}
                onChange={(e) => setTempFilters(prev => ({ ...prev, source: e.target.value as 'all' | 'manual' | 'upload' | 'mt5' }))}
                className="input-base"
              >
                <option value="all">All Sources</option>
                <option value="manual">Manual</option>
                <option value="upload">Upload</option>
                <option value="mt5">MT5</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="limit-filter" className="text-xs font-medium text-muted-foreground">
                Per Page
              </label>
              <select
                id="limit-filter"
                value={tempFilters.limit}
                onChange={(e) => setTempFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="input-base"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="start-date" className="text-xs font-medium text-muted-foreground">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={tempFilters.dateRange.start ? tempFilters.dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="input-base"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="end-date" className="text-xs font-medium text-muted-foreground">
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={tempFilters.dateRange.end ? tempFilters.dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <Button onClick={handleApplyFilters} className="w-full">
            Apply Filters
          </Button>
        </div>
      )}

      {/* Active Filters Summary (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t">
          {filters.symbol !== 'all' && (
            <span className="px-2 py-1 text-[11px] font-medium bg-muted text-foreground rounded-md">
              {filters.symbol}
            </span>
          )}
          {filters.type !== 'all' && (
            <span className="px-2 py-1 text-[11px] font-medium bg-muted text-foreground rounded-md">
              {filters.type === 'buy' ? 'Long' : 'Short'}
            </span>
          )}
          {filters.source !== 'all' && (
            <span className="px-2 py-1 text-[11px] font-medium bg-muted text-foreground rounded-md">
              {filters.source}
            </span>
          )}
          {filters.dateRange.start && (
            <span className="px-2 py-1 text-[11px] font-medium bg-muted text-foreground rounded-md">
              From: {formatDateInTimezone(filters.dateRange.start, timezone, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {filters.dateRange.end && (
            <span className="px-2 py-1 text-[11px] font-medium bg-muted text-foreground rounded-md">
              To: {formatDateInTimezone(filters.dateRange.end, timezone, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
