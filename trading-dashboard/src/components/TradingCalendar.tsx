import React, { useState } from 'react';
import { Trade } from '../types';
import { getTradesByDate } from '../utils/statistics';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface TradingCalendarProps {
  trades: Trade[];
  onDateSelect: (date: Date | null) => void;
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ trades, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    const tradesOnDate = getTradesByDate(trades, date);

    if (tradesOnDate.length > 0) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  const getDayPnL = (day: number): number => {
    const date = new Date(year, month, day);
    const tradesOnDate = getTradesByDate(trades, date);
    return tradesOnDate.reduce((sum, t) => sum + t.profit, 0);
  };

  const hasTrades = (day: number): boolean => {
    const date = new Date(year, month, day);
    return getTradesByDate(trades, date).length > 0;
  };

  const isFutureDay = (day: number): boolean => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const pnl = getDayPnL(day);
    const hasTradesOnDay = hasTrades(day);
    const future = isFutureDay(day);
    const today = isToday(day);
    const isSelected = selectedDate?.getDate() === day &&
                       selectedDate?.getMonth() === month &&
                       selectedDate?.getFullYear() === year;

    days.push(
      <div
        key={day}
        onClick={() => hasTradesOnDay && handleDateClick(day)}
        className={`
          aspect-square border rounded-lg flex flex-col items-center justify-center transition-all duration-150
          ${hasTradesOnDay ? 'cursor-pointer hover:border-primary/50' : ''}
          ${future ? 'opacity-25 border-dashed' : ''}
          ${!hasTradesOnDay && !future ? 'opacity-60' : ''}
          ${isSelected ? 'border-primary bg-primary/10 ring-1 ring-primary/30' : ''}
          ${pnl > 0 ? 'bg-profit/8 border-profit/20' : pnl < 0 ? 'bg-loss/8 border-loss/20' : ''}
          ${today ? 'ring-1 ring-primary/40' : ''}
        `}
      >
        <div className={`text-xs font-medium ${today ? 'text-primary' : ''}`}>{day}</div>
        {hasTradesOnDay && (
          <div className={`text-[10px] font-mono-num font-semibold ${pnl > 0 ? 'text-profit' : 'text-loss'}`}>
            {pnl > 0 ? '+' : ''}${pnl.toFixed(0)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary/60" />
        <h3 className="text-lg font-bold tracking-tight">Trading Calendar</h3>
      </div>
      <p className="text-muted-foreground text-xs mb-4">Daily P&L heatmap — click on days to see trades</p>

      <div className="flex items-center justify-between mb-4">
        <button onClick={previousMonth} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="text-sm font-semibold">{monthNames[month]} {year}</div>
        <button onClick={nextMonth} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days}
      </div>
    </div>
  );
};

export default TradingCalendar;
