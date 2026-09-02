import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, InvoiceStatus } from '../types';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Send,
  CheckCircle2,
  Copy,
  Trash2,
  Edit,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  Zap,
  Calendar,
  DollarSign,
  ArrowUpDown,
  Receipt,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const InvoicesView: React.FC<{
  onOpenAICreator: () => void;
}> = ({ onOpenAICreator }) => {
  const {
    invoices,
    selectedCurrency,
    setIsInvoiceModalOpen,
    setSelectedInvoiceForEdit,
    setSelectedInvoiceForView,
    deleteInvoice,
    markInvoicePaid,
    duplicateInvoice,
    sendInvoiceReminder,
    runAutomatedRecurringEngine,
    openPaymentModalForInvoice,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [onlyRecurring, setOnlyRecurring] = useState(false);
  const [sortField, setSortField] = useState<'issueDate' | 'dueDate' | 'totalAmount' | 'invoiceNumber'>('issueDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);

  // Filter & Search
  const filteredInvoices = invoices
    .filter((inv) => {
      if (selectedStatus !== 'all' && inv.status !== selectedStatus) return false;
      if (onlyRecurring && (!inv.recurring || !inv.recurring.isRecurring)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchClient = inv.clientName.toLowerCase().includes(q) || (inv.clientCompany || '').toLowerCase().includes(q);
        const matchEmail = inv.clientEmail.toLowerCase().includes(q);
        if (!matchNum && !matchClient && !matchEmail) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === 'totalAmount') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

  const handleRunAutomation = () => {
    setIsAutomationRunning(true);
    setTimeout(() => {
      runAutomatedRecurringEngine();
      setIsAutomationRunning(false);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Client', 'Company', 'Email', 'Issue Date', 'Due Date', 'Status', 'Total', 'Amount Paid', 'Balance Due', 'Recurring'];
    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber,
      `"${i.clientName}"`,
      `"${i.clientCompany || ''}"`,
      i.clientEmail,
      i.issueDate,
      i.dueDate,
      i.status,
      i.totalAmount.toFixed(2),
      i.amountPaid.toFixed(2),
      i.balanceDue.toFixed(2),
      i.recurring?.isRecurring ? i.recurring.frequency : 'No',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusPills: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Invoices', count: invoices.length },
    { id: 'draft', label: 'Drafts', count: invoices.filter((i) => i.status === 'draft').length },
    { id: 'sent', label: 'Sent / Pending', count: invoices.filter((i) => i.status === 'sent').length },
    { id: 'paid', label: 'Paid', count: invoices.filter((i) => i.status === 'paid').length },
    { id: 'overdue', label: 'Overdue', count: invoices.filter((i) => i.status === 'overdue').length },
  ];

  const totalOutstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.balanceDue, 0);

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Fast Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Invoicing & Automated Billing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client billing, recurring subscription schedules, and automated reminders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunAutomation}
            disabled={isAutomationRunning}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            title="Execute due recurring invoices"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isAutomationRunning ? 'animate-spin' : ''}`} />
            <span>Run Automation Engine</span>
          </button>

          <button
            onClick={onOpenAICreator}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Fast Invoice</span>
          </button>

          <button
            onClick={() => {
              setSelectedInvoiceForEdit(null);
              setIsInvoiceModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Invoiced (YTD)
          </span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {formatCurrency(totalPaid + totalOutstanding, selectedCurrency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{invoices.length} invoices generated</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Settled / Collected
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatCurrency(totalPaid, selectedCurrency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {invoices.filter((i) => i.status === 'paid').length} fully paid invoices
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Awaiting Collection
          </span>
          <div className="text-2xl font-extrabold text-amber-700 font-mono mt-1">
            {formatCurrency(totalOutstanding, selectedCurrency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {invoices.filter((i) => i.status === 'overdue').length} overdue for payment
          </div>
        </div>
      </div>

      {/* Controls & Search Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {statusPills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => {
                  setSelectedStatus(pill.id);
                  setOnlyRecurring(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === pill.id && !onlyRecurring
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {pill.label} ({pill.count})
              </button>
            ))}

            <button
              onClick={() => {
                setOnlyRecurring(!onlyRecurring);
                if (!onlyRecurring) setSelectedStatus('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                onlyRecurring
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Recurring Only</span>
            </button>
          </div>

          {/* Search Input & CSV Export */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice or client..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-colors shrink-0 shadow-xs"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200/80">
                <th
                  onClick={() => {
                    setSortField('invoiceNumber');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Invoice #</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Client / Company</th>
                <th
                  onClick={() => {
                    setSortField('issueDate');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Issued</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('dueDate');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('totalAmount');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Automation</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No invoices match your filter</p>
                    <p className="text-xs mt-1 text-slate-400">Try resetting search or create a new invoice.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const statusStyles: Record<string, string> = {
                    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    sent: 'bg-blue-50 text-blue-700 border-blue-200',
                    overdue: 'bg-rose-50 text-rose-700 border-rose-200',
                    draft: 'bg-slate-100 text-slate-700 border-slate-200',
                    cancelled: 'bg-slate-100 text-slate-500 border-slate-200 line-through',
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div className="font-semibold">{inv.clientCompany || inv.clientName}</div>
                        <div className="text-[11px] text-slate-500">{inv.clientEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{inv.issueDate}</td>
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={
                            inv.status === 'overdue' ? 'text-rose-700 font-semibold' : 'text-slate-700'
                          }
                        >
                          {inv.dueDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        <div>{formatCurrency(inv.totalAmount, inv.currency)}</div>
                        {inv.status !== 'paid' && inv.amountPaid > 0 && (
                          <div className="text-[10px] text-emerald-700 font-normal">
                            Paid: {formatCurrency(inv.amountPaid, inv.currency)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                            statusStyles[inv.status] || statusStyles.draft
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {inv.recurring?.isRecurring ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                            <Zap className="w-2.5 h-2.5" />
                            {inv.recurring.frequency}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">One-off</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View & Print Document */}
                          <button
                            onClick={() => setSelectedInvoiceForView(inv)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors"
                            title="View, Print & Download Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Record Payment / Issue Receipt */}
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => openPaymentModalForInvoice(inv)}
                              className="p-1.5 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors"
                              title="Record Payment & Issue Official Receipt"
                            >
                              <Receipt className="w-4 h-4 text-emerald-600" />
                            </button>
                          )}

                          {/* Mark as Paid */}
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => markInvoicePaid(inv.id)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors"
                              title="Quick Mark as Paid"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </button>
                          )}

                          {/* Send Reminder (if overdue or sent) */}
                          {(inv.status === 'sent' || inv.status === 'overdue') && (
                            <button
                              onClick={() => sendInvoiceReminder(inv.id)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-amber-700 rounded-lg transition-colors"
                              title="Send Payment Reminder Email"
                            >
                              <Send className="w-4 h-4 text-amber-600" />
                            </button>
                          )}

                          {/* Duplicate */}
                          <button
                            onClick={() => duplicateInvoice(inv.id)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-700 rounded-lg transition-colors"
                            title="Duplicate Invoice"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setSelectedInvoiceForEdit(inv);
                              setIsInvoiceModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
