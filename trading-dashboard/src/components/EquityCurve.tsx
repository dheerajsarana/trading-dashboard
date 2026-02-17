import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { EquityPoint } from '../types';
import { TrendingUp } from 'lucide-react';

interface EquityCurveProps {
  data: EquityPoint[];
}

const EquityCurve: React.FC<EquityCurveProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary/60" />
          <h3 className="text-lg font-bold tracking-tight">Equity Curve</h3>
        </div>
        <p className="text-muted-foreground text-xs mb-2">Cumulative P&L progression</p>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">Complete trades to see your equity curve</p>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = data.length > 0 && data[data.length - 1].equity >= 0;
  const lineColor = isPositive ? 'hsl(var(--profit))' : 'hsl(var(--loss))';

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary/60" />
        <h3 className="text-lg font-bold tracking-tight">Equity Curve</h3>
      </div>
      <p className="text-muted-foreground text-xs mb-4">Cumulative P&L progression</p>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#equityGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EquityCurve;
