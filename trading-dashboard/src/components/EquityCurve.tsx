import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EquityPoint } from '../types';

interface EquityCurveProps {
  data: EquityPoint[];
}

const EquityCurve: React.FC<EquityCurveProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <h3 className="font-semibold">Equity Curve</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-2">Cumulative P&L progression</p>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Complete trades to see your equity curve</p>
          </div>
        </div>
      </div>
    );
  }

  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border')?.trim()
    ? `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--border')})`
    : '#374151';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground')?.trim()
    ? `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground')})`
    : '#9CA3AF';
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--card')?.trim()
    ? `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--card')})`
    : '#1F2937';

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <h3 className="font-semibold">Equity Curve</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">Cumulative P&L progression</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <YAxis
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: bgColor,
              border: `1px solid ${gridColor}`,
              borderRadius: '8px',
              color: textColor
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EquityCurve;
