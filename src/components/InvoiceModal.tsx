import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, LineItem, RecurringFrequency, CurrencyCode } from '../types';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Calendar,
  DollarSign,
  User,
  Building,
  Mail,
  Clock,
  Check,
} from 'lucide-react';
import { formatCurrency, CURRENCY_SYMBOLS } from '../utils/accountingMath';

export const InvoiceModal: React.FC = () => {
  const {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    selectedInvoiceForEdit,
    setSelectedInvoiceForEdit,
    clients,
    businessProfile,
    addInvoice,
    updateInvoice,
    generateInvoiceWithAI,
    selectedCurrency,
  } = useAccounting();

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent'>('sent');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  // Recurring Schedule State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('monthly');
  const [recurringNextRun, setRecurringNextRun] = useState('');
  const [recurringAutoSend, setRecurringAutoSend] = useState(true);

  // Populate when modal opens
  useEffect(() => {
    if (!isInvoiceModalOpen) return;

    if (selectedInvoiceForEdit) {
      // Edit mode
      setInvoiceNumber(selectedInvoiceForEdit.invoiceNumber);
      setClientId(selectedInvoiceForEdit.clientId);
      setClientName(selectedInvoiceForEdit.clientName);
      setClientCompany(selectedInvoiceForEdit.clientCompany || '');
      setClientEmail(selectedInvoiceForEdit.clientEmail);
      setClientAddress(selectedInvoiceForEdit.clientAddress || '');
      setIssueDate(selectedInvoiceForEdit.issueDate);
      setDueDate(selectedInvoiceForEdit.dueDate);
      setStatus(selectedInvoiceForEdit.status === 'draft' ? 'draft' : 'sent');
      setCurrency(selectedInvoiceForEdit.currency);
      setLineItems(selectedInvoiceForEdit.lineItems);
      setNotes(selectedInvoiceForEdit.notes || '');
      setTerms(selectedInvoiceForEdit.termsAndConditions || '');

      if (selectedInvoiceForEdit.recurring?.isRecurring) {
        setIsRecurring(true);
        setRecurringFrequency(selectedInvoiceForEdit.recurring.frequency);
        setRecurringNextRun(selectedInvoiceForEdit.recurring.nextRunDate);
        setRecurringAutoSend(selectedInvoiceForEdit.recurring.autoSend);
      } else {
        setIsRecurring(false);
        setRecurringFrequency('monthly');
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setRecurringNextRun(nextMonth.toISOString().split('T')[0]);
        setRecurringAutoSend(true);
      }
    } else {
      // New Invoice mode
      const nextNum = businessProfile.invoiceNextNumber;
      setInvoiceNumber(`${businessProfile.invoicePrefix}${nextNum}`);

      const todayStr = new Date().toISOString().split('T')[0];
      const dueStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      setIssueDate(todayStr);
      setDueDate(dueStr);
      setCurrency(selectedCurrency || businessProfile.defaultCurrency);
      setStatus('sent');
      setNotes('Thank you for your business! Please remit payment according to terms.');
      setTerms(businessProfile.paymentInstructions);

      // Default client
      if (clients.length > 0) {
        handleClientSelect(clients[0].id);
      } else {
        setClientId('');
        setClientName('');
        setClientCompany('');
        setClientEmail('');
        setClientAddress('');
      }

      setLineItems([
        {
          id: `li-${Date.now()}`,
          description: 'Software Engineering & Consulting Services',
          quantity: 1,
          unitPrice: 1500,
          taxRate: businessProfile.defaultTaxRate,
          discountPercent: 0,
          amount: 1500,
        },
      ]);

      setIsRecurring(false);
      setRecurringFrequency('monthly');
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setRecurringNextRun(nextMonth.toISOString().split('T')[0]);
      setRecurringAutoSend(true);
    }
  }, [isInvoiceModalOpen, selectedInvoiceForEdit]);

  const handleClientSelect = (id: string) => {
    setClientId(id);
    const selected = clients.find((c) => c.id === id);
    if (selected) {
      setClientName(selected.name);
      setClientCompany(selected.companyName);
      setClientEmail(selected.email);
      const addr = selected.address;
      setClientAddress(`${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}`);

      // Calculate due date based on client payment terms
      const issueDateObj = new Date(issueDate || Date.now());
      issueDateObj.setDate(issueDateObj.getDate() + (selected.paymentTermsDays || 30));
      setDueDate(issueDateObj.toISOString().split('T')[0]);
    }
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: businessProfile.defaultTaxRate,
        discountPercent: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const discount = Number(item.discountPercent) || 0;
      const discountedPrice = price * (1 - discount / 100);
      item.amount = Math.round(qty * discountedPrice * 100) / 100;

      updated[index] = item;
      return updated;
    });
  };

  // Math Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const discountTotal = lineItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const discount = Number(item.discountPercent) || 0;
    return sum + qty * price * (discount / 100);
  }, 0);
  const taxTotal = lineItems.reduce((sum, item) => {
    const discountedAmount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (1 - (Number(item.discountPercent) || 0) / 100);
    return sum + discountedAmount * ((Number(item.taxRate) || 0) / 100);
  }, 0);
  const totalAmount = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;

  // AI Generation Handler
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const result = await generateInvoiceWithAI(aiPrompt);
      if (result) {
        if (result.clientName) setClientName(result.clientName);
        if (result.clientEmail) setClientEmail(result.clientEmail);
        if (result.notes) setNotes(result.notes);
        if (result.termsAndConditions) setTerms(result.termsAndConditions);
        if (result.suggestedDueDateOffsetDays) {
          const dueObj = new Date();
          dueObj.setDate(dueObj.getDate() + result.suggestedDueDateOffsetDays);
          setDueDate(dueObj.toISOString().split('T')[0]);
        }
        if (Array.isArray(result.lineItems) && result.lineItems.length > 0) {
          setLineItems(
            result.lineItems.map((item: any, i: number) => ({
              id: `li-ai-${Date.now()}-${i}`,
              description: item.description || 'Consulting Services',
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.unitPrice) || 100,
              taxRate: Number(item.taxRate) ?? businessProfile.defaultTaxRate,
              discountPercent: Number(item.discountPercent) || 0,
              amount: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 100),
            }))
          );
        }
      }
      setShowAiAssistant(false);
      setAiPrompt('');
    } catch (err) {
      console.error('AI invoice error:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSave = (statusToSave: 'draft' | 'sent') => {
    if (!clientName.trim()) {
      alert('Please specify a client name.');
      return;
    }

    const payload = {
      invoiceNumber,
      clientId: clientId || `client-custom-${Date.now()}`,
      clientName,
      clientCompany,
      clientEmail: clientEmail || 'billing@client.com',
      clientAddress,
      issueDate,
      dueDate,
      status: statusToSave,
      currency,
      lineItems,
      subtotal,
      taxTotal,
      discountTotal,
      totalAmount,
      amountPaid: selectedInvoiceForEdit ? selectedInvoiceForEdit.amountPaid : 0,
      balanceDue: selectedInvoiceForEdit
        ? Math.max(0, totalAmount - selectedInvoiceForEdit.amountPaid)
        : totalAmount,
      notes,
      termsAndConditions: terms,
      recurring: isRecurring
        ? {
            isRecurring: true,
            frequency: recurringFrequency,
            nextRunDate: recurringNextRun,
            autoSend: recurringAutoSend,
            active: true,
          }
        : undefined,
    };

    if (selectedInvoiceForEdit) {
      updateInvoice(selectedInvoiceForEdit.id, payload);
    } else {
      addInvoice(payload);
    }

    setIsInvoiceModalOpen(false);
    setSelectedInvoiceForEdit(null);
  };

  if (!isInvoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{selectedInvoiceForEdit ? 'Edit Invoice' : 'Create New Invoice'}</span>
              <span className="font-mono text-emerald-700 font-semibold text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {invoiceNumber}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure line items, tax parameters, and automated recurring schedules
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Auto-Draft</span>
            </button>

            <button
              onClick={() => {
                setIsInvoiceModalOpen(false);
                setSelectedInvoiceForEdit(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* AI Invoice Prompt Card */}
          {showAiAssistant && (
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="font-bold text-slate-900 text-xs">AI Smart Invoice Assistant</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Type in natural English (e.g. "Bill Starlight Media $4,500 for monthly cloud DevOps + 15 hrs consulting at $120/hr, Net 15"):
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                  placeholder="e.g. Invoice Acme Corp for 40 hours of frontend React engineering at $110/hr..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={isAiGenerating || !aiPrompt.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAiGenerating ? 'Drafting...' : 'Generate'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Client & Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Information */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Client & Billing Entity
                </label>
                {clients.length > 0 && (
                  <select
                    value={clientId}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[11px] outline-none"
                  >
                    <option value="">Select Existing Client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName || c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 text-[10px] uppercase font-semibold">Contact Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-400 mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] uppercase font-semibold">Company Name</label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="e.g. Starlight Media"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-400 mt-0.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 text-[10px] uppercase font-semibold">Client Email (for Auto-Send)</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="billing@clientcompany.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-400 mt-0.5"
                />
              </div>

              <div>
                <label className="text-slate-500 text-[10px] uppercase font-semibold">Billing Address</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="350 5th Ave, New York, NY 10118"
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-slate-400 mt-0.5"
                />
              </div>
            </div>

            {/* Invoice Terms & Dates */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Invoice Terms & Dates
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 text-[10px] uppercase font-semibold">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-400 mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] uppercase font-semibold">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 mt-0.5"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CHF">CHF (Fr)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 text-[10px] uppercase font-semibold">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] uppercase font-semibold">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-0.5"
                  />
                </div>
              </div>

              {/* Recurring Schedule Switcher */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-400"
                    />
                    <span className="font-semibold text-slate-800">Set as Recurring Automated Invoice</span>
                  </label>
                  {isRecurring && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Auto Engine
                    </span>
                  )}
                </div>

                {isRecurring && (
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 animate-in fade-in">
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase font-semibold">Frequency</label>
                      <select
                        value={recurringFrequency}
                        onChange={(e) => setRecurringFrequency(e.target.value as RecurringFrequency)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-900 mt-0.5"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly (Every 2 wks)</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] uppercase font-semibold">Next Scheduled Run</label>
                      <input
                        type="date"
                        value={recurringNextRun}
                        onChange={(e) => setRecurringNextRun(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-900 font-mono mt-0.5"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Line Items & Services
              </h4>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200/80">
                    <th className="py-2.5 px-3 font-semibold w-5/12">Description</th>
                    <th className="py-2.5 px-2 font-semibold text-center w-1/12">Qty</th>
                    <th className="py-2.5 px-2 font-semibold text-right w-2/12">Unit Price</th>
                    <th className="py-2.5 px-2 font-semibold text-center w-1/12">Tax %</th>
                    <th className="py-2.5 px-2 font-semibold text-center w-1/12">Disc %</th>
                    <th className="py-2.5 px-3 font-semibold text-right w-2/12">Amount</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          placeholder="Item or service description..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 focus:outline-none focus:border-slate-400"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 text-center font-mono focus:outline-none focus:border-slate-400"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 text-right font-mono focus:outline-none focus:border-slate-400"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxRate}
                          onChange={(e) => handleLineItemChange(idx, 'taxRate', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-slate-900 text-center font-mono focus:outline-none focus:border-slate-400"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent || 0}
                          onChange={(e) => handleLineItemChange(idx, 'discountPercent', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-slate-900 text-center font-mono focus:outline-none focus:border-slate-400"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.amount, currency)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          disabled={lineItems.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <div>
                <label className="text-slate-500 text-[10px] uppercase font-semibold">Notes & Payment Details</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes to client (e.g. Thanks for your business!)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 mt-0.5 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-500 text-[10px] uppercase font-semibold">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Wire details, late fees, SLA terms..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 mt-0.5 text-xs"
                />
              </div>
            </div>

            {/* Subtotal & Tax Breakdown */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2 flex flex-col justify-center">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono text-slate-800">{formatCurrency(subtotal, currency)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span className="font-mono">-{formatCurrency(discountTotal, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Estimated Tax / VAT</span>
                <span className="font-mono text-slate-800">{formatCurrency(taxTotal, currency)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Total Due</span>
                <span className="font-mono font-extrabold text-emerald-700 text-lg">
                  {formatCurrency(totalAmount, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsInvoiceModalOpen(false);
              setSelectedInvoiceForEdit(null);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs transition-colors shadow-xs"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSave('sent')}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{selectedInvoiceForEdit ? 'Update & Finalize' : 'Create & Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
