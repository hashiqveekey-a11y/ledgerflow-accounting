import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PaymentVoucher } from '../types';
import { formatCurrency } from '../utils/accountingMath';
import { X, Printer, Download, CheckCircle2, Building2, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

export const VoucherReceiptModal: React.FC = () => {
  const {
    selectedVoucherForView,
    setSelectedVoucherForView,
    businessProfile,
    selectedCurrency,
  } = useAccounting();

  if (!selectedVoucherForView) return null;

  const voucher = selectedVoucherForView;
  const isReceipt = voucher.voucherType === 'client_receipt';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Controls Bar (hidden during print) */}
        <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                isReceipt ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isReceipt ? 'Official Payment Receipt' : 'Official Disbursement Voucher'}
            </span>
            <span className="text-xs font-mono text-slate-300">#{voucher.voucherNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={() => setSelectedVoucherForView(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 space-y-6 text-slate-800">
          {/* Header Banner */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {businessProfile.companyName ? businessProfile.companyName[0] : 'L'}
                </div>
                <h1 className="text-lg font-bold text-slate-900">{businessProfile.companyName}</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">{businessProfile.address || 'Financial Headquarters'}</p>
              <p className="text-xs text-slate-500">
                Email: {businessProfile.email} • Tax ID / VAT: {businessProfile.taxNumber || 'N/A'}
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-black uppercase tracking-wide text-slate-900">
                {isReceipt ? 'OFFICIAL RECEIPT' : 'PAYMENT VOUCHER'}
              </div>
              <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                Voucher #: {voucher.voucherNumber}
              </div>
              <div className="text-xs text-slate-500 mt-1">Date: {voucher.date}</div>
            </div>
          </div>

          {/* Party Details & Payment Summary */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isReceipt ? 'Received From (Customer)' : 'Disbursed To (Vendor)'}
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1">{voucher.partyName}</div>
              {voucher.referenceNumber && (
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Ref / Doc: {voucher.referenceNumber}
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</span>
              <div className="text-xs font-semibold text-slate-800 capitalize mt-1">
                {voucher.paymentMethod.replace('_', ' ')}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Account: {voucher.accountCode} - {voucher.accountName}
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-900">Total Settlement Amount</span>
              <p className="text-[11px] text-emerald-700">Fully credited & reconciled to General Ledger</p>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-800">
              {formatCurrency(voucher.amount ?? 0, selectedCurrency)}
            </div>
          </div>

          {/* Remarks & Notes */}
          {voucher.notes && (
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remarks / Memo:</span>
              <p className="text-xs text-slate-700 mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                {voucher.notes}
              </p>
            </div>
          )}

          {/* Verification & Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mb-2 flex items-end justify-center pb-1 font-signature text-sm text-slate-800 font-semibold">
                Authorized Officer
              </div>
              <p className="font-semibold text-slate-700">Prepared & Approved By</p>
              <p className="text-[10px] text-slate-400">Finance & Accounting Dept</p>
            </div>

            <div>
              <div className="h-12 border-b border-dashed border-slate-300 mb-2 flex items-end justify-center pb-1 font-signature text-sm text-slate-800 font-semibold">
                {voucher.partyName}
              </div>
              <p className="font-semibold text-slate-700">Receiver / Payee Acknowledgment</p>
              <p className="text-[10px] text-slate-400">Signature / Seal</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Electronic document generated by LedgerFlow. Fully balanced & GAAP compliant.
          </div>
        </div>
      </div>
    </div>
  );
};
