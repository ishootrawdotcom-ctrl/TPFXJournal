import React, { useMemo } from 'react';
import { Trade, TradeStatus, TradeType } from '../types';
import { BarChart3 } from './Icons';

interface DashboardViewProps {
  trades: Trade[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ trades }) => {
  
  // Calculate Dashboard Stats
  const stats = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === TradeStatus.CLOSED);
    const wins = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losses = closedTrades.filter(t => (t.pnl || 0) <= 0);
    
    const totalPnL = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const avgWin = wins.length > 0 ? wins.reduce((acc, t) => acc + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((acc, t) => acc + (t.pnl || 0), 0) / losses.length : 0;
    
    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
    const lossRate = closedTrades.length > 0 ? (losses.length / closedTrades.length) * 100 : 0;

    return {
      winsCount: wins.length,
      lossesCount: losses.length,
      winRate,
      lossRate,
      avgWin,
      avgLoss,
      totalPnL,
      openCount: trades.filter(t => t.status === TradeStatus.OPEN).length,
      totalTrades: closedTrades.length
    };
  }, [trades]);

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Top Filter Bar - Hide scrollbar for cleaner look */}
      <div className="flex items-center gap-2 text-xs font-medium overflow-x-auto pb-2 scrollbar-hide">
        {['Today', 'Yesterday', 'This wk.', 'Last wk.', 'This mo.', 'Last mo.', 'This yr.', 'Last yr.', 'Reset'].map((filter, idx) => (
          <button 
            key={filter}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap border border-slate-700 
            ${idx === 4 ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/50 p-3 lg:p-4 rounded-xl border border-slate-800">
         {/* Wins */}
         <div className="flex items-center gap-2 lg:gap-3 justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Wins</span>
                <span className="text-lg lg:text-xl font-bold text-green-400">{stats.winsCount}</span>
            </div>
            <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] lg:text-xs font-bold text-slate-400">
                {stats.winRate.toFixed(0)}%
            </div>
         </div>

         {/* Losses */}
         <div className="flex items-center gap-2 lg:gap-3 justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Losses</span>
                <span className="text-lg lg:text-xl font-bold text-red-400">{stats.lossesCount}</span>
            </div>
            <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] lg:text-xs font-bold text-slate-400">
                {stats.lossRate.toFixed(0)}%
            </div>
         </div>

         {/* Averages */}
         <div className="flex flex-col justify-center p-2 bg-slate-900 rounded-lg border border-slate-800 gap-1">
             <div className="flex justify-between text-xs">
                 <span className="text-slate-500 font-bold">AVG W</span>
                 <span className="text-green-400 font-mono">${stats.avgWin.toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-xs">
                 <span className="text-slate-500 font-bold">AVG L</span>
                 <span className="text-red-400 font-mono">${Math.abs(stats.avgLoss).toFixed(2)}</span>
             </div>
         </div>

         {/* Total PnL */}
         <div className="flex flex-col justify-center p-2 bg-slate-900 rounded-lg border border-slate-800 items-end relative overflow-hidden">
             <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold absolute top-2 left-3">PnL</span>
             <span className={`text-xl lg:text-2xl font-bold z-10 ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalPnL.toFixed(2)}
             </span>
             <div className={`text-xs px-2 py-0.5 rounded-full mt-1 z-10 bg-slate-800 ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalTrades > 0 ? ((stats.totalPnL / (stats.totalTrades * 1000)) * 100).toFixed(2) : '0.00'}%
             </div>
         </div>
      </div>

      {/* Mobile Trade Cards (Visible on small screens) */}
      <div className="lg:hidden space-y-3 pb-20">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Recent Activity</h3>
        {trades.length === 0 ? (
             <div className="text-center py-10 text-slate-500 text-sm bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                 No trades logged. Tap + to start.
             </div>
        ) : (
            trades.slice().reverse().map((trade) => {
                const returnAmt = trade.pnl || 0;
                return (
                    <div key={trade.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${returnAmt >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div className="flex justify-between items-start mb-2 pl-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-white">{trade.ticker}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${trade.type === TradeType.LONG ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {trade.type}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-500">{trade.entryDate}</span>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-bold ${returnAmt >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {returnAmt >= 0 ? '+' : ''}{returnAmt.toFixed(2)}
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-800 ${trade.status === TradeStatus.OPEN ? 'text-blue-400 border border-blue-400/30' : 'text-slate-400'}`}>
                                    {trade.status}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pl-2 pt-2 border-t border-slate-800/50">
                            <div>
                                <span className="text-[10px] text-slate-500 block">Qty</span>
                                <span className="text-sm text-slate-300">{trade.quantity}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 block">Entry</span>
                                <span className="text-sm text-slate-300">{trade.entryPrice}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-500 block">Exit</span>
                                <span className="text-sm text-slate-300">{trade.exitPrice || '-'}</span>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Desktop Table (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-400 font-medium text-xs uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Side</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Entry</th>
                <th className="px-4 py-3 text-right">Exit</th>
                <th className="px-4 py-3 text-right">Return</th>
                <th className="px-4 py-3 text-right">Return %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {trades.length === 0 ? (
                  <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                          No trades logged yet. Start by clicking "New Trade".
                      </td>
                  </tr>
              ) : (
                trades.map((trade) => {
                    const entryTotal = trade.entryPrice * trade.quantity;
                    const returnAmt = trade.pnl || 0;
                    const returnPct = entryTotal > 0 ? (returnAmt / entryTotal) * 100 : 0;
                    
                    return (
                        <tr key={trade.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">{trade.entryDate}</td>
                        <td className="px-4 py-3 font-semibold text-blue-400 group-hover:text-blue-300">{trade.ticker}</td>
                        <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                trade.status === TradeStatus.OPEN 
                                ? 'border-slate-500 text-slate-400 bg-slate-800' 
                                : 'border-slate-600 text-slate-300 bg-slate-800'
                            }`}>
                                {trade.status}
                            </span>
                        </td>
                        <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 font-medium ${trade.type === TradeType.LONG ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.type === TradeType.LONG ? '↑ LONG' : '↓ SHORT'}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">{trade.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-400">${trade.entryPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-slate-400">{trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}</td>
                        <td className={`px-4 py-3 text-right font-medium ${returnAmt > 0 ? 'text-green-400' : returnAmt < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                            {returnAmt !== 0 ? `$${returnAmt.toFixed(2)}` : '-'}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${returnPct > 0 ? 'text-green-400' : returnPct < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                            {returnPct !== 0 ? `${returnPct.toFixed(2)}%` : '-'}
                        </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
  );
};

export default DashboardView;
