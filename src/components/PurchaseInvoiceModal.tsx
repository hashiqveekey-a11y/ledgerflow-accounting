import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PurchaseInvoice, PurchaseLineItem } from '../types';
import {
  X,
  Plus,
  Trash2,
  Building2,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
  Tag,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const PurchaseInvoiceModal: React.FC = () => {
  const {
    isPurchaseInvoiceModalOpen,
    setIsPurchaseInvoiceModalOpen,
    selectedPurchaseInvoiceForEdit,
    setSelectedPurchaseInvoiceForEdit,
    addPurchaseInvoice,
    updatePurchaseInvoice,
    selectedCurrency,
    ledgerAccounts,
  } = useAccounting();

  const isEditMode = !!selectedPurchaseInvoiceForEdit;

  const [billNumber, setBillNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorTaxId, setVendorTaxId] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [category, setCategory] = useState('Software, Cloud & SaaS');
  const [status, setStatus] = useState<'draft' | 'pending' | 'approved' | 'paid' | 'overdue'>('pending');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<PurchaseLineItem[]>([
    {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 8,
      ledgerAccountId: 'acc-5020',
      ledgerAccountName: 'Software, Cloud & SaaS Subscriptions',
      amount: 0,
    },
  ]);

  // Expense/Asset Ledger accounts
  const expenseLedgerAccounts = ledgerAccounts.filter(
    (a) => a.type === 'expense' || a.type === 'asset' || a.type === 'liability'
  );

  useEffect(() => {
    if (selectedPurchaseInvoiceForEdit) {
      setBillNumber(selectedPurchaseInvoiceForEdit.billNumber);
      setVendorName(selectedPurchaseInvoiceForEdit.vendorName);
      setVendorEmail(selectedPurchaseInvoiceForEdit.vendorEmail || '');
      setVendorTaxId(selectedPurchaseInvoiceForEdit.vendorTaxId || '');
      setVendorPhone(selectedPurchaseInvoiceForEdit.vendorPhone || '');
      setIssueDate(selectedPurchaseInvoiceForEdit.issueDate);
      setDueDate(selectedPurchaseInvoiceForEdit.dueDate);
      setCategory(selectedPurchaseInvoiceForEdit.category || 'General Expenses');
      setStatus(selectedPurchaseInvoiceForEdit.status);
      setNotes(selectedPurchaseInvoiceForEdit.notes || '');
      setLineItems(
        selectedPurchaseInvoiceForEdit.lineItems && selectedPurchaseInvoiceForEdit.lineItems.length > 0
          ? selectedPurchaseInvoiceForEdit.lineItems
          : [
              {
                id: `item-${Date.now()}`,
                description: 'Procurement Item',
                quantity: 1,
                unitPrice: selectedPurchaseInvoiceForEdit.subtotal || 0,
                taxRate: 8,
                ledgerAccountId: 'acc-5020',
                ledgerAccountName: 'Software & SaaS',
                amount: selectedPurchaseInvoiceForEdit.subtotal || 0,
              },
            ]
      );
    } else {
      // Auto-generate next bill number
      const randomBillNum = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
      setBillNumber(randomBillNum);
      setVendorName('');
      setVendorEmail('');
      setVendorTaxId('');
      setVendorPhone('');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
      setCategory('Software, Cloud & SaaS');
      setStatus('pending');
      setNotes('');
      setLineItems([
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 8,
          ledgerAccountId: 'acc-5020',
          ledgerAccountName: 'Software, Cloud & SaaS Subscriptions',
          amount: 0,
        },
      ]);
    }
  }, [selectedPurchaseInvoiceForEdit, isPurchaseInvoiceModalOpen]);

  if (!isPurchaseInvoiceModalOpen) return null;

  // Calculation helpers
  const handleItemChange = (index: number, field: keyof PurchaseLineItem, value: any) => {
    setLineItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) : item.quantity;
        const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
        item.amount = (qty || 0) * (price || 0);
      }

      if (field === 'ledgerAccountId') {
        const acc = ledgerAccounts.find((a) => a.id === value || a.code === value);
        if (acc) {
          item.ledgerAccountName = acc.name;
        }
      }

      next[index] = item;
      return next;
    });
  };

  const addItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 8,
        ledgerAccountId: 'acc-5020',
        ledgerAccountName: 'Software, Cloud & SaaS Subscriptions',
        amount: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, it) => sum + (it.amount || 0), 0);
  const taxTotal = lineItems.reduce((sum, it) => sum + (it.amount || 0) * ((it.taxRate || 0) / 100), 0);
  const totalAmount = subtotal + taxTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorName.trim()) {
      alert('Please provide a vendor name.');
      return;
    }

    if (!billNumber.trim()) {
      alert('Please enter a bill / purchase invoice number.');
      return;
    }

    const payload = {
      billNumber: billNumber.trim(),
      vendorName: vendorName.trim(),
      vendorEmail: vendorEmail.trim() || undefined,
      vendorTaxId: vendorTaxId.trim() || undefined,
      vendorPhone: vendorPhone.trim() || undefined,
      issueDate,
      dueDate,
      status,
      currency: selectedCurrency,
      category,
      lineItems: lineItems.map((it) => ({
        ...it,
        description: it.description.trim() || 'Procurement Line Item',
      })),
      subtotal,
      taxTotal,
      totalAmount,
      amountPaid: isEditMode && selectedPurchaseInvoiceForEdit ? selectedPurchaseInvoiceForEdit.amountPaid : 0,
      balanceDue:
        isEditMode && selectedPurchaseInvoiceForEdit
          ? Math.max(0, totalAmount - selectedPurchaseInvoiceForEdit.amountPaid)
          : totalAmount,
      notes: notes.trim() || undefined,
    };

    if (isEditMode && selectedPurchaseInvoiceForEdit) {
      updatePurchaseInvoice(selectedPurchaseInvoiceForEdit.id, payload);
    } else {
      addPurchaseInvoice(payload);
    }

    setIsPurchaseInvoiceModalOpen(false);
    setSelectedPurchaseInvoiceForEdit(null);
  };

  const handleClose = () => {
    setIsPurchaseInvoiceModalOpen(false);
    setSelectedPurchaseInvoiceForEdit(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEditMode ? 'Edit Purchase Invoice' : 'New Purchase Invoice / Vendor Bill'}
            </h2>
            <p className="text-xs text-slate-500">
              Log incoming procurement, categorize general ledger accounts, and calculate input taxes
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Bill / Reference # <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="e.g. BILL-4920"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Vendor / Supplier Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. AWS Cloud Services LLC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              >
                <option value="Software, Cloud & SaaS">Software, Cloud & SaaS</option>
                <option value="Office Supplies & Equipment">Office Supplies & Equipment</option>
                <option value="Legal & Professional Fees">Legal & Professional Fees</option>
                <option value="Marketing & Advertising">Marketing & Advertising</option>
                <option value="Hosting & Infrastructure">Hosting & Infrastructure</option>
                <option value="Travel & Meals">Travel & Meals</option>
                <option value="Inventory & Materials">Inventory & Materials</option>
                <option value="Other Operating Expense">Other Operating Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Vendor Email
              </label>
              <input
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="invoices@vendor.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Vendor Tax / VAT ID
              </label>
              <input
                type="text"
                value={vendorTaxId}
                onChange={(e) => setVendorTaxId(e.target.value)}
                placeholder="e.g. US-88291048"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium"
              >
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved for Payment</option>
                <option value="paid">Paid / Settled</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Due Date (AP Schedule)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Line Items & General Ledger Allocation
              </span>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {lineItems.map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-slate-50/50 space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        type="text"
                        required
                        placeholder="Item / service description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
                        />
                      </div>
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-slate-400 font-mono"
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right font-mono font-bold text-slate-900 text-xs">
                      {formatCurrency(item.amount, selectedCurrency)}
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={lineItems.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sub-row for Tax & Ledger Account */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">GL Account:</span>
                      <select
                        value={item.ledgerAccountId || 'acc-5020'}
                        onChange={(e) => handleItemChange(idx, 'ledgerAccountId', e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:outline-hidden focus:border-slate-400"
                      >
                        {expenseLedgerAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Tax Rate %:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(idx, 'taxRate', Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 font-mono focus:outline-hidden focus:border-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5 max-w-xs ml-auto text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-medium">{formatCurrency(subtotal, selectedCurrency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (VAT/GST)</span>
              <span className="font-mono font-medium">{formatCurrency(taxTotal, selectedCurrency)}</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Bill</span>
              <span className="font-mono">{formatCurrency(totalAmount, selectedCurrency)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Internal Notes / Purchase Order Reference
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. PO #8891, annual software renewal approved by management..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Update Bill' : 'Save Purchase Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
