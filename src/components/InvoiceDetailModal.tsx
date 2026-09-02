import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice } from '../types';
import {
  X,
  Printer,
  Download,
  Send,
  CheckCircle2,
  Copy,
  Clock,
  Building,
  Mail,
  Zap,
  QrCode,
  ShieldCheck,
  FileDown,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';
import { exportInvoicePDF } from '../utils/pdfExport';

export const InvoiceDetailModal: React.FC = () => {
  const {
    selectedInvoiceForView,
    setSelectedInvoiceForView,
    businessProfile,
    markInvoicePaid,
    duplicateInvoice,
    sendInvoiceReminder,
  } = useAccounting();

  const [isEmailSentAnimation, setIsEmailSentAnimation] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  if (!selectedInvoiceForView) return null;

  const inv = selectedInvoiceForView;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      exportInvoicePDF(inv, businessProfile);
    } finally {
      setTimeout(() => setIsExportingPDF(false), 500);
    }
  };

  const handleSendEmail = () => {
    setIsEmailSentAnimation(true);
    sendInvoiceReminder(inv.id);
    setTimeout(() => {
      setIsEmailSentAnimation(false);
    }, 2000);
  };

  const statusColors: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sent: 'bg-blue-50 text-blue-700 border-blue-200',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="no-print px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 text-sm">{inv.invoiceNumber}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                statusColors[inv.status] || statusColors.draft
              }`}
            >
              {inv.status}
            </span>
            {inv.recurring?.isRecurring && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                <Zap className="w-2.5 h-2.5" />
                {inv.recurring.frequency}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {inv.status !== 'paid' && (
              <button
                onClick={() => markInvoicePaid(inv.id)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            <button
              onClick={handleSendEmail}
              disabled={isEmailSentAnimation}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Send className={`w-3.5 h-3.5 text-blue-600 ${isEmailSentAnimation ? 'animate-bounce' : ''}`} />
              <span>{isEmailSentAnimation ? 'Dispatched!' : 'Email Invoice'}</span>
            </button>

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
              onClick={() => setSelectedInvoiceForView(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50 text-slate-900 font-sans print:bg-white print:text-black">
          {/* Printable Invoice Page Canvas */}
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header: Company Profile & Invoice Big Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100 print:border-slate-300">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight print:text-black">
                  {businessProfile.companyName}
                </h2>
                <div className="text-xs text-slate-500 space-y-0.5 mt-1 print:text-slate-700">
                  <p>{businessProfile.address.street}</p>
                  <p>
                    {businessProfile.address.city}, {businessProfile.address.state} {businessProfile.address.zip}
                  </p>
                  <p>Tax / VAT ID: <span className="font-mono text-slate-700 print:text-black">{businessProfile.taxNumber}</span></p>
                  <p>{businessProfile.email} • {businessProfile.phone}</p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-2xl font-black text-emerald-700 tracking-wider block font-mono print:text-emerald-700">
                  INVOICE
                </span>
                <div className="text-xs text-slate-500 space-y-1 mt-1 print:text-slate-700 font-mono">
                  <p>
                    Invoice No:{' '}
                    <strong className="text-slate-800 print:text-black font-bold">{inv.invoiceNumber}</strong>
                  </p>
                  <p>Date of Issue: {inv.issueDate}</p>
                  <p>Payment Due: <strong className="text-slate-800 print:text-black">{inv.dueDate}</strong></p>
                </div>
              </div>
            </div>

            {/* Bill To & Payment Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 print:bg-slate-50 print:border-slate-300">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 print:text-slate-600">
                  Billed To
                </span>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-slate-900 text-sm print:text-black">
                    {inv.clientCompany || inv.clientName}
                  </p>
                  <p className="text-slate-600 print:text-slate-700">Attn: {inv.clientName}</p>
                  <p className="text-slate-500 print:text-slate-600">{inv.clientEmail}</p>
                  {inv.clientAddress && (
                    <p className="text-slate-500 text-[11px] mt-1 print:text-slate-600">{inv.clientAddress}</p>
                  )}
                </div>
              </div>

              <div className="sm:text-right flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 print:text-slate-600">
                    Total Amount Due
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono print:text-emerald-700">
                    {formatCurrency(inv.balanceDue, inv.currency)}
                  </div>
                  {inv.status === 'paid' && (
                    <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Paid in Full on {inv.paidAt ? inv.paidAt.split('T')[0] : inv.dueDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200/80 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                    <th className="py-2.5 px-4 font-semibold">Description</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Tax %</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white print:bg-white print:divide-slate-200">
                  {inv.lineItems.map((item) => (
                    <tr key={item.id} className="text-slate-800 print:text-black hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium">{item.description}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(item.unitPrice, inv.currency)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500 print:text-slate-600">
                        {item.taxRate}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 print:text-black">
                        {formatCurrency(item.amount, inv.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Calculations */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
              {/* Payment Remittance Details */}
              <div className="sm:max-w-xs space-y-2 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 print:bg-slate-50 print:border-slate-300">
                  <span className="font-bold text-slate-900 block mb-1 text-[11px] print:text-black">
                    Remittance & Bank Instructions:
                  </span>
                  <div className="space-y-0.5 text-slate-500 text-[11px] print:text-slate-700">
                    <p>Bank: {businessProfile.bankDetails.bankName}</p>
                    <p>Account Name: {businessProfile.bankDetails.accountName}</p>
                    <p>Account No: {businessProfile.bankDetails.accountNumber}</p>
                    <p>Routing / IBAN: {businessProfile.bankDetails.routingOrIban}</p>
                  </div>
                </div>
              </div>

              {/* Subtotal, Taxes & Balance */}
              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 print:text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-800 print:text-black">
                    {formatCurrency(inv.subtotal, inv.currency)}
                  </span>
                </div>

                {inv.discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount</span>
                    <span className="font-mono">-{formatCurrency(inv.discountTotal, inv.currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 print:text-slate-700">
                  <span>Tax Amount</span>
                  <span className="font-mono text-slate-800 print:text-black">
                    {formatCurrency(inv.taxTotal, inv.currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 print:border-slate-300 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm print:text-black">Total</span>
                  <span className="font-mono font-bold text-slate-900 text-sm print:text-black">
                    {formatCurrency(inv.totalAmount, inv.currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 print:text-slate-700">
                  <span>Amount Paid</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    {formatCurrency(inv.amountPaid, inv.currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 print:border-slate-300 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-base print:text-black">Balance Due</span>
                  <span className="font-mono font-extrabold text-emerald-700 text-base print:text-emerald-700">
                    {formatCurrency(inv.balanceDue, inv.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Notes */}
            {(inv.notes || inv.termsAndConditions) && (
              <div className="pt-4 border-t border-slate-100 print:border-slate-300 text-xs text-slate-500 space-y-1 print:text-slate-600">
                {inv.notes && <p><strong className="text-slate-700 print:text-black">Note:</strong> {inv.notes}</p>}
                {inv.termsAndConditions && (
                  <p><strong className="text-slate-700 print:text-black">Terms:</strong> {inv.termsAndConditions}</p>
                )}
              </div>
            )}
          </div>

          {/* Audit History Timeline (Hidden on Print) */}
          <div className="no-print max-w-3xl mx-auto mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Invoice Audit History & Delivery Log
            </h4>
            <div className="space-y-2">
              {inv.history.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-white rounded-2xl border border-slate-200/80 text-xs flex items-start justify-between gap-4 shadow-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{entry.action}</span>
                    {entry.note && <p className="text-[11px] text-slate-500 mt-0.5">{entry.note}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block">{entry.user}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
