import React from 'react';
import { Info } from 'lucide-react';

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
  valueColor = 'text-primary',
  note
}) => {
  return (
    <div className="bg-card border rounded-xl p-5 hover:border-primary/20 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{title}</p>
        <div className="text-primary/60">{icon}</div>
      </div>
      <div className={`text-2xl font-bold font-mono-num mb-0.5 ${valueColor}`}>
        {value}
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      )}
      {note && (
        <div className="mt-3 pt-3 border-t border-border/50 text-muted-foreground text-[11px] flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{note}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
