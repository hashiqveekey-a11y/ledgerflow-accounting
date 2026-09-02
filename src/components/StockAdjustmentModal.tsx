import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { StockAdjustmentType, StockAdjustmentReason } from '../types';
import { X, ArrowUpDown, PlusCircle, MinusCircle, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

export const StockAdjustmentModal: React.FC = () => {
  const {
    isStockAdjustmentModalOpen,
    setIsStockAdjustmentModalOpen,
    selectedItemForAdjustment,
    setSelectedItemForAdjustment,
    adjustStock,
    selectedCurrency,
  } = useAccounting();

  const [type, setType] = useState<StockAdjustmentType>('increase');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<StockAdjustmentReason>('Received from Supplier / Purchase');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (selectedItemForAdjustment) {
      setUnitCost(selectedItemForAdjustment.unitCost);
      setQuantity(1);
      setType('increase');
      setReason('Received from Supplier / Purchase');
      setReferenceNumber(`ADJ-${Date.now().toString().slice(-4)}`);
      setNotes('');
    }
  }, [selectedItemForAdjustment, isStockAdjustmentModalOpen]);

  if (!isStockAdjustmentModalOpen || !selectedItemForAdjustment) return null;

  const handleClose = () => {
    setIsStockAdjustmentModalOpen(false);
    setSelectedItemForAdjustment(null);
  };

  const calculateNewQuantity = () => {
    if (type === 'increase') {
      return selectedItemForAdjustment.quantityOnHand + Math.abs(quantity);
    } else if (type === 'decrease') {
      return Math.max(0, selectedItemForAdjustment.quantityOnHand - Math.abs(quantity));
    } else {
      return Math.max(0, quantity);
    }
  };

  const newQty = calculateNewQuantity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 0) return;

    adjustStock(
      selectedItemForAdjustment.id,
      type,
      quantity,
      reason,
      unitCost,
      referenceNumber,
      notes
    );

    handleClose();
  };

  const reasonsList: StockAdjustmentReason[] = [
    'Received from Supplier / Purchase',
    'Customer Return Restock',
    'Physical Audit / Cycle Count',
    'Damaged / Defective Stock',
    'Expired Goods Write-off',
    'Internal Company Usage',
    'Lost / Theft Shrinkage',
    'Opening Inventory Setup',
    'Other Adjustment',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Adjust Stock Level</h2>
              <p className="text-xs text-slate-400">
                Record stock intake, write-offs, returns, or audit reconciliations.
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
          {/* Target Item summary badge */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">{selectedItemForAdjustment.name}</div>
              <div className="text-[11px] font-mono text-slate-500">
                SKU: {selectedItemForAdjustment.sku} • Location: {selectedItemForAdjustment.location || 'Warehouse'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Stock</div>
              <div className="text-sm font-bold font-mono text-slate-800">
                {selectedItemForAdjustment.quantityOnHand} {selectedItemForAdjustment.unit}
              </div>
            </div>
          </div>

          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adjustment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('increase');
                  setReason('Received from Supplier / Purchase');
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'increase'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className={`w-4 h-4 ${type === 'increase' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Stock In (+)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('decrease');
                  setReason('Damaged / Defective Stock');
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'decrease'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <MinusCircle className={`w-4 h-4 ${type === 'decrease' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Stock Out (-)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('set_exact');
                  setReason('Physical Audit / Cycle Count');
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'set_exact'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${type === 'set_exact' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Set Exact Qty</span>
              </button>
            </div>
          </div>

          {/* Adjustment Inputs: Quantity & Impact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {type === 'set_exact' ? 'New Exact Count' : 'Quantity to Adjust'} ({selectedItemForAdjustment.unit}) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Projected Resulting Stock</label>
              <div className="px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-between">
                <span>{newQty} {selectedItemForAdjustment.unit}</span>
                {newQty <= selectedItemForAdjustment.reorderLevel && (
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                    Low Stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Justification *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as StockAdjustmentReason)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {reasonsList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Valuation Unit Cost & Reference No */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Cost Valuation ({selectedCurrency})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Reference / PO / Doc #
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. PO-8821 or AUDIT-2026"
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Notes / Audit Trail</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide reason for physical inventory count adjustment or damaged batch ID..."
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              Confirm Stock Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
