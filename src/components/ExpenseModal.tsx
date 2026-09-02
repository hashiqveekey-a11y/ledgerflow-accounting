import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Expense, ExpenseCategory } from '../types';
import {
  X,
  Plus,
  Receipt,
  Check,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  Building,
  FileText,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const ExpenseModal: React.FC<{
  expenseToEdit: Expense | null;
  onClose: () => void;
}> = ({ expenseToEdit, onClose }) => {
  const {
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    addExpense,
    updateExpense,
    selectedCurrency,
    businessProfile,
  } = useAccounting();

  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [taxAmount, setTaxAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('Software & SaaS');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'cash' | 'check'>('credit_card');
  const [taxDeductible, setTaxDeductible] = useState(true);
  const [taxDeductiblePercentage, setTaxDeductiblePercentage] = useState(100);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');

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

  useEffect(() => {
    if (!isExpenseModalOpen) return;

    if (expenseToEdit) {
      setPayee(expenseToEdit.payee);
      setAmount(expenseToEdit.amount);
      setTaxAmount(expenseToEdit.taxAmount || 0);
      setCategory(expenseToEdit.category);
      setDate(expenseToEdit.date);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setTaxDeductible(expenseToEdit.taxDeductible);
      setTaxDeductiblePercentage(expenseToEdit.taxDeductiblePercentage ?? 100);
      setReferenceNumber(expenseToEdit.referenceNumber || '');
      setNotes(expenseToEdit.notes || '');
      setReceiptFileName(expenseToEdit.receiptFileName || '');
    } else {
      setPayee('');
      setAmount('');
      setTaxAmount('');
      setCategory('Software & SaaS');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('credit_card');
      setTaxDeductible(true);
      setTaxDeductiblePercentage(100);
      setReferenceNumber(`EXP-${Date.now().toString().slice(-4)}`);
      setNotes('');
      setReceiptFileName('');
    }
  }, [isExpenseModalOpen, expenseToEdit]);

  // Adjust deductible percentage automatically if category is Travel & Meals
  const handleCategoryChange = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    if (newCat === 'Travel & Meals') {
      setTaxDeductiblePercentage(50);
    } else {
      setTaxDeductiblePercentage(100);
    }
  };

  const handleSave = () => {
    if (!payee.trim()) {
      alert('Please enter a vendor or payee name.');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    const payload = {
      expenseNumber: expenseToEdit ? expenseToEdit.expenseNumber : `EXP-${Date.now().toString().slice(-4)}`,
      payee,
      amount: numAmount,
      taxAmount: Number(taxAmount) || 0,
      category,
      date,
      paymentMethod,
      taxDeductible,
      taxDeductiblePercentage,
      status: 'posted' as const,
      referenceNumber,
      notes,
      receiptFileName: receiptFileName || undefined,
    };

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, payload);
    } else {
      addExpense(payload);
    }

    onClose();
  };

  if (!isExpenseModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>{expenseToEdit ? 'Edit Expense Record' : 'Log Business Expense'}</span>
            </h3>
            <p className="text-xs text-slate-500">Record cash outlays, vendor invoices, and tax attributes</p>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Payee / Vendor */}
          <div>
            <label className="text-slate-500 text-[10px] uppercase font-semibold">Vendor / Payee</label>
            <input
              type="text"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="e.g. Amazon Web Services, GitHub, Delta Airlines..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 mt-1"
            />
          </div>

          {/* Amount and Tax Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Total Amount</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Tax / VAT Included</label>
              <input
                type="number"
                min="0"
                step="any"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
          </div>

          {/* Category and Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 mt-1"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              >
                <option value="credit_card">Corporate Credit Card</option>
                <option value="bank_transfer">ACH / Bank Transfer</option>
                <option value="cash">Cash / Debit</option>
                <option value="check">Check</option>
              </select>
            </div>
          </div>

          {/* Date and Ref # */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Date of Expense</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Reference / Receipt #</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="INV-99402"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
          </div>

          {/* Tax Deductible Config */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxDeductible}
                  onChange={(e) => setTaxDeductible(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-400"
                />
                <span className="font-semibold text-slate-800">Tax Deductible Business Outlay</span>
              </label>

              {taxDeductible && (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {taxDeductiblePercentage}% Deductible
                </span>
              )}
            </div>

            {taxDeductible && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <span className="text-slate-500 text-[11px]">Deduction Rate:</span>
                <button
                  type="button"
                  onClick={() => setTaxDeductiblePercentage(100)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                    taxDeductiblePercentage === 100
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  100% (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setTaxDeductiblePercentage(50)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                    taxDeductiblePercentage === 50
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  50% (Meals/Client Dining)
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-500 text-[10px] uppercase font-semibold">Business Purpose & Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly cloud hosting for production environment..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 mt-1 text-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{expenseToEdit ? 'Update Expense' : 'Save Expense Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
