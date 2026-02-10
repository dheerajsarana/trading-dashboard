import React, { useState } from 'react';
import { Trade } from '../types';
import { getTradesByDate } from '../utils/statistics';

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
    const isSelected = selectedDate?.getDate() === day && 
                       selectedDate?.getMonth() === month && 
                       selectedDate?.getFullYear() === year;

    days.push(
      <div
        key={day}
        onClick={() => hasTradesOnDay && handleDateClick(day)}
        className={`
          aspect-square border border rounded-lg flex flex-col items-center justify-center
          ${hasTradesOnDay ? 'cursor-pointer hover:border-blue-500' : 'opacity-50'}
          ${isSelected ? 'border-blue-500 bg-blue-500/10' : ''}
          ${pnl > 0 ? 'bg-green-900/20' : pnl < 0 ? 'bg-red-900/20' : ''}
        `}
      >
        <div className="text-sm">{day}</div>
        {hasTradesOnDay && (
          <div className={`text-xs ${pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${pnl.toFixed(2)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="font-semibold">Trading Calendar</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-4">Daily P&L heatmap - Click on days to see trades</p>

      <div className="flex items-center justify-between mb-4">
        <button onClick={previousMonth} className="p-2 hover:bg-muted rounded">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="font-semibold">{monthNames[month]} {year}</div>
        <button onClick={nextMonth} className="p-2 hover:bg-muted rounded">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-muted-foreground text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>
    </div>
  );
};

export default TradingCalendar;
