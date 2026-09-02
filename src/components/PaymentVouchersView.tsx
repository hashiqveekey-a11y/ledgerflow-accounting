import React, { useState, useMemo } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PaymentVoucher, PaymentVoucherType, Invoice, PurchaseInvoice } from '../types';
import { formatCurrency } from '../utils/accountingMath';
import {
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Printer,
  Trash2,
  FileSpreadsheet,
  Download,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const PaymentVouchersView: React.FC = () => {
  const {
    paymentVouchers,
    deletePaymentVoucher,
    setIsPaymentVoucherModalOpen,
    setVoucherTypeToCreate,
    setSelectedVoucherForView,
    setPreselectedInvoiceForPayment,
    openPaymentModalForInvoice,
    openPaymentModalForPurchaseInvoice,
    invoices,
    purchaseInvoices,
    selectedCurrency,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<
    'all' | 'unpaid_invoices' | 'unpaid_bills' | 'receipts' | 'bill_payments'
  >('unpaid_invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Open invoices and bills
  const unpaidSalesInvoices = useMemo(
    () => invoices.filter((i) => (i.balanceDue > 0 || i.status !== 'paid') && i.status !== 'cancelled'),
    [invoices]
  );

  const unpaidPurchaseBills = useMemo(
    () => purchaseInvoices.filter((b) => (b.balanceDue > 0 || b.status !== 'paid') && b.status !== 'cancelled'),
    [purchaseInvoices]
  );

  const totalReceivablesDue = useMemo(
    () => unpaidSalesInvoices.reduce((acc, i) => acc + (i.balanceDue > 0 ? i.balanceDue : i.totalAmount), 0),
    [unpaidSalesInvoices]
  );

  const totalPayablesDue = useMemo(
    () => unpaidPurchaseBills.reduce((acc, b) => acc + (b.balanceDue > 0 ? b.balanceDue : b.totalAmount), 0),
    [unpaidPurchaseBills]
  );

  const filteredVouchers = useMemo(() => {
    return paymentVouchers.filter((v) => {
      const matchesSearch =
        v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.referenceNumber && v.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.notes && v.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'receipts'
          ? v.voucherType === 'client_receipt'
          : activeTab === 'bill_payments'
          ? v.voucherType === 'vendor_bill_payment'
          : true;

      const matchesMethod = methodFilter === 'all' || v.paymentMethod === methodFilter;

      return matchesSearch && matchesTab && matchesMethod;
    });
  }, [paymentVouchers, searchQuery, activeTab, methodFilter]);

  const filteredUnpaidInvoices = useMemo(() => {
    return unpaidSalesInvoices.filter((i) => {
      return (
        i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.clientCompany && i.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [unpaidSalesInvoices, searchQuery]);

  const filteredUnpaidBills = useMemo(() => {
    return unpaidPurchaseBills.filter((b) => {
      return (
        b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [unpaidPurchaseBills, searchQuery]);

  const totalReceipts = useMemo(
    () => paymentVouchers.filter((v) => v.voucherType === 'client_receipt').reduce((acc, v) => acc + v.amount, 0),
    [paymentVouchers]
  );

  const totalPayments = useMemo(
    () => paymentVouchers.filter((v) => v.voucherType === 'vendor_bill_payment').reduce((acc, v) => acc + v.amount, 0),
    [paymentVouchers]
  );

  const netCashBalance = totalReceipts - totalPayments;

  const handleCreateReceipt = () => {
    setVoucherTypeToCreate('client_receipt');
    setPreselectedInvoiceForPayment(null);
    setIsPaymentVoucherModalOpen(true);
  };

  const handleCreateBillPayment = () => {
    setVoucherTypeToCreate('vendor_bill_payment');
    setPreselectedInvoiceForPayment(null);
    setIsPaymentVoucherModalOpen(true);
  };

  const exportVouchersCSV = () => {
    const headers = ['Voucher No', 'Type', 'Date', 'Party Name', 'Amount', 'Payment Method', 'Reference', 'Account', 'Notes'];
    const rows = paymentVouchers.map((v) => [
      v.voucherNumber,
      v.voucherType === 'client_receipt' ? 'Customer Receipt' : 'Vendor Bill Payment',
      v.date,
      `"${v.partyName.replace(/"/g, '""')}"`,
      v.amount.toFixed(2),
      v.paymentMethod,
      v.referenceNumber || '',
      v.accountName || '',
      `"${(v.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payment_vouchers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            Payments & Receipts Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect open customer invoices, disburse vendor bill settlements, and audit payment vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportVouchersCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={handleCreateReceipt}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Record Receipt
          </button>
          <button
            onClick={handleCreateBillPayment}
            className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4" />
            Record Bill Payment
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('unpaid_invoices')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Unpaid Invoices Due (A/R)
            </span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
              {formatCurrency(totalReceivablesDue, selectedCurrency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {unpaidSalesInvoices.length} invoices awaiting payment
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('unpaid_bills')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Unpaid Vendor Bills (A/P)
            </span>
            <div className="text-xl font-bold font-mono text-amber-700 mt-1">
              {formatCurrency(totalPayablesDue, selectedCurrency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {unpaidPurchaseBills.length} vendor bills to pay
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('receipts')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Receipts Collected
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(totalReceipts, selectedCurrency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Recorded customer vouchers</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-400 transition-colors"
        >
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Settled Vouchers Log
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {paymentVouchers.length} Vouchers
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Reconciled in bank ledger</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tabs & Search Filter Header */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('unpaid_invoices')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'unpaid_invoices'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 bg-emerald-50/70 border border-emerald-200/70 hover:bg-emerald-100/60'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Unpaid Invoices ({unpaidSalesInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('unpaid_bills')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'unpaid_bills'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-slate-700 bg-amber-50/70 border border-amber-200/70 hover:bg-amber-100/60'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Unpaid Bills ({unpaidPurchaseBills.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              All Vouchers ({paymentVouchers.length})
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'receipts'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Receipts ({paymentVouchers.filter((v) => v.voucherType === 'client_receipt').length})
            </button>
            <button
              onClick={() => setActiveTab('bill_payments')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'bill_payments'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Bill Payments ({paymentVouchers.filter((v) => v.voucherType === 'vendor_bill_payment').length})
            </button>
          </div>

          {/* Search & Method Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice, party, voucher..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {(activeTab === 'all' || activeTab === 'receipts' || activeTab === 'bill_payments') && (
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-xl text-slate-700"
              >
                <option value="all">All Methods</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="stripe">Stripe</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: UNPAID SALES INVOICES */}
        {activeTab === 'unpaid_invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <th className="px-4 py-3">Invoice # & Status</th>
                  <th className="px-4 py-3">Client / Company</th>
                  <th className="px-4 py-3">Issue / Due Date</th>
                  <th className="px-4 py-3 text-right">Total Invoiced</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-900">Outstanding Balance</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUnpaidInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400 stroke-[1.5]" />
                      <p className="font-semibold text-slate-700 text-sm">All customer invoices are fully settled!</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        No outstanding unpaid sales invoices pending receipt collection.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUnpaidInvoices.map((inv) => {
                    const isOverdue = inv.status === 'overdue';
                    const isDraft = inv.status === 'draft';
                    const isPartial = (inv.amountPaid ?? 0) > 0;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Invoice # & Status */}
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-900">
                            #{inv.invoiceNumber}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                              isOverdue
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isPartial
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : isDraft
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {isOverdue && <AlertTriangle className="w-2.5 h-2.5" />}
                            {isPartial ? 'Partially Paid' : inv.status.toUpperCase()}
                          </span>
                        </td>

                        {/* Client / Company */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{inv.clientName}</div>
                          {inv.clientCompany && (
                            <div className="text-[11px] text-slate-400">{inv.clientCompany}</div>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="px-4 py-3">
                          <div className="text-slate-600 font-mono text-[11px]">Issued: {inv.issueDate}</div>
                          <div
                            className={`font-mono text-[11px] font-semibold ${
                              isOverdue ? 'text-rose-600' : 'text-slate-500'
                            }`}
                          >
                            Due: {inv.dueDate}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                          {formatCurrency(inv.totalAmount ?? 0, selectedCurrency)}
                        </td>

                        {/* Paid */}
                        <td className="px-4 py-3 text-right font-mono text-emerald-600">
                          {formatCurrency(inv.amountPaid ?? 0, selectedCurrency)}
                        </td>

                        {/* Balance Due */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-sm text-slate-900">
                          {formatCurrency(inv.balanceDue ?? inv.totalAmount, selectedCurrency)}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openPaymentModalForInvoice(inv)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            Record Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: UNPAID PURCHASE BILLS */}
        {activeTab === 'unpaid_bills' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <th className="px-4 py-3">Bill # & Status</th>
                  <th className="px-4 py-3">Vendor / Category</th>
                  <th className="px-4 py-3">Issue / Due Date</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-900">Outstanding Balance</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUnpaidBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400 stroke-[1.5]" />
                      <p className="font-semibold text-slate-700 text-sm">All vendor bills are fully settled!</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        No outstanding accounts payable bills pending payment disbursement.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUnpaidBills.map((bill) => {
                    const isOverdue = bill.status === 'overdue';

                    return (
                      <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Bill # & Status */}
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-900">
                            #{bill.billNumber}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                              isOverdue
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {bill.status.toUpperCase()}
                          </span>
                        </td>

                        {/* Vendor */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{bill.vendorName}</div>
                          {bill.category && (
                            <div className="text-[11px] text-slate-400">{bill.category}</div>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="px-4 py-3">
                          <div className="text-slate-600 font-mono text-[11px]">Issued: {bill.issueDate}</div>
                          <div
                            className={`font-mono text-[11px] font-semibold ${
                              isOverdue ? 'text-rose-600' : 'text-slate-500'
                            }`}
                          >
                            Due: {bill.dueDate}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                          {formatCurrency(bill.totalAmount ?? 0, selectedCurrency)}
                        </td>

                        {/* Paid */}
                        <td className="px-4 py-3 text-right font-mono text-emerald-600">
                          {formatCurrency(bill.amountPaid ?? 0, selectedCurrency)}
                        </td>

                        {/* Balance Due */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-sm text-slate-900">
                          {formatCurrency(bill.balanceDue ?? bill.totalAmount, selectedCurrency)}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openPaymentModalForPurchaseInvoice(bill)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Record Payment
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: RECORDED VOUCHERS LIST */}
        {(activeTab === 'all' || activeTab === 'receipts' || activeTab === 'bill_payments') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <th className="px-4 py-3">Voucher # & Type</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Customer / Vendor</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Reference / Doc #</th>
                  <th className="px-4 py-3 text-right">Settlement Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                      <p className="font-medium text-slate-600">No payment vouchers found</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Record a customer receipt or vendor bill settlement to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher) => {
                    const isReceipt = voucher.voucherType === 'client_receipt';
                    return (
                      <tr key={voucher.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Voucher Number & Type */}
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-900">{voucher.voucherNumber}</div>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                              isReceipt
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isReceipt ? (
                              <>
                                <ArrowDownLeft className="w-3 h-3" /> Receipt (Money In)
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="w-3 h-3" /> Bill Payment (Out)
                              </>
                            )}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 font-mono text-slate-600">{voucher.date}</td>

                        {/* Party */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{voucher.partyName}</div>
                          {voucher.notes && <div className="text-[11px] text-slate-400 truncate max-w-xs">{voucher.notes}</div>}
                        </td>

                        {/* Method */}
                        <td className="px-4 py-3">
                          <span className="capitalize px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold">
                            {voucher.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Reference */}
                        <td className="px-4 py-3 font-mono text-slate-600">
                          {voucher.referenceNumber || '—'}
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-sm">
                          <span className={isReceipt ? 'text-emerald-700' : 'text-amber-700'}>
                            {isReceipt ? '+' : '-'}{formatCurrency(voucher.amount, selectedCurrency)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedVoucherForView(voucher)}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" /> View / Slip
                            </button>
                            <button
                              onClick={() => deletePaymentVoucher(voucher.id)}
                              title="Delete Voucher"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}
      </div>
    </div>
  );
};
