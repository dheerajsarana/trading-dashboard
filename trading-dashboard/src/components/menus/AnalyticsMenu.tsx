import { useEffect } from 'react';
import {
  setTimePeriod,
  setTradeFilter,
  setAssetFilter,
  setSelectedDate,
  fetchTrades,
  uploadTradesFile,
  fetchStats,
  fetchEquityCurve,
} from '../../store/tradingSlice';
import FileUpload from '../../components/FileUpload';
import MetricCard from '../../components/MetricCard';
import EquityCurve from '../../components/EquityCurve';
import QuickStats from '../../components/QuickStats';
import TradingCalendar from '../../components/TradingCalendar';
import DayTrades from '../../components/DayTrades';
import {
  DayPerformanceChart,
  LongShortStats,
  TopSymbols,
  WinLossDistribution,
  RecentTrades,
} from '../../components/AdditionalComponents';
import {
  DrawdownIntelligence,
  TradeDurationAnalysis,
  SessionAnalytics,
} from '../../components/AdvancedAnalytics';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { TimePeriod, TradeFilter } from '../../types';
import {
  filterTradesByPeriod,
  getTradesByDate,
  getUniqueSymbols,
  getDayPerformance,
  getTopSymbols,
} from '../../utils/statistics';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Check, TrendingDown, TrendingUp, Upload, X } from 'lucide-react';
const AnalyticsMenu = () => {
    const dispatch = useAppDispatch();
    const {
        allTrades,
        stats,
        equityCurve,
        timePeriod,
        tradeFilter,
        assetFilter,
        selectedDate,
        isLoading,
        error,
    } = useAppSelector((state) => state.trading);

    // Fetch trades on mount
    useEffect(() => {
        dispatch(fetchTrades());
    }, [dispatch]);

    // Fetch stats when filters change or trades are loaded
    useEffect(() => {
        if (allTrades.length > 0) {
            console.log('Fetching stats with params:', { timePeriod, assetFilter, tradeFilter });
            dispatch(fetchStats({ timePeriod, assetFilter, tradeFilter }))
                .unwrap()
                .then((data) => {
                    console.log('Stats received from API:', data);
                })
                .catch((error) => {
                    console.error('Error fetching stats:', error);
                });
            dispatch(fetchEquityCurve({ timePeriod, assetFilter, tradeFilter }));
        }
    }, [dispatch, timePeriod, assetFilter, tradeFilter, allTrades.length]);

    const handleFileUpload = async (file: File) => {
        try {
            await dispatch(uploadTradesFile(file)).unwrap();
            await dispatch(fetchTrades()).unwrap();
            await dispatch(fetchStats({ timePeriod, assetFilter, tradeFilter })).unwrap();
            await dispatch(fetchEquityCurve({ timePeriod, assetFilter, tradeFilter })).unwrap();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload trades. Please try again.');
        }
    };

    // Local filtering for display purposes
    const filteredTrades = filterTradesByPeriod(allTrades, timePeriod);
    const assetFilteredTrades =
        assetFilter === 'all'
            ? filteredTrades
            : filteredTrades.filter((t) => t.symbol === assetFilter);
    const displayTrades =
        tradeFilter === 'all'
            ? assetFilteredTrades
            : tradeFilter === 'winners'
                ? assetFilteredTrades.filter((t) => t.profit > 0)
                : assetFilteredTrades.filter((t) => t.profit < 0);

    const dayTrades = selectedDate ? getTradesByDate(displayTrades, selectedDate) : [];
    const availableSymbols = getUniqueSymbols(allTrades);

    // Use stats from API or provide defaults
    const apiStats = stats?.basic || {
        totalPnL: 0,
        winRate: 0,
        profitFactor: 0,
        expectancy: 0,
        totalTrades: 0,
        wins: 0,
        losses: 0,
        avgWinner: 0,
        avgLoser: 0,
        bestTrade: 0,
        worstTrade: 0,
        winStreak: 0,
        lossStreak: 0,
        longTrades: 0,
        longPnL: 0,
        longWinRate: 0,
        shortTrades: 0,
        shortPnL: 0,
        shortWinRate: 0,
        grossProfit: 0,
        grossLoss: 0,
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        avgDrawdown: 0,
        avgDrawdownDuration: 0,
        maxDrawdownDuration: 0,
        recoveryFactor: 0,
        currentDrawdown: 0,
        avgHoldTimeWinners: 0,
        avgHoldTimeLosers: 0,
        avgHoldTimeAll: 0,
        optimalHoldingWindow: '',
    };
    const sessionStats = stats?.sessions || [];
    const drawdownStats = {
        maxDrawdown: apiStats.maxDrawdown || 0,
        maxDrawdownPercent: apiStats.maxDrawdownPercent || 0,
        avgDrawdown: apiStats.avgDrawdown || 0,
        avgDrawdownDuration: apiStats.avgDrawdownDuration || 0,
        maxDrawdownDuration: apiStats.maxDrawdownDuration || 0,
        recoveryFactor: apiStats.recoveryFactor || 0,
        currentDrawdown: apiStats.currentDrawdown || 0,
    };
    const durationStats = {
        avgHoldTimeWinners: apiStats.avgHoldTimeWinners || 0,
        avgHoldTimeLosers: apiStats.avgHoldTimeLosers || 0,
        avgHoldTimeAll: apiStats.avgHoldTimeAll || 0,
        optimalHoldingWindow: apiStats.optimalHoldingWindow || 'N/A',
    };
    // Calculate display-specific data from filtered trades
    // (These are not returned by the backend stats API, so we calculate them locally)
    const dayPerformance: any[] = getDayPerformance(displayTrades);
    const topSymbols: any[] = getTopSymbols(displayTrades);

    const riskReward = apiStats.avgLoser > 0 ? apiStats.avgWinner / apiStats.avgLoser : 0;

    const timePeriods: { value: TimePeriod; label: string }[] = [
        { value: 'today', label: 'Today' },
        { value: '7days', label: '7 Days' },
        { value: '30days', label: '30 Days' },
        { value: '3months', label: '3 Months' },
        { value: '1year', label: '1 Year' },
        { value: 'all', label: 'All Time' },
    ];
    
    return <>
        {isLoading && (
            <div className="container py-8">
                <div className="text-center text-muted-foreground">Loading trades...</div>
            </div>
        )}

        {!isLoading && allTrades.length === 0 && (
            <div className="container py-16">
                <Card className="border-dashed bg-card border">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Upload className="h-20 w-20 text-muted-foreground mb-4" />
                        <CardTitle className="mb-2">No Trading Data</CardTitle>
                        <CardDescription className="mb-6">
                            Upload your MT5 Excel file to get started with analytics
                        </CardDescription>
                        <FileUpload onFileUpload={handleFileUpload} />
                        {error && (
                            <div className="mt-4 p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}

        {!isLoading && allTrades.length > 0 && (
            <div className="container py-6 space-y-6">
                {/* Filters */}
                <Card className="bg-card border">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Time Period */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Period:</span>
                                <Select
                                    value={timePeriod}
                                    onValueChange={(value) => dispatch(setTimePeriod(value as TimePeriod))}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timePeriods.map((period) => (
                                            <SelectItem key={period.value} value={period.value}>
                                                {period.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Asset Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Asset:</span>
                                <Select
                                    value={assetFilter}
                                    onValueChange={(value) => dispatch(setAssetFilter(value))}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSymbols.map((symbol) => (
                                            <SelectItem key={symbol} value={symbol}>
                                                {symbol === 'all' ? 'All Assets' : symbol}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Trade Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Filter:</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant={tradeFilter === 'all' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => dispatch(setTradeFilter('all'))}
                                    >
                                        All Trades
                                    </Button>
                                    <Button
                                        variant={tradeFilter === 'winners' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => dispatch(setTradeFilter('winners'))}
                                    >
                                        <Check className="mr-1 h-4 w-4" />
                                        Winners
                                    </Button>
                                    <Button
                                        variant={tradeFilter === 'losers' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => dispatch(setTradeFilter('losers'))}
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Losers
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Overview Section */}
                <section id="overview">
                    <h2 className="text-2xl font-bold mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Total P&L"
                            value={`$${apiStats.totalPnL.toFixed(2)}`}
                            subtitle={`From ${apiStats.totalTrades} closed trades`}
                            valueColor={apiStats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}
                            icon={
                                apiStats.totalPnL >= 0 ? (
                                    <TrendingUp className="h-6 w-6" />
                                ) : (
                                    <TrendingDown className="h-6 w-6" />
                                )
                            }
                        />
                        <MetricCard
                            title="Win Rate"
                            value={`${apiStats.winRate.toFixed(1)}%`}
                            subtitle={`${apiStats.wins} wins • ${apiStats.losses} losses`}
                            valueColor={apiStats.winRate >= 50 ? 'text-green-500' : 'text-red-500'}
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            note="Percentage of profitable trades"
                        />
                        <MetricCard
                            title="Profit Factor"
                            value={apiStats.profitFactor.toFixed(2)}
                            subtitle={apiStats.profitFactor >= 1.5 ? 'Good' : 'Needs work'}
                            valueColor={apiStats.profitFactor >= 1.5 ? 'text-green-500' : 'text-red-500'}
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                            note="Gross profit ÷ Gross loss (above 1.5 is good)"
                        />
                        <MetricCard
                            title="Expectancy"
                            value={`$${apiStats.expectancy.toFixed(2)}`}
                            subtitle="Average per trade"
                            valueColor={apiStats.expectancy >= 0 ? 'text-blue-500' : 'text-red-500'}
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            }
                            note="Expected profit per trade based on your stats"
                        />
                    </div>
                </section>

                {/* Performance Section */}
                <section id="performance">
                    <h2 className="text-2xl font-bold mb-4">Performance Charts</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <EquityCurve data={equityCurve || []} />
                        </div>
                        <QuickStats
                            avgWinner={apiStats.avgWinner}
                            avgLoser={apiStats.avgLoser}
                            bestTrade={apiStats.bestTrade}
                            worstTrade={apiStats.worstTrade}
                            winStreak={apiStats.winStreak}
                            lossStreak={apiStats.lossStreak}
                            riskReward={riskReward}
                            openTrades={0}
                        />
                    </div>
                </section>

                {/* Analytics Section */}
                <section id="analytics">
                    <h2 className="text-2xl font-bold mb-4">Detailed Analytics</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <LongShortStats
                            longTrades={apiStats.longTrades}
                            longPnL={apiStats.longPnL}
                            longWinRate={apiStats.longWinRate}
                            shortTrades={apiStats.shortTrades}
                            shortPnL={apiStats.shortPnL}
                            shortWinRate={apiStats.shortWinRate}
                        />
                        <DayPerformanceChart data={dayPerformance} />
                        <TopSymbols symbols={topSymbols} />
                    </div>
                </section>

                {/* Calendar Section */}
                <section id="calendar">
                    <h2 className="text-2xl font-bold mb-4">Trading Calendar</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <TradingCalendar
                            trades={displayTrades}
                            onDateSelect={(date) => dispatch(setSelectedDate(date))}
                        />
                        <DayTrades trades={dayTrades} selectedDate={selectedDate} />
                    </div>
                </section>

                {/* Recent Trades */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <WinLossDistribution
                        grossProfit={apiStats.grossProfit}
                        grossLoss={apiStats.grossLoss}
                        netResult={apiStats.totalPnL}
                    />
                    <RecentTrades trades={displayTrades} />
                </div>

                {/* Advanced Analytics */}
                <section id="advanced">
                    <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>

                    <div id="drawdown" className="mb-6">
                        <DrawdownIntelligence stats={drawdownStats} />
                    </div>

                    <div id="duration" className="mb-6">
                        <TradeDurationAnalysis stats={durationStats} />
                    </div>

                    <div id="sessions">
                        <SessionAnalytics sessions={sessionStats} />
                    </div>
                </section>
            </div>
        )}
    </>
}
export default AnalyticsMenu;