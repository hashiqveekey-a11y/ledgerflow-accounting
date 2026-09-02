import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { LedgerAccount, LedgerAccountType } from '../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Sparkles,
  Edit2,
  Trash2,
  Lock,
  ArrowUpRight,
  DollarSign,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';
import { LedgerAccountModal } from './LedgerAccountModal';

interface LedgerAccountsViewProps {
  onOpenAICopilot?: () => void;
}

export const LedgerAccountsView: React.FC<LedgerAccountsViewProps> = ({ onOpenAICopilot }) => {
  const { ledgerAccounts, deleteLedgerAccount, selectedCurrency } = useAccounting();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [accountToEdit, setAccountToEdit] = useState<LedgerAccount | null>(null);

  const filterOptions = [
    { id: 'all', label: 'All Accounts' },
    { id: 'asset', label: 'Assets (1000s)' },
    { id: 'liability', label: 'Liabilities (2000s)' },
    { id: 'equity', label: 'Equity (3000s)' },
    { id: 'revenue', label: 'Revenue (4000s)' },
    { id: 'expense', label: 'Expenses (5000s)' },
  ];

  const filteredAccounts = ledgerAccounts.filter((acc) => {
    const matchesFilter = selectedFilter === 'all' || acc.type === selectedFilter;
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.code.includes(searchQuery) ||
      acc.subtype.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleEdit = (acc: LedgerAccount) => {
    setAccountToEdit(acc);
    setIsAccountModalOpen(true);
  };

  const handleCreate = () => {
    setAccountToEdit(null);
    setIsAccountModalOpen(true);
  };

  const getTypeBadgeColor = (type: LedgerAccountType) => {
    switch (type) {
      case 'asset':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'liability':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'equity':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'revenue':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'expense':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              General Ledger & Chart of Accounts
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {ledgerAccounts.length} Active Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard GAAP Double-Entry ledger accounts mapped to Financial Statements and AI Automations.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenAICopilot && (
            <button
              onClick={onOpenAICopilot}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Ask AI to Add Ledger</span>
            </button>
          )}

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Ledger Account</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedFilter(opt.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedFilter === opt.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account code, name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Ledger Accounts Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Account Code</th>
                <th className="py-3 px-4">Account Name & Usage</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Financial Subtype</th>
                <th className="py-3 px-4 text-right">Ledger Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No ledger accounts found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "New Ledger Account" or ask AI Copilot to create one.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {acc.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900">{acc.name}</span>
                        {acc.isSystem && (
                          <span className="ml-2 px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded border border-slate-200">
                            Core
                          </span>
                        )}
                      </div>
                      {acc.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {acc.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getTypeBadgeColor(
                          acc.type
                        )}`}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {acc.subtype}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(acc.balance, selectedCurrency)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(acc)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Account"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!acc.isSystem && (
                          <button
                            onClick={() => deleteLedgerAccount(acc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ledger Account Modal */}
      <LedgerAccountModal
        isOpen={isAccountModalOpen}
        accountToEdit={accountToEdit}
        onClose={() => {
          setIsAccountModalOpen(false);
          setAccountToEdit(null);
        }}
      />
    </div>
  );
};
