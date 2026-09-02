import React, { useState, useMemo } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PurchaseInvoice } from '../types';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  FileDown,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Building2,
  Receipt,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';
import { exportPurchaseInvoicePDF } from '../utils/pdfExport';

export const PurchaseInvoicesView: React.FC<{
  onOpenAICopilot: () => void;
}> = ({ onOpenAICopilot }) => {
  const {
    purchaseInvoices,
    selectedCurrency,
    businessProfile,
    setSelectedPurchaseInvoiceForView,
    setSelectedPurchaseInvoiceForEdit,
    setIsPurchaseInvoiceModalOpen,
    deletePurchaseInvoice,
    markPurchaseInvoicePaid,
    duplicatePurchaseInvoice,
    openPaymentModalForPurchaseInvoice,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'overdue' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    purchaseInvoices.forEach((inv) => {
      if (inv.category) set.add(inv.category);
    });
    return Array.from(set);
  }, [purchaseInvoices]);

  // Filtered Bills
  const filteredInvoices = useMemo(() => {
    return purchaseInvoices.filter((inv) => {
      const matchesSearch =
        inv.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.notes && inv.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || inv.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [purchaseInvoices, searchQuery, statusFilter, categoryFilter]);

  // Aggregate metrics
  const totalBillsAmount = useMemo(
    () => purchaseInvoices.reduce((sum, b) => sum + (b.status !== 'cancelled' ? b.totalAmount : 0), 0),
    [purchaseInvoices]
  );
  const totalUnpaidPayable = useMemo(
    () => purchaseInvoices.reduce((sum, b) => sum + (b.status !== 'paid' && b.status !== 'cancelled' ? b.balanceDue : 0), 0),
    [purchaseInvoices]
  );
  const totalPaidPayable = useMemo(
    () => purchaseInvoices.reduce((sum, b) => sum + b.amountPaid, 0),
    [purchaseInvoices]
  );
  const overdueCount = useMemo(
    () => purchaseInvoices.filter((b) => b.status === 'overdue').length,
    [purchaseInvoices]
  );

  const statusStyles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    cancelled: 'bg-slate-100 text-slate-400 border-slate-200',
  };

  const handleOpenNew = () => {
    setSelectedPurchaseInvoiceForEdit(null);
    setIsPurchaseInvoiceModalOpen(true);
  };

  const handleEdit = (inv: PurchaseInvoice) => {
    setSelectedPurchaseInvoiceForEdit(inv);
    setIsPurchaseInvoiceModalOpen(true);
  };

  const handleView = (inv: PurchaseInvoice) => {
    setSelectedPurchaseInvoiceForView(inv);
  };

  const handleExportPDF = (e: React.MouseEvent, inv: PurchaseInvoice) => {
    e.stopPropagation();
    exportPurchaseInvoicePDF(inv, businessProfile);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Purchase Invoices & Vendor Bills</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-semibold">
              {purchaseInvoices.length} {purchaseInvoices.length === 1 ? 'bill' : 'bills'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage procurement, incoming vendor billing, accounts payable tracking, and PDF tax vouchers
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenAICopilot}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Purchase Copilot</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Total Procurement</span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatCurrency(totalBillsAmount, selectedCurrency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">All vendor invoices logged</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Accounts Payable (Unpaid)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-700 font-mono">
            {formatCurrency(totalUnpaidPayable, selectedCurrency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Outstanding balances due</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Settled & Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono">
            {formatCurrency(totalPaidPayable, selectedCurrency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Cleared through cash/bank</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Overdue Bills</span>
            <AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-bold font-mono ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {overdueCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {overdueCount === 0 ? 'All bills up to date' : 'Require urgent settlement'}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bill #, vendor name, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto scrollbar-none">
            {(['all', 'pending', 'approved', 'paid', 'overdue', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills (if categories exist) */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === 'all'
                  ? 'bg-slate-200 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No purchase invoices found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {purchaseInvoices.length === 0
                ? 'Record your first vendor bill to track procurement costs, sales tax input credits, and accounts payable.'
                : 'No bills match your active filters or search keywords.'}
            </p>
            {purchaseInvoices.length === 0 && (
              <button
                onClick={handleOpenNew}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Purchase Invoice</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Bill Number</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Dates (Issue / Due)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => handleView(inv)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.billNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inv.vendorName}</span>
                      </div>
                      {inv.vendorEmail && (
                        <span className="text-[11px] text-slate-400 block">{inv.vendorEmail}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {inv.category || 'General Expense'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-slate-400">Due: {inv.dueDate}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          statusStyles[inv.status] || statusStyles.draft
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(inv.totalAmount, selectedCurrency)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {inv.balanceDue > 0 ? (
                        <span className="text-amber-700">{formatCurrency(inv.balanceDue, selectedCurrency)}</span>
                      ) : (
                        <span className="text-emerald-600">Settled ($0.00)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => openPaymentModalForPurchaseInvoice(inv)}
                            title="Make Payment / Record Payment Voucher"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}

                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => markPurchaseInvoicePaid(inv.id)}
                            title="Mark Settled / Paid"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={(e) => handleExportPDF(e, inv)}
                          title="Export PDF Voucher"
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleView(inv)}
                          title="View Bill Details"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleEdit(inv)}
                          title="Edit Bill"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => duplicatePurchaseInvoice(inv.id)}
                          title="Duplicate Bill"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deletePurchaseInvoice(inv.id)}
                          title="Delete Bill"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
