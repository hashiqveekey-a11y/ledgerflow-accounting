import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Expense, ExpenseCategory } from '../types';
import {
  Plus,
  Search,
  Receipt,
  Sparkles,
  Filter,
  Download,
  Trash2,
  Edit,
  Tag,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const ExpensesView: React.FC<{
  onOpenReceiptScanner: () => void;
  onEditExpense: (expense: Expense) => void;
}> = ({ onOpenReceiptScanner, onEditExpense }) => {
  const {
    expenses,
    selectedCurrency,
    setIsExpenseModalOpen,
    deleteExpense,
    profitAndLoss,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyTaxDeductible, setOnlyTaxDeductible] = useState(false);
  const [selectedReceiptPreview, setSelectedReceiptPreview] = useState<string | null>(null);

  const categories: ExpenseCategory[] = [
    'Software & SaaS',
    'Rent & Facilities',
    'Office Supplies & Equipment',
    'Travel & Meals',
    'Contractor & Payroll',
    'Advertising & Marketing',
    'Utilities & Internet',
    'Legal & Professional',
    'Banking & Payment Fees',
    'Insurance',
    'Research & Development',
    'Other Expenses',
  ];

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;
    if (onlyTaxDeductible && !exp.taxDeductible) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPayee = exp.payee.toLowerCase().includes(q);
      const matchNum = exp.expenseNumber.toLowerCase().includes(q);
      const matchNotes = (exp.notes || '').toLowerCase().includes(q);
      if (!matchPayee && !matchNum && !matchNotes) return false;
    }
    return true;
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductibleAmount = expenses
    .filter((e) => e.taxDeductible)
    .reduce((sum, e) => sum + e.amount * ((e.taxDeductiblePercentage || 100) / 100), 0);

  const handleExportCSV = () => {
    const headers = ['Expense #', 'Payee / Vendor', 'Category', 'Date', 'Amount', 'Tax Amount', 'Tax Deductible', 'Deductible %', 'Payment Method', 'Notes'];
    const rows = filteredExpenses.map((e) => [
      e.expenseNumber,
      `"${e.payee}"`,
      `"${e.category}"`,
      e.date,
      e.amount.toFixed(2),
      e.taxAmount.toFixed(2),
      e.taxDeductible ? 'Yes' : 'No',
      `${e.taxDeductiblePercentage || 100}%`,
      e.paymentMethod,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Expense Tracking & Receipts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log vendor expenditures, attach digitized receipts, and calculate tax deductions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenReceiptScanner}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Receipt Scanner</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Logged Expenses
          </span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {formatCurrency(totalExpenseAmount, selectedCurrency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{expenses.length} operating disbursements</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Tax Deductible Total
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatCurrency(totalDeductibleAmount, selectedCurrency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Schedule C / Corporate deductible</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Receipt Attachments
          </span>
          <div className="text-2xl font-extrabold text-teal-700 font-mono mt-1">
            {expenses.filter((e) => e.receiptFileName || e.receiptUrl).length} / {expenses.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Audit-ready documentation stored</div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Dropdown & Deductible Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl outline-none"
            >
              <option value="all">All Expense Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={() => setOnlyTaxDeductible(!onlyTaxDeductible)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                onlyTaxDeductible
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Deductible Only
            </button>
          </div>

          {/* Search & Export */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor or receipt..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-colors shadow-xs"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200/80">
                <th className="py-3 px-4 font-semibold">Expense #</th>
                <th className="py-3 px-4 font-semibold">Payee / Vendor</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Tax Deductible</th>
                <th className="py-3 px-4 font-semibold text-center">Receipt</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No expenses found</p>
                    <p className="text-xs mt-1 text-slate-400">Try clearing your search query or log a new expense.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{exp.expenseNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>{exp.payee}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-500 font-normal line-clamp-1">{exp.notes}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{exp.date}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(exp.amount, selectedCurrency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {exp.taxDeductible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {exp.taxDeductiblePercentage || 100}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Non-deductible</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {exp.receiptFileName || exp.receiptUrl ? (
                        <button
                          onClick={() =>
                            setSelectedReceiptPreview(
                              exp.receiptUrl ||
                                'https://images.unsplash.com/photo-1554415707-9e49019aab84?w=800&auto=format&fit=crop&q=80'
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-800 underline font-medium"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>{exp.receiptFileName || 'Receipt.pdf'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete expense ${exp.expenseNumber}?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Image Preview Modal */}
      {selectedReceiptPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Receipt Document Attachment</span>
              <button
                onClick={() => setSelectedReceiptPreview(null)}
                className="p-1 text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-96">
              <img
                src={selectedReceiptPreview}
                alt="Receipt"
                className="max-h-96 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-right">
              <button
                onClick={() => setSelectedReceiptPreview(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
