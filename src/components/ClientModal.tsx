import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Client } from '../types';
import { X, Check, User, Building, Mail, Phone, MapPin, Clock } from 'lucide-react';

export const ClientModal: React.FC<{
  clientToEdit: Client | null;
  onClose: () => void;
}> = ({ clientToEdit, onClose }) => {
  const { isClientModalOpen, addClient, updateClient } = useAccounting();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);

  useEffect(() => {
    if (!isClientModalOpen) return;

    if (clientToEdit) {
      setName(clientToEdit.name);
      setCompanyName(clientToEdit.companyName || '');
      setEmail(clientToEdit.email);
      setPhone(clientToEdit.phone || '');
      setStreet(clientToEdit.address.street);
      setCity(clientToEdit.address.city);
      setState(clientToEdit.address.state);
      setZip(clientToEdit.address.zip);
      setCountry(clientToEdit.address.country || 'United States');
      setPaymentTermsDays(clientToEdit.paymentTermsDays || 30);
    } else {
      setName('');
      setCompanyName('');
      setEmail('');
      setPhone('');
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setCountry('United States');
      setPaymentTermsDays(30);
    }
  }, [isClientModalOpen, clientToEdit]);

  const handleSave = () => {
    if (!name.trim() && !companyName.trim()) {
      alert('Please provide a client name or company name.');
      return;
    }
    if (!email.trim()) {
      alert('Please provide a client email address for invoicing.');
      return;
    }

    const payload = {
      name: name || companyName,
      companyName: companyName || name,
      email,
      phone,
      address: {
        street,
        city,
        state,
        zip,
        country,
      },
      paymentTermsDays: Number(paymentTermsDays) || 30,
    };

    if (clientToEdit) {
      updateClient(clientToEdit.id, payload);
    } else {
      addClient(payload);
    }

    onClose();
  };

  if (!isClientModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>{clientToEdit ? 'Edit Client Profile' : 'Add New Client'}</span>
            </h3>
            <p className="text-xs text-slate-500">Manage billing address and default payment terms</p>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Primary Contact Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Company / Business Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Innovations Inc."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Billing Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@acme.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 349-2041"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 text-[10px] uppercase font-semibold">Street Address</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="100 Market St, Suite 400"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="CA"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">ZIP Code</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="94105"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 text-[10px] uppercase font-semibold">Default Payment Terms</label>
            <select
              value={paymentTermsDays}
              onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 mt-1"
            >
              <option value={7}>Net 7 Days</option>
              <option value={15}>Net 15 Days</option>
              <option value={30}>Net 30 Days (Standard)</option>
              <option value={60}>Net 60 Days</option>
              <option value={90}>Net 90 Days</option>
            </select>
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
            <span>{clientToEdit ? 'Update Client' : 'Save Client'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
