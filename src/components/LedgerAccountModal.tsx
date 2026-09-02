import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { LedgerAccount, LedgerAccountType } from '../types';
import { X, BookOpen, Plus, Sparkles, Check, Info } from 'lucide-react';

interface LedgerAccountModalProps {
  isOpen: boolean;
  accountToEdit: LedgerAccount | null;
  onClose: () => void;
}

export const LedgerAccountModal: React.FC<LedgerAccountModalProps> = ({
  isOpen,
  accountToEdit,
  onClose,
}) => {
  const { addLedgerAccount, updateLedgerAccount, ledgerAccounts } = useAccounting();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<LedgerAccountType>('expense');
  const [subtype, setSubtype] = useState('Operating Expense');
  const [description, setDescription] = useState('');
  const [initialBalance, setInitialBalance] = useState<number>(0);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setCode(accountToEdit.code);
      setType(accountToEdit.type);
      setSubtype(accountToEdit.subtype);
      setDescription(accountToEdit.description || '');
      setInitialBalance(accountToEdit.balance || 0);
    } else {
      // Suggest code based on type
      setName('');
      setDescription('');
      setInitialBalance(0);
      suggestCodeForType('expense');
    }
  }, [accountToEdit, isOpen]);

  const suggestCodeForType = (accType: LedgerAccountType) => {
    setType(accType);
    let base = 5000;
    let defaultSub = 'Operating Expense';

    if (accType === 'asset') {
      base = 1000;
      defaultSub = 'Current Asset';
    } else if (accType === 'liability') {
      base = 2000;
      defaultSub = 'Current Liability';
    } else if (accType === 'equity') {
      base = 3000;
      defaultSub = 'Owner Equity';
    } else if (accType === 'revenue') {
      base = 4000;
      defaultSub = 'Operating Revenue';
    }

    setSubtype(defaultSub);

    // Find next available code in range
    const existingCodes = ledgerAccounts
      .filter((a) => a.type === accType)
      .map((a) => parseInt(a.code, 10))
      .filter((num) => !isNaN(num));

    const highest = existingCodes.length > 0 ? Math.max(...existingCodes) : base;
    const nextCode = (highest + 10).toString();
    setCode(nextCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (accountToEdit) {
      updateLedgerAccount(accountToEdit.id, {
        name,
        code,
        type,
        subtype,
        description,
      });
    } else {
      addLedgerAccount({
        name,
        code,
        type,
        subtype,
        balance: initialBalance,
        description,
        isSystem: false,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {accountToEdit ? 'Edit Ledger Account' : 'New General Ledger Account'}
              </h3>
              <p className="text-xs text-slate-500">
                Chart of Accounts • GAAP Structure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Classification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Category (GAAP)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(
                [
                  { type: 'asset', label: 'Asset', range: '1000s' },
                  { type: 'liability', label: 'Liability', range: '2000s' },
                  { type: 'equity', label: 'Equity', range: '3000s' },
                  { type: 'revenue', label: 'Revenue', range: '4000s' },
                  { type: 'expense', label: 'Expense', range: '5000s' },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => suggestCodeForType(item.type)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                    type === item.type
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-[10px] opacity-70 font-mono">{item.range}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Code & Name */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 5090"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cloud AI Hosting, R&D Services"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
                required
              />
            </div>
          </div>

          {/* Subtype */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Financial Statement Subtype
            </label>
            <input
              type="text"
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
              placeholder="e.g. Current Asset, Operating Expense, Cost of Sales"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Description / Usage
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify what transactions and journal items belong to this ledger account..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{accountToEdit ? 'Save Changes' : 'Create Ledger Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
