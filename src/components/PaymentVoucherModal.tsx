import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PaymentVoucherType, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/accountingMath';
import { X, CreditCard, ArrowDownLeft, ArrowUpRight, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const PaymentVoucherModal: React.FC = () => {
  const {
    isPaymentVoucherModalOpen,
    setIsPaymentVoucherModalOpen,
    voucherTypeToCreate,
    setVoucherTypeToCreate,
    preselectedInvoiceForPayment,
    setPreselectedInvoiceForPayment,
    addPaymentVoucher,
    invoices,
    purchaseInvoices,
    clients,
    businessProfile,
    selectedCurrency,
  } = useAccounting();

  const [voucherType, setVoucherType] = useState<PaymentVoucherType>('client_receipt');
  const [partyId, setPartyId] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [relatedInvoiceId, setRelatedInvoiceId] = useState<string>('');
  const [relatedPurchaseInvoiceId, setRelatedPurchaseInvoiceId] = useState<string>('');
  const [voucherNumber, setVoucherNumber] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isPaymentVoucherModalOpen) {
      setVoucherType(voucherTypeToCreate);
      setDate(new Date().toISOString().split('T')[0]);

      if (voucherTypeToCreate === 'client_receipt') {
        const nextNum = businessProfile.receiptNextNumber || 1001;
        setVoucherNumber(`REC-${nextNum}`);

        if (preselectedInvoiceForPayment && 'invoiceNumber' in preselectedInvoiceForPayment) {
          const inv = preselectedInvoiceForPayment;
          setPartyId(inv.clientId);
          setPartyName(inv.clientName);
          setRelatedInvoiceId(inv.id);
          setAmount(inv.balanceDue);
          setReferenceNumber(`INV-${inv.invoiceNumber}`);
          setNotes(`Payment settlement for Invoice ${inv.invoiceNumber}`);
        } else {
          setPartyId('');
          setPartyName('');
          setRelatedInvoiceId('');
          setAmount(0);
          setReferenceNumber('');
          setNotes('');
        }
      } else {
        const nextNum = businessProfile.paymentNextNumber || 1001;
        setVoucherNumber(`PAY-${nextNum}`);

        if (preselectedInvoiceForPayment && 'billNumber' in preselectedInvoiceForPayment) {
          const bill = preselectedInvoiceForPayment;
          setPartyName(bill.vendorName);
          setRelatedPurchaseInvoiceId(bill.id);
          setAmount(bill.balanceDue);
          setReferenceNumber(`BILL-${bill.billNumber}`);
          setNotes(`Disbursement payment for Bill ${bill.billNumber}`);
        } else {
          setPartyId('');
          setPartyName('');
          setRelatedPurchaseInvoiceId('');
          setAmount(0);
          setReferenceNumber('');
          setNotes('');
        }
      }
    }
  }, [isPaymentVoucherModalOpen, voucherTypeToCreate, preselectedInvoiceForPayment, businessProfile]);

  if (!isPaymentVoucherModalOpen) return null;

  const handleClose = () => {
    setIsPaymentVoucherModalOpen(false);
    setPreselectedInvoiceForPayment(null);
  };

  const handleTypeChange = (type: PaymentVoucherType) => {
    setVoucherType(type);
    setVoucherTypeToCreate(type);
    setRelatedInvoiceId('');
    setRelatedPurchaseInvoiceId('');
    setAmount(0);
    if (type === 'client_receipt') {
      const nextNum = businessProfile.receiptNextNumber || 1001;
      setVoucherNumber(`REC-${nextNum}`);
    } else {
      const nextNum = businessProfile.paymentNextNumber || 1001;
      setVoucherNumber(`PAY-${nextNum}`);
    }
  };

  // Open invoices eligible for receipt (balanceDue > 0 or status not paid/cancelled)
  const unpaidSalesInvoices = invoices.filter(
    (i) => (i.balanceDue > 0 || i.status !== 'paid') && i.status !== 'cancelled'
  );
  // Open purchase invoices eligible for payment
  const unpaidPurchaseBills = purchaseInvoices.filter(
    (b) => (b.balanceDue > 0 || b.status !== 'paid') && b.status !== 'cancelled'
  );

  const selectedInvoiceObj = invoices.find((i) => i.id === relatedInvoiceId);
  const selectedBillObj = purchaseInvoices.find((b) => b.id === relatedPurchaseInvoiceId);

  const handleSelectSalesInvoice = (invId: string) => {
    setRelatedInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setPartyId(inv.clientId);
      setPartyName(inv.clientName);
      setAmount(inv.balanceDue > 0 ? inv.balanceDue : inv.totalAmount);
      setReferenceNumber(`INV-${inv.invoiceNumber}`);
      setNotes(`Payment settlement for Invoice #${inv.invoiceNumber}`);
    }
  };

  const handleSelectPurchaseBill = (billId: string) => {
    setRelatedPurchaseInvoiceId(billId);
    const bill = purchaseInvoices.find((b) => b.id === billId);
    if (bill) {
      setPartyName(bill.vendorName);
      setAmount(bill.balanceDue > 0 ? bill.balanceDue : bill.totalAmount);
      setReferenceNumber(`BILL-${bill.billNumber}`);
      setNotes(`Vendor disbursement for Bill #${bill.billNumber}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    addPaymentVoucher({
      voucherNumber,
      voucherType,
      date,
      partyId: partyId || undefined,
      partyName: partyName || (voucherType === 'client_receipt' ? 'General Customer' : 'General Vendor'),
      relatedInvoiceId: voucherType === 'client_receipt' ? relatedInvoiceId || undefined : undefined,
      relatedPurchaseInvoiceId: voucherType === 'vendor_bill_payment' ? relatedPurchaseInvoiceId || undefined : undefined,
      amount,
      paymentMethod,
      referenceNumber: referenceNumber || undefined,
      accountCode: '1010',
      accountName: 'Operating Checking Account',
      notes: notes || undefined,
    });

    handleClose();
  };

  const paymentMethods: { id: PaymentMethod; label: string }[] = [
    { id: 'bank_transfer', label: 'Bank Wire / ACH' },
    { id: 'credit_card', label: 'Credit Card / POS' },
    { id: 'cash', label: 'Cash Receipt' },
    { id: 'check', label: 'Company Check' },
    { id: 'stripe', label: 'Stripe Gateway' },
    { id: 'paypal', label: 'PayPal Account' },
    { id: 'other', label: 'Other Settlement' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                voucherType === 'client_receipt'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {voucherType === 'client_receipt' ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold">
                {voucherType === 'client_receipt' ? 'Record Customer Receipt' : 'Record Vendor Bill Payment'}
              </h2>
              <p className="text-xs text-slate-400">
                {voucherType === 'client_receipt'
                  ? 'Issue official receipt & credit customer invoice balance.'
                  : 'Disburse funds to vendor & settle open accounts payable bill.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('client_receipt')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                voucherType === 'client_receipt'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              Customer Receipt (Money In)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('vendor_bill_payment')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                voucherType === 'vendor_bill_payment'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
              Vendor Bill Payment (Money Out)
            </button>
          </div>

          {/* Voucher Number & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {voucherType === 'client_receipt' ? 'Receipt Voucher #' : 'Payment Voucher #'} *
              </label>
              <input
                type="text"
                required
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Payment Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Invoice / Bill Association */}
          {voucherType === 'client_receipt' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Unpaid Sales Invoice to Settle ({unpaidSalesInvoices.length} Available)
                </label>
                {unpaidSalesInvoices.length === 0 && (
                  <span className="text-[11px] text-amber-600 font-medium">No open unpaid invoices</span>
                )}
              </div>
              <select
                value={relatedInvoiceId}
                onChange={(e) => handleSelectSalesInvoice(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">-- Direct Customer Receipt (Unlinked) --</option>
                {unpaidSalesInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    Invoice #{inv.invoiceNumber} • {inv.clientName} • Outstanding: {formatCurrency(inv.balanceDue, selectedCurrency)} ({inv.status.toUpperCase()})
                  </option>
                ))}
              </select>

              {selectedInvoiceObj && (
                <div className="mt-2 p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-900">Invoice #{selectedInvoiceObj.invoiceNumber}</span>
                    <span className="text-emerald-700 ml-1.5">• Due: {selectedInvoiceObj.dueDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-semibold">Balance Due: </span>
                    <span className="font-mono font-bold text-emerald-900">
                      {formatCurrency(selectedInvoiceObj.balanceDue, selectedCurrency)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Unpaid Purchase Bill to Pay ({unpaidPurchaseBills.length} Available)
                </label>
                {unpaidPurchaseBills.length === 0 && (
                  <span className="text-[11px] text-amber-600 font-medium">No open unpaid bills</span>
                )}
              </div>
              <select
                value={relatedPurchaseInvoiceId}
                onChange={(e) => handleSelectPurchaseBill(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">-- Direct Vendor Disbursement (Unlinked) --</option>
                {unpaidPurchaseBills.map((bill) => (
                  <option key={bill.id} value={bill.id}>
                    Bill #{bill.billNumber} • {bill.vendorName} • Outstanding: {formatCurrency(bill.balanceDue, selectedCurrency)} ({bill.status.toUpperCase()})
                  </option>
                ))}
              </select>

              {selectedBillObj && (
                <div className="mt-2 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-900">Bill #{selectedBillObj.billNumber}</span>
                    <span className="text-amber-700 ml-1.5">• Due: {selectedBillObj.dueDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-700 font-semibold">Balance Due: </span>
                    <span className="font-mono font-bold text-amber-900">
                      {formatCurrency(selectedBillObj.balanceDue, selectedCurrency)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Party Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {voucherType === 'client_receipt' ? 'Customer / Client Name' : 'Vendor / Supplier Name'} *
            </label>
            <input
              type="text"
              required
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder={voucherType === 'client_receipt' ? 'e.g. Acme Corporation' : 'e.g. Tech Supplies Inc.'}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Amount and Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Payment Amount ({selectedCurrency}) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference Number & Account */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Ref / Check / Transaction ID
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. CHK-9902 or TXN-4418"
                className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit / Credit Account</label>
              <input
                type="text"
                disabled
                value="1010 - Operating Checking Account"
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
              />
            </div>
          </div>

          {/* Memo / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Memo / Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal memo, clearance remarks, wire verification..."
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 ${
                voucherType === 'client_receipt'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {voucherType === 'client_receipt' ? 'Record & Issue Receipt' : 'Record Bill Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
