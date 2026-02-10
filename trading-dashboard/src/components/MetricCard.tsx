import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  valueColor?: string;
  note?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  valueColor = 'text-blue-500',
  note 
}) => {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="text-muted-foreground text-sm uppercase tracking-wide">{title}</div>
        <div className="text-blue-500">{icon}</div>
      </div>
      <div className={`text-3xl font-bold mb-1 ${valueColor}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-muted-foreground text-sm">{subtitle}</div>
      )}
      {note && (
        <div className="mt-4 text-muted-foreground text-xs flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {note}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
