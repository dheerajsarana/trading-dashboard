import React from 'react';
import { Trade } from '../types';

interface DayTradesProps {
  trades: Trade[];
  selectedDate: Date | null;
}

const DayTrades: React.FC<DayTradesProps> = ({ trades, selectedDate }) => {
  if (!selectedDate || trades.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="font-semibold">Day Trades</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Click on a day with trades to view details</p>
        </div>
      </div>
    );
  }

  const totalPnL = trades.reduce((sum, t) => sum + t.profit, 0);

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="font-semibold">Day Trades</h3>
        </div>
        <div className={`text-sm font-semibold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          Total: ${totalPnL.toFixed(2)}
        </div>
      </div>

      <div className="text-muted-foreground text-sm mb-4">
        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {trades.map((trade, index) => (
          <div 
            key={index}
            className="bg-muted border rounded-lg p-4 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{trade.symbol}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  trade.type === 'buy' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {trade.type.toUpperCase()}
                </span>
              </div>
              <div className={`font-semibold ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${trade.profit.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Volume: </span>
                <span className="text-foreground">{trade.volume}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Position: </span>
                <span className="text-foreground">{trade.position}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Open: </span>
                <span className="text-foreground">{trade.openPrice.toFixed(5)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Close: </span>
                <span className="text-foreground">{trade.closePrice.toFixed(5)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Time: </span>
                <span className="text-foreground">
                  {trade.closeTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Commission: </span>
                <span className="text-foreground">${trade.commission.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayTrades;
