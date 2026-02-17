import { useEffect, useRef, useCallback } from 'react';
import { createChart, UTCTimestamp, ColorType } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import { useAppSelector } from '@/store/hooks';

const ReplayChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const prevCandleCountRef = useRef<number>(0);

  const { allCandles, visibleCandleCount, openPositions, closedTrades } = useAppSelector(
    (state) => state.backtest
  );

  // Format candle for lightweight-charts
  const formatCandle = useCallback((candle: { timestamp: string; open: number; high: number; low: number; close: number }) => ({
    time: (Math.floor(new Date(candle.timestamp).getTime() / 1000)) as UTCTimestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }), []);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const style = getComputedStyle(document.documentElement);
    const bgColor = isDark ? 'hsl(' + style.getPropertyValue('--card').trim() + ')' : 'hsl(' + style.getPropertyValue('--card').trim() + ')';
    const textColor = isDark ? 'hsl(' + style.getPropertyValue('--muted-foreground').trim() + ')' : 'hsl(' + style.getPropertyValue('--foreground').trim() + ')';
    const gridColor = isDark ? 'hsl(' + style.getPropertyValue('--border').trim() + ')' : 'hsl(' + style.getPropertyValue('--border').trim() + ')';

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: gridColor },
      timeScale: { borderColor: gridColor, timeVisible: true, secondsVisible: false },
      width: containerRef.current.clientWidth,
      height: 500,
    });

    const candleSeries = (chart as any).addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    const volumeSeries = (chart as any).addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    prevCandleCountRef.current = 0;

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        chart.applyOptions({ width });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      prevCandleCountRef.current = 0;
    };
  }, []); // Only re-create on mount

  // Update candle data progressively
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || allCandles.length === 0) return;

    const prevCount = prevCandleCountRef.current;
    const newCount = visibleCandleCount;

    if (newCount <= prevCount) {
      // Reset case: set all data from scratch
      if (newCount > 0 && prevCount === 0) {
        const visibleData = allCandles.slice(0, newCount);
        candleSeriesRef.current.setData(visibleData.map(formatCandle));
        volumeSeriesRef.current.setData(
          visibleData.map(c => ({
            time: (Math.floor(new Date(c.timestamp).getTime() / 1000)) as UTCTimestamp,
            value: c.volume,
            color: c.close >= c.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
          }))
        );
      }
    } else if (prevCount === 0) {
      // Initial load
      const visibleData = allCandles.slice(0, newCount);
      candleSeriesRef.current.setData(visibleData.map(formatCandle));
      volumeSeriesRef.current.setData(
        visibleData.map(c => ({
          time: (Math.floor(new Date(c.timestamp).getTime() / 1000)) as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
        }))
      );
    } else {
      // Progressive update: only add new candles
      for (let i = prevCount; i < newCount; i++) {
        const candle = allCandles[i];
        candleSeriesRef.current.update(formatCandle(candle));
        volumeSeriesRef.current.update({
          time: (Math.floor(new Date(candle.timestamp).getTime() / 1000)) as UTCTimestamp,
          value: candle.volume,
          color: candle.close >= candle.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
        });
      }
    }

    prevCandleCountRef.current = newCount;

    // Scroll to latest
    if (chartRef.current) {
      chartRef.current.timeScale().scrollToRealTime();
    }
  }, [visibleCandleCount, allCandles, formatCandle]);

  // Update markers for trades
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const markers: any[] = [];

    // Entry markers for open positions
    for (const pos of openPositions) {
      markers.push({
        time: (Math.floor(new Date(pos.entryTime).getTime() / 1000)) as UTCTimestamp,
        position: pos.type === 'buy' ? 'belowBar' : 'aboveBar',
        color: pos.type === 'buy' ? '#22c55e' : '#ef4444',
        shape: pos.type === 'buy' ? 'arrowUp' : 'arrowDown',
        text: `${pos.type.toUpperCase()} @ ${pos.entryPrice.toFixed(5)}`,
      });
    }

    // Entry + exit markers for closed trades
    for (const trade of closedTrades) {
      markers.push({
        time: (Math.floor(new Date(trade.entryTime).getTime() / 1000)) as UTCTimestamp,
        position: trade.type === 'buy' ? 'belowBar' : 'aboveBar',
        color: trade.type === 'buy' ? '#22c55e' : '#ef4444',
        shape: trade.type === 'buy' ? 'arrowUp' : 'arrowDown',
        text: `${trade.type.toUpperCase()} @ ${trade.entryPrice.toFixed(5)}`,
      });

      if (trade.exitTime && trade.exitPrice) {
        markers.push({
          time: (Math.floor(new Date(trade.exitTime).getTime() / 1000)) as UTCTimestamp,
          position: 'inBar',
          color: (trade.pnl || 0) >= 0 ? '#22c55e' : '#ef4444',
          shape: 'circle',
          text: `Close ${(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}`,
        });
      }
    }

    // Sort markers by time (required by lightweight-charts)
    markers.sort((a, b) => (a.time as number) - (b.time as number));
    candleSeriesRef.current.setMarkers(markers);
  }, [openPositions, closedTrades]);

  return (
    <div className="bg-card border rounded-xl p-4">
      <div ref={containerRef} className="w-full" />
    </div>
  );
};

export default ReplayChart;
