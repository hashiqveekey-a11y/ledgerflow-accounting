import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { BankTransaction } from '../types';
import {
  Landmark,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const BankReconciliationView: React.FC = () => {
  const {
    bankTransactions,
    reconcileBankTransaction,
    selectedCurrency,
    balanceSheet,
  } = useAccounting();

  const [filter, setFilter] = useState<'all' | 'unmatched' | 'matched'>('all');
  const [search, setSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredTransactions = bankTransactions.filter((tx) => {
    if (filter === 'unmatched' && tx.status !== 'unmatched') return false;
    if (filter === 'matched' && tx.status !== 'matched') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return tx.description.toLowerCase().includes(q) || tx.id.toLowerCase().includes(q);
    }
    return true;
  });

  const unmatchedCount = bankTransactions.filter((t) => t.status === 'unmatched').length;
  const matchedCount = bankTransactions.filter((t) => t.status === 'matched').length;

  const handleSyncFeed = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Bank Feed & Live Reconciliation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated double-entry matching of bank deposits to invoices and withdrawals to expense vouchers
          </p>
        </div>

        <button
          onClick={handleSyncFeed}
          disabled={isSyncing}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing Feed...' : 'Sync Bank Feed'}</span>
        </button>
      </div>

      {/* Bank Account Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Connected Bank Account</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="font-bold text-slate-900 text-sm">Silicon Valley Tech Bank</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">Checking •••• 8841</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Current Bank Balance
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatCurrency(balanceSheet.assets.currentAssets.cashAndEquivalents, selectedCurrency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Verified with live statement</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Reconciliation Health
          </span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {unmatchedCount === 0 ? '100% Reconciled' : `${unmatchedCount} Pending Match`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {matchedCount} transactions verified to general ledger
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              All Feeds ({bankTransactions.length})
            </button>
            <button
              onClick={() => setFilter('unmatched')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'unmatched'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              Unmatched ({unmatchedCount})
            </button>
            <button
              onClick={() => setFilter('matched')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === 'matched'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              Matched ({matchedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bank transactions..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200/80">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold">Matched Ledger Record</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-600">{tx.date}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{tx.description}</span>
                    </div>
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-bold ${
                      tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-800'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}
                    {formatCurrency(tx.amount, selectedCurrency)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {tx.matchedEntityId ? (
                      <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {tx.matchedEntityId} ({tx.matchedType})
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Unlinked bank item</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {tx.status === 'matched' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reconciled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Unmatched
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {tx.status === 'unmatched' ? (
                      <button
                        onClick={() => reconcileBankTransaction(tx.id)}
                        className="px-3 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-xs"
                      >
                        1-Click Match
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
