import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus,
  BrainCircuit,
  Edit2
} from './components/Icons';
import CalendarView from './components/CalendarView';
import DashboardView from './components/DashboardView';
import TradeModal from './components/TradeModal';
import AccountModal from './components/AccountModal';
import { analyzeTradingPerformance } from './services/geminiService';
import { Trade, Account } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'stats'>('dashboard');
  
  // Modal States
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Data States
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Account State with Persistance
  const [account, setAccount] = useState<Account>(() => {
    const saved = localStorage.getItem('tpfx_account');
    return saved ? JSON.parse(saved) : {
      id: '1',
      name: 'FundedNext',
      balance: 20000.00,
      currency: 'USD'
    };
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('tpfx_account', JSON.stringify(account));
  }, [account]);

  const handleAddTrade = (trade: Trade) => {
    setTrades([...trades, trade]);
  };

  const handleUpdateAccount = (updatedAccount: Account) => {
    setAccount(updatedAccount);
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    // Filter trades for the current view month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthlyTrades = trades.filter(t => {
        const tDate = new Date(t.entryDate);
        return tDate.getFullYear() === year && tDate.getMonth() === month;
    });

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const result = await analyzeTradingPerformance(monthlyTrades, monthName);
    
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // Derived Stats
  const monthlyStats = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthlyTrades = trades.filter(t => {
        const tDate = new Date(t.entryDate);
        return tDate.getFullYear() === year && tDate.getMonth() === month;
    });
    
    const netPnL = monthlyTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const winRate = monthlyTrades.length > 0 
        ? (monthlyTrades.filter(t => (t.pnl || 0) > 0).length / monthlyTrades.length) * 100 
        : 0;
    
    return { netPnL, winRate, tradeCount: monthlyTrades.length };
  }, [trades, currentDate]);


  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-slate-800 bg-[#0f172a] flex-col">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
                <BarChart3 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">TPFX Journal</span>
        </div>

        {/* Account Info */}
        <div className="p-6">
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-lg relative group">
                {/* Edit Button */}
                <button 
                    onClick={() => setIsAccountModalOpen(true)}
                    className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-all z-10"
                    title="Edit Account Details"
                >
                    <Edit2 className="w-3 h-3" />
                </button>

                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium truncate pr-6">{account.name}</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                    {account.currency === 'USD' ? '$' : account.currency}
                    {(account.balance + monthlyStats.netPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <span className={monthlyStats.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {monthlyStats.netPnL >= 0 ? '+' : ''}
                        {account.currency === 'USD' ? '$' : account.currency}
                        {Math.abs(monthlyStats.netPnL).toFixed(2)}
                    </span>
                    <span className="text-slate-500">active</span>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
            <button 
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${currentView === 'dashboard' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
            </button>
            <button 
                onClick={() => setCurrentView('calendar')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${currentView === 'calendar' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
                <Calendar className="w-5 h-5" />
                Journal
            </button>
            <button 
                onClick={() => setCurrentView('stats')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${currentView === 'stats' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
                <BarChart3 className="w-5 h-5" />
                Stats
            </button>
            
            <div className="pt-4 pb-2">
                <div className="h-px bg-slate-800 w-full mb-4"></div>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all">
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
            </div>
        </nav>

        {/* Action Button */}
        <div className="p-4 border-t border-slate-800">
             <button 
                onClick={() => setIsTradeModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
                <Plus className="w-5 h-5" />
                New Trade
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative mb-16 md:mb-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 bg-[#0f172a] shrink-0">
            <div className="flex items-center gap-3">
                {/* Mobile Logo */}
                <div className="md:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-white w-5 h-5" />
                </div>
                <h1 className="text-lg md:text-xl font-semibold text-white">
                    {currentView === 'calendar' ? 'Journal' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                 {/* Mobile Account Summary (Mini) */}
                 <div className="md:hidden flex flex-col items-end mr-1" onClick={() => setIsAccountModalOpen(true)}>
                    <span className="text-sm font-bold text-white">
                        {account.currency === 'USD' ? '$' : account.currency}
                        {(account.balance + monthlyStats.netPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                 </div>

                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden cursor-pointer" onClick={() => setIsAccountModalOpen(true)}>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Trader" alt="Avatar" className="w-full h-full" />
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex relative">
            {/* Center Stage */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {currentView === 'calendar' && (
                    <div className="h-full flex flex-col">
                        <CalendarView 
                            trades={trades} 
                            currentDate={currentDate} 
                            setCurrentDate={setCurrentDate} 
                        />
                    </div>
                )}
                
                {currentView === 'dashboard' && (
                   <div className="h-full flex flex-col">
                       <DashboardView trades={trades} />
                   </div>
                )}

                 {currentView === 'stats' && (
                   <div className="flex items-center justify-center h-full text-slate-500">
                       <div className="text-center">
                           <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                           <p>Detailed stats module coming soon...</p>
                       </div>
                   </div>
                )}
            </div>

            {/* Right Panel: Summary & AI (Desktop Only) */}
            <aside className="w-80 border-l border-slate-800 bg-[#0f172a] p-6 overflow-y-auto hidden xl:block">
                <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-6">Monthly Summary</h3>
                
                <div className="space-y-4 mb-8">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-xs block mb-1">Net P&L</span>
                        <span className={`text-2xl font-bold ${monthlyStats.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {monthlyStats.netPnL >= 0 ? '+' : ''}{account.currency === 'USD' ? '$' : account.currency}{monthlyStats.netPnL.toFixed(2)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                            <span className="text-slate-400 text-xs block mb-1">Win Rate</span>
                            <span className="text-xl font-bold text-white">
                                {monthlyStats.winRate.toFixed(0)}%
                            </span>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                            <span className="text-slate-400 text-xs block mb-1">Trades</span>
                            <span className="text-xl font-bold text-white">
                                {monthlyStats.tradeCount}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-6">
                    <div className="flex items-center justify-between mb-4">
                         <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-purple-400" />
                            AI Coach
                        </h3>
                    </div>
                   
                    {!aiAnalysis ? (
                         <button 
                            onClick={handleAIAnalysis}
                            disabled={isAnalyzing}
                            className="w-full py-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze My Month'}
                        </button>
                    ) : (
                        <div className="space-y-3 animate-fadeIn">
                            <div className="bg-slate-800/50 rounded-xl p-4 text-sm text-slate-300 leading-relaxed border border-purple-500/20">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-xs">{aiAnalysis}</pre>
                                </div>
                            </div>
                            <button 
                                onClick={() => setAiAnalysis(null)}
                                className="text-xs text-slate-500 hover:text-white underline w-full text-center"
                            >
                                Clear Analysis
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 px-6 py-2 flex justify-between items-center z-40 pb-safe">
            <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${currentView === 'dashboard' ? 'text-blue-500' : 'text-slate-500'}`}
            >
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-[10px] font-medium">Home</span>
            </button>
            <button 
                onClick={() => setCurrentView('calendar')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${currentView === 'calendar' ? 'text-blue-500' : 'text-slate-500'}`}
            >
                <Calendar className="w-6 h-6" />
                <span className="text-[10px] font-medium">Journal</span>
            </button>
            
            {/* Floating Add Button for Mobile */}
            <div className="relative -top-8">
                <button 
                    onClick={() => setIsTradeModalOpen(true)}
                    className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/40 border-4 border-[#0f172a] hover:scale-105 transition-transform"
                >
                    <Plus className="w-8 h-8" />
                </button>
            </div>

            <button 
                onClick={() => setCurrentView('stats')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${currentView === 'stats' ? 'text-blue-500' : 'text-slate-500'}`}
            >
                <BarChart3 className="w-6 h-6" />
                <span className="text-[10px] font-medium">Stats</span>
            </button>
            <button 
                onClick={() => handleAIAnalysis()} // Mobile AI Trigger
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isAnalyzing ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`}
            >
                <BrainCircuit className="w-6 h-6" />
                <span className="text-[10px] font-medium">Coach</span>
            </button>
        </div>

        {/* Mobile AI Result Modal (Simple Overlay) */}
        {aiAnalysis && (
            <div className="xl:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-800 w-full max-w-md rounded-2xl max-h-[80vh] flex flex-col shadow-2xl border border-slate-700">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-purple-400" />
                            AI Coach Analysis
                        </h3>
                        <button onClick={() => setAiAnalysis(null)} className="text-slate-400 hover:text-white p-2">✕</button>
                    </div>
                    <div className="p-4 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300">{aiAnalysis}</pre>
                    </div>
                </div>
            </div>
        )}

      </main>

      <TradeModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)} 
        onSave={handleAddTrade}
      />

      <AccountModal 
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleUpdateAccount}
        currentAccount={account}
      />
    </div>
  );
};

export default App;
