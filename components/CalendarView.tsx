import React, { useMemo } from 'react';
import { Trade, CalendarDay } from '../types';
import { ChevronLeft, ChevronRight } from './Icons';

interface CalendarViewProps {
  trades: Trade[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades, currentDate, setCurrentDate }) => {
  
  // Helper to generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const startingDayIndex = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    
    const days: CalendarDay[] = [];

    // Padding days from previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        trades: [],
        dailyPnL: 0
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daysTrades = trades.filter(t => t.entryDate === dateStr);
      const dailyPnL = daysTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

      days.push({
        date,
        isCurrentMonth: true,
        trades: daysTrades,
        dailyPnL
      });
    }

    // Padding for next month to complete the grid (6 rows x 7 cols = 42 cells standard)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        trades: [],
        dailyPnL: 0
      });
    }

    return days;
  }, [currentDate, trades]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 p-2">
        <div className="flex gap-2">
            <button 
                onClick={handlePrevMonth}
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
        </div>

        <h2 className="text-xl font-bold text-slate-100">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <div className="flex gap-2">
            <button 
                onClick={handleNextMonth}
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-slate-400 text-sm font-medium">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1 min-h-0">
        {calendarDays.map((day, idx) => (
          <div 
            key={idx}
            className={`
              relative rounded-xl p-2 border flex flex-col justify-between transition-colors group cursor-pointer
              ${day.isCurrentMonth ? 'bg-[#1e293b] border-slate-700/50' : 'bg-slate-900/50 border-transparent opacity-40'}
              ${day.isCurrentMonth ? 'hover:border-slate-500 hover:bg-slate-800' : ''}
            `}
          >
            <span className={`text-sm font-medium ${day.isCurrentMonth ? 'text-slate-300' : 'text-slate-600'}`}>
              {day.date.getDate()}
            </span>

            {day.dailyPnL !== 0 && (
              <div className="flex flex-col items-end">
                <span className={`text-sm font-bold ${day.dailyPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {day.dailyPnL > 0 ? '+' : ''}{day.dailyPnL.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500">
                    {day.trades.length} Trades
                </span>
              </div>
            )}

            {/* Indicator dots for trades */}
            <div className="absolute bottom-2 left-2 flex gap-1">
                {day.trades.slice(0, 4).map((t, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${t.pnl && t.pnl > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;