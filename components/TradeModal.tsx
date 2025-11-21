import React, { useState } from 'react';
import { TradeType, TradeStatus, Trade } from '../types';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Trade>>({
    type: TradeType.LONG,
    status: TradeStatus.CLOSED,
    entryDate: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      ticker: formData.ticker?.toUpperCase() || 'UNK',
      entryDate: formData.entryDate || new Date().toISOString().split('T')[0],
      type: formData.type || TradeType.LONG,
      status: formData.status || TradeStatus.CLOSED,
      quantity: Number(formData.quantity) || 0,
      entryPrice: Number(formData.entryPrice) || 0,
      exitPrice: Number(formData.exitPrice) || 0,
      pnl: Number(formData.pnl) || 0,
      notes: formData.notes || '',
      setup: formData.setup || '',
    };

    // Auto-calc PnL if not provided but prices are
    if (newTrade.pnl === 0 && newTrade.exitPrice && newTrade.entryPrice) {
        if (newTrade.type === TradeType.LONG) {
            newTrade.pnl = (newTrade.exitPrice - newTrade.entryPrice) * newTrade.quantity;
        } else {
            newTrade.pnl = (newTrade.entryPrice - newTrade.exitPrice) * newTrade.quantity;
        }
    }

    onSave(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-white">Log New Trade</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Ticker</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. AAPL"
                value={formData.ticker || ''}
                onChange={e => setFormData({...formData, ticker: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
              <input 
                type="date" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.entryDate || ''}
                onChange={e => setFormData({...formData, entryDate: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as TradeType})}
                >
                    <option value={TradeType.LONG}>Long</option>
                    <option value={TradeType.SHORT}>Short</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Result</label>
                <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as TradeStatus})}
                >
                    <option value={TradeStatus.CLOSED}>Closed</option>
                    <option value={TradeStatus.OPEN}>Open</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Qty</label>
                <input 
                    type="number" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                    value={formData.quantity || ''}
                    onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Entry $</label>
                <input 
                    type="number" step="0.01"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                    value={formData.entryPrice || ''}
                    onChange={e => setFormData({...formData, entryPrice: parseFloat(e.target.value)})}
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Exit $</label>
                <input 
                    type="number" step="0.01"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                    value={formData.exitPrice || ''}
                    onChange={e => setFormData({...formData, exitPrice: parseFloat(e.target.value)})}
                />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Manual P&L (Optional)</label>
            <input 
                type="number" step="0.01"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none placeholder-slate-600"
                placeholder="Auto-calculated if left empty"
                value={formData.pnl || ''}
                onChange={e => setFormData({...formData, pnl: parseFloat(e.target.value)})}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
            <textarea 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none h-20 resize-none"
                placeholder="Why did you take this trade?"
                value={formData.notes || ''}
                onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white transition"
            >
                Cancel
            </button>
            <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition shadow-lg shadow-blue-600/20"
            >
                Save Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeModal;