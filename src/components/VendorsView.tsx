import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Vendor } from '../types';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Trash2,
  Edit,
  CreditCard,
  Layers,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const VendorsView: React.FC<{
  onEditVendor: (vendor: Vendor) => void;
  onCreateBillForVendor: (vendor: Vendor) => void;
}> = ({ onEditVendor, onCreateBillForVendor }) => {
  const {
    vendors,
    purchaseInvoices,
    selectedCurrency,
    setIsVendorModalOpen,
    deleteVendor,
    openPaymentModalForPurchaseInvoice,
  } = useAccounting();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = Array.from(new Set(vendors.map((v) => v.category).filter(Boolean)));

  const filteredVendors = vendors.filter((v) => {
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    if (!matchesCategory) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.companyName.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      (v.category && v.category.toLowerCase().includes(q))
    );
  });

  const totalOutstandingAP = vendors.reduce((sum, v) => sum + (v.outstandingPayable || 0), 0);
  const totalPurchasesVolume = vendors.reduce((sum, v) => sum + (v.totalPurchased || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Vendors & Supplier Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage commercial suppliers, procurement channels, payment terms, and accounts payable
          </p>
        </div>

        <button
          onClick={() => setIsVendorModalOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Vendor</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Suppliers</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{vendors.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified trade partners</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Procurement Spend</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalPurchasesVolume, selectedCurrency)}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Cumulative purchase volume
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Total Accounts Payable (Due)</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(totalOutstandingAP, selectedCurrency)}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Outstanding supplier obligations</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors by name, company, category..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Vendors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => {
          const vendorBills = purchaseInvoices.filter(
            (b) => (b.vendorName === vendor.name || b.vendorName === vendor.companyName) && b.status !== 'cancelled'
          );
          const unpaidBills = vendorBills.filter((b) => b.status !== 'paid');

          return (
            <div
              key={vendor.id}
              className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      {vendor.companyName || vendor.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Contact: {vendor.name}</p>
                  </div>
                  {vendor.category && (
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      {vendor.category}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.address && (
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {vendor.address.city}, {vendor.address.state} {vendor.address.country}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Purchased</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {formatCurrency(vendor.totalPurchased || 0, selectedCurrency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Balance Payable</span>
                    <p className={`font-bold mt-0.5 ${
                      (vendor.outstandingPayable || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}>
                      {formatCurrency(vendor.outstandingPayable || 0, selectedCurrency)}
                    </p>
                  </div>
                </div>

                {vendor.paymentTermsDays && (
                  <div className="mt-2 text-[11px] text-slate-500 font-medium">
                    Terms: <span className="font-semibold text-slate-700">Net {vendor.paymentTermsDays} Days</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onCreateBillForVendor(vendor)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                    title="Create Purchase Invoice / Bill"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Create Bill</span>
                  </button>

                  {unpaidBills.length > 0 && (
                    <button
                      onClick={() => openPaymentModalForPurchaseInvoice(unpaidBills[0])}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Disburse Payment Voucher"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pay Bill</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditVendor(vendor)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Vendor"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove vendor "${vendor.companyName || vendor.name}"?`)) {
                        deleteVendor(vendor.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Vendor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredVendors.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-slate-800">No Vendors Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your merchandise wholesalers, raw material vendors, and suppliers to manage purchase bills and payables.
            </p>
            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="mt-4 px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Vendor</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
