import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStats, fetchTrades } from '../../store/tradingSlice';
import { formatDateInTimezone } from '../../utils/timezone';
// import { fetchMT5Accounts, fetchMT5Dashboard } from '../../store/mt5Slice';
// import MT5ConnectModal from '../mt5/MT5ConnectModal';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Target, BarChart3, Activity } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const { stats, allTrades, timezone, isLoading: tradingLoading } = useAppSelector((state) => state.trading);
  // const { accounts, selectedAccountId, dashboardData, isLoading: mt5Loading } = useAppSelector((state) => state.mt5);

  // Fetch combined stats and trades on mount
  useEffect(() => {
    dispatch(fetchTrades());
    dispatch(fetchStats({ timePeriod: '30days', assetFilter: 'all', tradeFilter: 'all' }));
  }, [dispatch]);

  // MT5 data fetching disabled
  // useEffect(() => {
  //   dispatch(fetchMT5Accounts());
  // }, [dispatch]);

  // useEffect(() => {
  //   if (selectedAccountId) {
  //     dispatch(fetchMT5Dashboard({ accountId: selectedAccountId, timePeriod: '30days' }));
  //   }
  // }, [dispatch, selectedAccountId]);

  const apiStats = stats?.basic || {
    totalPnL: 0,
    winRate: 0,
    profitFactor: 0,
    expectancy: 0,
    totalTrades: 0,
    wins: 0,
    losses: 0,
  };

  // const selectedAccount = accounts?.find((acc) => acc.id === selectedAccountId);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">TOTAL P&L</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  {apiStats.totalPnL >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${apiStats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {apiStats.totalPnL >= 0 ? '+' : ''}${apiStats.totalPnL.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {apiStats.totalTrades} total trades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">WIN RATE</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiStats.winRate.toFixed(1)}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(apiStats.winRate, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">PROFIT FACTOR</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${apiStats.profitFactor >= 1.5 ? 'text-green-500' : 'text-muted-foreground'}`}>
                {apiStats.profitFactor.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {apiStats.profitFactor >= 1.5 ? 'Good' : 'Needs improvement'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">EXPECTANCY</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-purple-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${apiStats.expectancy >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {apiStats.expectancy >= 0 ? '+' : ''}${apiStats.expectancy.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per trade average
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* MT5 Account Status - disabled */}
      {/* {accounts.length > 0 && selectedAccount && (
        <section>
          <h2 className="text-lg font-semibold mb-4">MT5 Account</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedAccount.accountName || 'MT5 Account'}</h3>
                  <p className="text-sm text-muted-foreground">
                    #{selectedAccount.accountNumber} • {selectedAccount.server}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold">
                    ${selectedAccount.balance?.toFixed(2) || '0.00'} {selectedAccount.currency}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Equity: ${selectedAccount.equity?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )} */}

      {/* Open Positions from MT5 - disabled */}
      {/* {dashboardData && dashboardData.positions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Open Positions
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {dashboardData.positions.map((position) => (
                  <div
                    key={position.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        position.type === 'BUY' ? 'bg-blue-500/20 text-blue-500' : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {position.type}
                      </div>
                      <div>
                        <p className="font-semibold">{position.symbol}</p>
                        <p className="text-sm text-muted-foreground">{position.volume} lots</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${position.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {position.profit >= 0 ? '+' : ''}${position.profit.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">@ {position.openPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )} */}

      {/* Recent Trades */}
      {allTrades.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {allTrades.slice(0, 8).map((trade, index) => (
                  <div
                    key={trade.id || index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.type === 'buy' ? 'bg-blue-500/20 text-blue-500' : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {trade.type === 'buy' ? 'LONG' : 'SHORT'}
                      </div>
                      <div>
                        <p className="font-semibold">{trade.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateInTimezone(trade.closeTime, timezone, { month: 'short', day: 'numeric', year: 'numeric' })} • {trade.volume} lots
                          {trade.source === 'mt5' && (
                            <span className="ml-1 text-green-400">[MT5]</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Loading */}
      {tradingLoading && allTrades.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* MT5 Connect Modal - disabled */}
      {/* <MT5ConnectModal /> */}
    </div>
  );
}
