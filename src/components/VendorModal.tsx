import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Vendor } from '../types';
import { X, Check, Building2, Mail, Phone, MapPin, Tag, FileText } from 'lucide-react';

export const VendorModal: React.FC<{
  vendorToEdit: Vendor | null;
  onClose: () => void;
}> = ({ vendorToEdit, onClose }) => {
  const { isVendorModalOpen, addVendor, updateVendor } = useAccounting();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('Merchandise & Inventory');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isVendorModalOpen) return;

    if (vendorToEdit) {
      setName(vendorToEdit.name);
      setCompanyName(vendorToEdit.companyName || '');
      setCategory(vendorToEdit.category || 'Merchandise & Inventory');
      setEmail(vendorToEdit.email);
      setPhone(vendorToEdit.phone || '');
      setTaxId(vendorToEdit.taxId || '');
      setStreet(vendorToEdit.address?.street || '');
      setCity(vendorToEdit.address?.city || '');
      setState(vendorToEdit.address?.state || '');
      setZip(vendorToEdit.address?.zip || '');
      setCountry(vendorToEdit.address?.country || 'United States');
      setPaymentTermsDays(vendorToEdit.paymentTermsDays || 30);
      setNotes(vendorToEdit.notes || '');
    } else {
      setName('');
      setCompanyName('');
      setCategory('Merchandise & Inventory');
      setEmail('');
      setPhone('');
      setTaxId('');
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setCountry('United States');
      setPaymentTermsDays(30);
      setNotes('');
    }
  }, [isVendorModalOpen, vendorToEdit]);

  const handleSave = () => {
    if (!name.trim() && !companyName.trim()) {
      alert('Please provide a vendor contact or company name.');
      return;
    }
    if (!email.trim()) {
      alert('Please provide a vendor email address.');
      return;
    }

    const payload = {
      name: name || companyName,
      companyName: companyName || name,
      category,
      email,
      phone,
      taxId,
      address: {
        street,
        city,
        state,
        zip,
        country,
      },
      paymentTermsDays: Number(paymentTermsDays) || 30,
      notes,
    };

    if (vendorToEdit) {
      updateVendor(vendorToEdit.id, payload);
    } else {
      addVendor(payload);
    }

    onClose();
  };

  if (!isVendorModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>{vendorToEdit ? 'Edit Vendor Profile' : 'Add New Trade Vendor / Supplier'}</span>
            </h3>
            <p className="text-xs text-slate-500">Manage supplier billing details, tax ID, and payment terms</p>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 font-semibold text-[10px] uppercase">Vendor / Business Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Hardware Supplies"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1 font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-500 font-semibold text-[10px] uppercase">Contact Person Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Robert Smith"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 font-semibold text-[10px] uppercase">Supplier Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1 font-medium"
              >
                <option value="Merchandise & Inventory">Merchandise & Inventory</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Office & Equipment">Office & Equipment</option>
                <option value="Logistics & Shipping">Logistics & Shipping</option>
                <option value="Packaging & Warehousing">Packaging & Warehousing</option>
                <option value="Utilities & Facilities">Utilities & Facilities</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other Trade Supplier">Other Trade Supplier</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-semibold text-[10px] uppercase">Payment Terms</label>
              <select
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1 font-medium"
              >
                <option value={0}>Due on Receipt (Immediate)</option>
                <option value={15}>Net 15 Days</option>
                <option value={30}>Net 30 Days (Standard)</option>
                <option value={45}>Net 45 Days</option>
                <option value={60}>Net 60 Days</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 font-semibold text-[10px] uppercase">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@supplier.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 font-semibold text-[10px] uppercase">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-semibold text-[10px] uppercase">Vendor Tax ID / EIN / VAT Number</label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="e.g. 12-3456789"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-1"
            />
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="text-slate-500 font-semibold text-[10px] uppercase">Vendor Address</label>
            <input
              type="text"
              placeholder="Street Address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
              />
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-semibold text-[10px] uppercase">Internal Notes & Remittance Details</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Wire details, preferred payment method, discount terms..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{vendorToEdit ? 'Save Changes' : 'Create Vendor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
