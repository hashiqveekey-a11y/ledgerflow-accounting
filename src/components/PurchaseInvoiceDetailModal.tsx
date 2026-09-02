import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PurchaseInvoice } from '../types';
import {
  X,
  Printer,
  FileDown,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Receipt,
  Mail,
  Phone,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';
import { exportPurchaseInvoicePDF } from '../utils/pdfExport';

export const PurchaseInvoiceDetailModal: React.FC = () => {
  const {
    selectedPurchaseInvoiceForView,
    setSelectedPurchaseInvoiceForView,
    businessProfile,
    selectedCurrency,
    markPurchaseInvoicePaid,
  } = useAccounting();

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  if (!selectedPurchaseInvoiceForView) return null;

  const inv = selectedPurchaseInvoiceForView;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      exportPurchaseInvoicePDF(inv, businessProfile);
    } finally {
      setTimeout(() => setIsExportingPDF(false), 500);
    }
  };

  const statusStyles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    cancelled: 'bg-slate-100 text-slate-400 border-slate-200',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="no-print px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 text-sm">{inv.billNumber}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                statusStyles[inv.status] || statusStyles.draft
              }`}
            >
              {inv.status}
            </span>
            <span className="text-xs text-slate-500 font-medium ml-1">
              Vendor Voucher
            </span>
          </div>

          <div className="flex items-center gap-2">
            {inv.status !== 'paid' && (
              <button
                onClick={() => markPurchaseInvoicePaid(inv.id)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Settled</span>
              </button>
            )}

            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <FileDown className={`w-3.5 h-3.5 ${isExportingPDF ? 'animate-spin' : ''}`} />
              <span>{isExportingPDF ? 'Generating...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={() => setSelectedPurchaseInvoiceForView(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50 text-slate-900 font-sans print:bg-white print:text-black">
          {/* Printable Voucher Page Canvas */}
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header: Company & Vendor Bill Voucher Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100 print:border-slate-300">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Buyer / Billed To:
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight print:text-black">
                  {businessProfile.companyName}
                </h2>
                <div className="text-xs text-slate-500 space-y-0.5 mt-1 print:text-slate-700">
                  <p>{businessProfile.address.street}</p>
                  <p>
                    {businessProfile.address.city}, {businessProfile.address.state} {businessProfile.address.zip}
                  </p>
                  <p>Tax / VAT ID: <span className="font-mono text-slate-700 print:text-black">{businessProfile.taxNumber}</span></p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-2xl font-black text-slate-900 tracking-wider block font-mono">
                  PURCHASE INVOICE
                </span>
                <div className="text-xs text-slate-500 space-y-1 mt-1 print:text-slate-700 font-mono">
                  <p>
                    Bill #: <span className="font-bold text-slate-900 print:text-black">{inv.billNumber}</span>
                  </p>
                  <p>Issue Date: {inv.issueDate}</p>
                  <p>Due Date: {inv.dueDate}</p>
                  <p>Category: <span className="font-sans font-semibold text-slate-700">{inv.category || 'General'}</span></p>
                </div>
              </div>
            </div>

            {/* Vendor / Supplier Details Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Supplier / Vendor Details
                </span>
                <h3 className="text-sm font-bold text-slate-900">{inv.vendorName}</h3>
                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                  {inv.vendorEmail && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {inv.vendorEmail}</p>}
                  {inv.vendorPhone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {inv.vendorPhone}</p>}
                  {inv.vendorTaxId && <p className="font-mono text-[11px]">Tax ID: {inv.vendorTaxId}</p>}
                </div>
              </div>

              <div className="sm:text-right flex flex-col justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Status
                </span>
                <div className="font-mono font-bold text-lg text-slate-900">
                  {formatCurrency(inv.totalAmount, selectedCurrency)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Balance Due: <span className="font-bold text-amber-700">{formatCurrency(inv.balanceDue, selectedCurrency)}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">GL Ledger Account</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Tax %</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {inv.lineItems.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {item.description}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {item.ledgerAccountName || 'General Expense'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">
                        {formatCurrency(item.unitPrice, selectedCurrency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">{item.taxRate}%</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.amount, selectedCurrency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Calculation Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 max-w-sm space-y-1">
                {inv.notes && (
                  <div>
                    <span className="font-semibold text-slate-700 block">Notes & Internal Memo:</span>
                    <p className="mt-0.5 italic">{inv.notes}</p>
                  </div>
                )}
                <div className="pt-2 text-[11px] text-slate-400">
                  Verified for Accounts Payable and General Ledger input tax credit.
                </div>
              </div>

              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(inv.subtotal, selectedCurrency)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Input Tax / VAT Total</span>
                  <span className="font-mono">{formatCurrency(inv.taxTotal, selectedCurrency)}</span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Total Bill Amount</span>
                  <span className="font-mono">{formatCurrency(inv.totalAmount, selectedCurrency)}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                  <span>Amount Paid / Settled</span>
                  <span className="font-mono">{formatCurrency(inv.amountPaid, selectedCurrency)}</span>
                </div>

                <div className="flex justify-between text-amber-800 font-bold bg-amber-50/80 p-2 rounded-xl">
                  <span>Balance Due</span>
                  <span className="font-mono">{formatCurrency(inv.balanceDue, selectedCurrency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
