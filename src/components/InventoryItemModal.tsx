import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { InventoryItem } from '../types';
import { X, Boxes, Tag, DollarSign, Layers, MapPin, AlertCircle, Percent } from 'lucide-react';

export const InventoryItemModal: React.FC = () => {
  const {
    isInventoryModalOpen,
    setIsInventoryModalOpen,
    selectedInventoryItemForEdit,
    setSelectedInventoryItemForEdit,
    addInventoryItem,
    updateInventoryItem,
    selectedCurrency,
    businessProfile,
  } = useAccounting();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Merchandise',
    unit: 'pcs',
    unitCost: 0,
    sellingPrice: 0,
    quantityOnHand: 0,
    reorderLevel: 5,
    location: 'Main Warehouse',
    taxRate: businessProfile.defaultTaxRate || 10,
    isActive: true,
  });

  useEffect(() => {
    if (selectedInventoryItemForEdit) {
      setFormData({
        sku: selectedInventoryItemForEdit.sku,
        name: selectedInventoryItemForEdit.name,
        description: selectedInventoryItemForEdit.description || '',
        category: selectedInventoryItemForEdit.category,
        unit: selectedInventoryItemForEdit.unit,
        unitCost: selectedInventoryItemForEdit.unitCost,
        sellingPrice: selectedInventoryItemForEdit.sellingPrice,
        quantityOnHand: selectedInventoryItemForEdit.quantityOnHand,
        reorderLevel: selectedInventoryItemForEdit.reorderLevel,
        location: selectedInventoryItemForEdit.location || 'Main Warehouse',
        taxRate: selectedInventoryItemForEdit.taxRate ?? businessProfile.defaultTaxRate ?? 10,
        isActive: selectedInventoryItemForEdit.isActive,
      });
    } else {
      const generatedSku = `SKU-${Date.now().toString().slice(-4)}`;
      setFormData({
        sku: generatedSku,
        name: '',
        description: '',
        category: 'Merchandise',
        unit: 'pcs',
        unitCost: 0,
        sellingPrice: 0,
        quantityOnHand: 0,
        reorderLevel: 5,
        location: 'Main Warehouse',
        taxRate: businessProfile.defaultTaxRate || 10,
        isActive: true,
      });
    }
  }, [selectedInventoryItemForEdit, isInventoryModalOpen, businessProfile.defaultTaxRate]);

  if (!isInventoryModalOpen) return null;

  const handleClose = () => {
    setIsInventoryModalOpen(false);
    setSelectedInventoryItemForEdit(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (selectedInventoryItemForEdit) {
      updateInventoryItem(selectedInventoryItemForEdit.id, formData);
    } else {
      addInventoryItem(formData);
    }
    handleClose();
  };

  const profitMargin =
    formData.sellingPrice > 0
      ? (((formData.sellingPrice - formData.unitCost) / formData.sellingPrice) * 100).toFixed(1)
      : '0.0';

  const categories = ['Merchandise', 'Electronics', 'Raw Materials', 'Finished Goods', 'Office Supplies', 'Packaging', 'Services/Goods'];
  const units = ['pcs', 'units', 'box', 'pack', 'kg', 'lbs', 'm', 'liters', 'set'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {selectedInventoryItemForEdit ? 'Edit Inventory Item' : 'Create New Inventory Item'}
              </h2>
              <p className="text-xs text-slate-400">
                Track stock on hand, unit cost valuation, reorder thresholds, and pricing.
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
          {/* Row 1: SKU & Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> SKU / Item Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. SKU-PROD-01"
                className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item / Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Commercial Grade LED Monitor 27 inch"
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Category & Unit & Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Warehouse Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Shelf A-04"
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 3: Valuation, Pricing & Profit Margin Preview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Cost, Price & Tax Valuation
              </span>
              <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                Margin Preview:
                <span
                  className={`font-bold font-mono px-2 py-0.5 rounded-md ${
                    Number(profitMargin) >= 30
                      ? 'bg-emerald-100 text-emerald-800'
                      : Number(profitMargin) > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {profitMargin}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Purchase Unit Cost ({selectedCurrency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Selling Price ({selectedCurrency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-slate-400" /> Applicable Tax (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Initial Stock & Reorder Trigger Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {selectedInventoryItemForEdit ? 'Current Quantity on Hand' : 'Initial Stock Quantity'} ({formData.unit})
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.quantityOnHand}
                onChange={(e) => setFormData({ ...formData, quantityOnHand: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Total initial valuation:{' '}
                <span className="font-mono font-bold text-slate-700">
                  ${(formData.quantityOnHand * formData.unitCost).toFixed(2)}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Reorder Alert Threshold Level
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Triggers visual low stock warning when stock drops to or below this count.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description / Specs</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical specifications, supplier notes, or bundle details..."
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              {selectedInventoryItemForEdit ? 'Save Changes' : 'Create Inventory Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
