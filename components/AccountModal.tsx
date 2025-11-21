import React, { useState, useEffect } from 'react';
import { Account } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
  currentAccount: Account;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, currentAccount }) => {
  const [formData, setFormData] = useState<Account>(currentAccount);

  useEffect(() => {
    setFormData(currentAccount);
  }, [currentAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-white">Account Settings</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Broker / Prop Firm Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Starting Balance</label>
            <input 
              required
              type="number" 
              step="0.01"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.balance}
              onChange={e => setFormData({...formData, balance: parseFloat(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Currency</label>
            <select 
               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none"
               value={formData.currency}
               onChange={e => setFormData({...formData, currency: e.target.value})}
            >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD ($)</option>
            </select>
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
                Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;