import React, { useState, useMemo } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { InventoryItem, StockAdjustmentType } from '../types';
import { formatCurrency } from '../utils/accountingMath';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  PackageCheck,
  TrendingUp,
  History,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    inventoryItems,
    inventoryMovements,
    deleteInventoryItem,
    setSelectedInventoryItemForEdit,
    setIsInventoryModalOpen,
    setIsStockAdjustmentModalOpen,
    setSelectedItemForAdjustment,
    resetToDemoData,
    selectedCurrency,
    inventoryReport,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'items' | 'movements'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'in_stock'>('all');

  const categories = useMemo(() => {
    const set = new Set(inventoryItems.map((i) => i.category));
    return ['all', ...Array.from(set)];
  }, [inventoryItems]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      const isOutOfStock = item.quantityOnHand <= 0;
      const isLowStock = item.quantityOnHand > 0 && item.quantityOnHand <= item.reorderLevel;
      const isInStock = item.quantityOnHand > item.reorderLevel;

      let matchesStock = true;
      if (stockFilter === 'low_stock') matchesStock = isLowStock;
      if (stockFilter === 'out_of_stock') matchesStock = isOutOfStock;
      if (stockFilter === 'in_stock') matchesStock = isInStock;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [inventoryItems, searchQuery, selectedCategory, stockFilter]);

  const handleEdit = (item: InventoryItem) => {
    setSelectedInventoryItemForEdit(item);
    setIsInventoryModalOpen(true);
  };

  const handleAdjust = (item: InventoryItem) => {
    setSelectedItemForAdjustment(item);
    setIsStockAdjustmentModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedInventoryItemForEdit(null);
    setIsInventoryModalOpen(true);
  };

  const exportInventoryCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity on Hand', 'Unit', 'Unit Cost', 'Selling Price', 'Valuation Cost', 'Reorder Level', 'Status'];
    const rows = inventoryItems.map((i) => [
      i.sku,
      `"${i.name.replace(/"/g, '""')}"`,
      i.category,
      i.quantityOnHand,
      i.unit,
      i.unitCost,
      i.sellingPrice,
      (i.quantityOnHand * i.unitCost).toFixed(2),
      i.reorderLevel,
      i.quantityOnHand <= 0 ? 'Out of Stock' : i.quantityOnHand <= i.reorderLevel ? 'Low Stock' : 'In Stock',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-emerald-600" />
            Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Perpetual inventory tracking, stock valuation, reorder alerts, and audit movements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportInventoryCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Inventory Item
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Asset Stock Valuation
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(inventoryReport?.totalInventoryValue ?? 0, selectedCurrency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">At purchase cost basis</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Units On Hand
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {(inventoryReport?.totalUnitsOnHand ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Across {inventoryItems.length} active SKUs</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Potential Retail Value
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(inventoryReport?.potentialRetailValue ?? 0, selectedCurrency)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              +{formatCurrency(inventoryReport?.potentialGrossMargin ?? 0, selectedCurrency)} potential margin
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Reorder Alerts
            </span>
            <div className="text-xl font-bold font-mono text-amber-600 mt-1">
              {(inventoryReport?.lowStockItemsCount ?? 0) + (inventoryReport?.outOfStockItemsCount ?? 0)} Items
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {inventoryReport?.outOfStockItemsCount ?? 0} out of stock, {inventoryReport?.lowStockItemsCount ?? 0} low
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Items vs Movement History */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'items'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5" />
              Stock Items ({inventoryItems.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'movements'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Stock Movement History ({inventoryMovements.length})
            </span>
          </button>
        </div>

        {activeTab === 'items' && (
          <div className="flex items-center gap-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock Healthy</option>
              <option value="low_stock">Low Stock (≤ Reorder)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 capitalize"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: ITEMS LIST */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Search bar inside container */}
          <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SKU, product name, description..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{filteredItems.length}</span> of {inventoryItems.length} items
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <th className="px-4 py-3">SKU & Item Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Stock On Hand</th>
                  <th className="px-4 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-right">Total Valuation</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      <Boxes className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
                      <p className="font-semibold text-slate-700 text-sm">
                        {inventoryItems.length === 0 ? 'No inventory stock items yet' : 'No items match your search filter'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {inventoryItems.length === 0
                          ? 'Add your product SKUs to start tracking perpetual inventory valuation, stock movements, and reorders.'
                          : 'Try changing your search query or category filter.'}
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          onClick={handleCreateNew}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Inventory Item
                        </button>
                        {inventoryItems.length === 0 && (
                          <button
                            onClick={resetToDemoData}
                            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Boxes className="w-3.5 h-3.5 text-slate-500" /> Load Sample Products
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isOutOfStock = item.quantityOnHand <= 0;
                    const isLowStock = item.quantityOnHand > 0 && item.quantityOnHand <= item.reorderLevel;
                    const valuation = item.quantityOnHand * item.unitCost;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* SKU & Name */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-semibold">
                              {item.sku}
                            </span>
                            {item.location && (
                              <span className="text-[11px] text-slate-400">Loc: {item.location}</span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium">
                            {item.category}
                          </span>
                        </td>

                        {/* Stock On Hand */}
                        <td className="px-4 py-3 text-right font-mono">
                          <span
                            className={`font-bold text-sm ${
                              isOutOfStock
                                ? 'text-rose-600'
                                : isLowStock
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {item.quantityOnHand}
                          </span>{' '}
                          <span className="text-slate-400 text-[11px]">{item.unit}</span>
                          <div className="text-[10px] text-slate-400">Reorder @ {item.reorderLevel}</div>
                        </td>

                        {/* Unit Cost */}
                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                          {formatCurrency(item.unitCost ?? 0, selectedCurrency)}
                        </td>

                        {/* Selling Price */}
                        <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                          {formatCurrency(item.sellingPrice ?? 0, selectedCurrency)}
                        </td>

                        {/* Valuation */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(valuation, selectedCurrency)}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3" /> Healthy
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleAdjust(item)}
                              title="Adjust Stock"
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                            >
                              <ArrowUpDown className="w-3 h-3" /> Adjust
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              title="Edit Item"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteInventoryItem(item.id)}
                              title="Delete Item"
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
        </div>
      )}

      {/* TAB 2: MOVEMENT HISTORY AUDIT */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Inventory Stock Movement & Audit Journal</h3>
              <p className="text-[11px] text-slate-500">Every stock in, out, sale, and cycle-count adjustment logged with full traceability.</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              {inventoryMovements.length} Total Movement Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">SKU & Item</th>
                  <th className="px-4 py-3">Movement Type</th>
                  <th className="px-4 py-3 text-right">Quantity Delta</th>
                  <th className="px-4 py-3 text-right">Resulting Qty</th>
                  <th className="px-4 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3">Reason / Ref #</th>
                  <th className="px-4 py-3">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventoryMovements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      <History className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                      <p className="font-medium text-slate-600">No stock movements recorded yet</p>
                    </td>
                  </tr>
                ) : (
                  inventoryMovements.map((move) => {
                    const isPositive = move.quantityChange > 0;
                    return (
                      <tr key={move.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-600">{move.date}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{move.itemName}</div>
                          <div className="font-mono text-[11px] text-slate-500">{move.itemSku}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              move.type === 'increase' || move.type === 'purchase_in' || move.type === 'initial'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : move.type === 'decrease' || move.type === 'sale_out'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {move.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold">
                          <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                            {isPositive ? `+${move.quantityChange}` : move.quantityChange}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {move.resultingQuantity}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          ${move.unitCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <div>{move.reason}</div>
                          {move.referenceNumber && (
                            <div className="text-[10px] font-mono text-slate-400">Ref: {move.referenceNumber}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">{move.performedBy}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
