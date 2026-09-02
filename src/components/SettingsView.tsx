import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useVoice } from '../context/VoiceContext';
import {
  Settings,
  Building,
  Landmark,
  FileText,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Lock,
  Trash2,
  Sparkles,
  Wifi,
  WifiOff,
  HardDrive,
  Check,
  Layers,
  Mic,
  Volume2,
  Radio,
  Sliders,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    businessProfile,
    updateBusinessProfile,
    invoices,
    expenses,
    clients,
    bankTransactions,
    resetToDemoData,
    clearAllData,
    securitySettings,
    updateSecuritySettings,
    currentUser,
    lockSession,
  } = useAccounting();

  const {
    settings: voiceSettings,
    updateSettings: updateVoiceSettings,
    availableVoices,
    speak,
    setIsVoiceWidgetOpen,
  } = useVoice();

  const [form, setForm] = useState(businessProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newPin, setNewPin] = useState(securitySettings?.quickPin || '1234');
  const [autoLockTimeout, setAutoLockTimeout] = useState(securitySettings?.autoLockTimeoutMinutes || 30);
  const [pinEnabled, setPinEnabled] = useState(securitySettings?.pinEnabled ?? true);
  const [securitySaved, setSecuritySaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(form);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      alert('PIN must be a 4-digit numeric code.');
      return;
    }

    updateSecuritySettings({
      quickPin: newPin,
      autoLockTimeoutMinutes: Number(autoLockTimeout),
      pinEnabled,
    });

    setSecuritySaved(true);
    setTimeout(() => {
      setSecuritySaved(false);
    }, 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      businessProfile: form,
      invoices,
      expenses,
      clients,
      bankTransactions,
      securitySettings,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.invoices && parsed.expenses) {
          localStorage.setItem('ledgerflow_accounting_v2_invoices', JSON.stringify(parsed.invoices));
          localStorage.setItem('ledgerflow_accounting_v2_expenses', JSON.stringify(parsed.expenses));
          if (parsed.clients)
            localStorage.setItem('ledgerflow_accounting_v2_clients', JSON.stringify(parsed.clients));
          if (parsed.businessProfile)
            localStorage.setItem('ledgerflow_accounting_v2_profile', JSON.stringify(parsed.businessProfile));
          window.location.reload();
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Company Profile, Security & Invoicing Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure legal entity details, security PIN, banking instructions, and accounting rules
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Security & Access Management Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Security, Authentication & Session Protection
          </h3>
          {securitySaved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PIN & Security Updated
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">4-Digit Quick PIN</label>
              <div className="relative mt-1">
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold tracking-widest focus:outline-none focus:border-slate-400"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Used for 1-second keypad unlock & approvals</p>
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Auto-Lock Inactive Session</label>
              <select
                value={autoLockTimeout}
                onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 mt-1 cursor-pointer"
              >
                <option value={5}>After 5 minutes</option>
                <option value={15}>After 15 minutes</option>
                <option value={30}>After 30 minutes (Recommended)</option>
                <option value={60}>After 1 hour</option>
                <option value={0}>Disabled (Never auto-lock)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Update Security PIN</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-xs">
                AV
              </div>
              <div>
                <p className="font-bold text-slate-800">{currentUser?.name || 'Alex Vance'}</p>
                <p className="text-[11px] text-slate-500 font-mono">{currentUser?.role || 'Chief Financial Officer'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={lockSession}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Session Now</span>
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Classification & Modular Settings */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Business Type & Module Customization
            </h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              Modular Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Business Classification</label>
              <select
                value={form.businessType || 'retail_shop'}
                onChange={(e) => setForm({ ...form, businessType: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-400 mt-1"
              >
                <option value="retail_shop">Retail Shop & POS Store</option>
                <option value="wholesale">Wholesale & Distribution</option>
                <option value="services">Professional Services & Agency</option>
                <option value="manufacturing">Manufacturing & Production</option>
                <option value="general">General Commercial Business</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Customizes terminology and workflows to your business model.
              </p>
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Accounting Basis</label>
              <select
                value={form.accountingBasis || 'accrual'}
                onChange={(e) => setForm({ ...form, accountingBasis: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-400 mt-1"
              >
                <option value="accrual">Accrual Basis (Standard GAAP/IFRS)</option>
                <option value="cash">Cash Basis</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Accrual records revenue when earned and expenses when incurred.
              </p>
            </div>
          </div>

          {/* Optional Inventory & AI Module Toggles */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Module Activation</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Inventory Module Toggle */}
              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                form.enableInventory !== false
                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30'
                  : 'bg-slate-50 border-slate-200 opacity-80'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                      Inventory Management
                    </span>
                    <input
                      type="checkbox"
                      checked={form.enableInventory !== false}
                      onChange={(e) => setForm({ ...form, enableInventory: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Stock tracking, product catalog, automatic reorders & inventory valuation. (Optional setting).
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-semibold text-emerald-700">
                  {form.enableInventory !== false ? '● Module Active' : '○ Module Disabled'}
                </div>
              </label>

              {/* AI Inventory Automation */}
              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                form.enableAIAutomation !== false
                  ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-400/30'
                  : 'bg-slate-50 border-slate-200 opacity-80'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      AI Inventory Automation
                    </span>
                    <input
                      type="checkbox"
                      checked={form.enableAIAutomation !== false}
                      onChange={(e) => setForm({ ...form, enableAIAutomation: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    AI automated purchase suggestions, velocity alerts, and real-time stock monitoring.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-semibold text-indigo-700">
                  {form.enableAIAutomation !== false ? '● AI Automation Active' : '○ Disabled'}
                </div>
              </label>

              {/* AI Predictive Customer Insights */}
              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                form.enablePredictiveAnalytics !== false
                  ? 'bg-teal-50/50 border-teal-300 ring-1 ring-teal-400/30'
                  : 'bg-slate-50 border-slate-200 opacity-80'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      Predictive Customer Analytics
                    </span>
                    <input
                      type="checkbox"
                      checked={form.enablePredictiveAnalytics !== false}
                      onChange={(e) => setForm({ ...form, enablePredictiveAnalytics: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    AI purchasing pattern forecasting, customer churn risk analysis, and tailored retention insights.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-semibold text-teal-700">
                  {form.enablePredictiveAnalytics !== false ? '● Predictive AI Active' : '○ Disabled'}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Business Entity Info */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            Business & Legal Entity Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Legal Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Tax ID / EIN / VAT Number</label>
              <input
                type="text"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Official Contact Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Registered Office Address</label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Street"
                  value={form.address.street}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                  className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={form.address.city}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
                <input
                  type="text"
                  placeholder="State & Zip"
                  value={`${form.address.state} ${form.address.zip}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setForm({
                      ...form,
                      address: { ...form.address, state: parts[0] || '', zip: parts[1] || '' },
                    });
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banking & Remittance */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-teal-600" />
            Bank Remittance & Wire Instructions (Printed on Invoices)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Bank Name</label>
              <input
                type="text"
                value={form.bankDetails.bankName}
                onChange={(e) =>
                  setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: e.target.value } })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Account Holder Name</label>
              <input
                type="text"
                value={form.bankDetails.accountName}
                onChange={(e) =>
                  setForm({ ...form, bankDetails: { ...form.bankDetails, accountName: e.target.value } })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Account Number</label>
              <input
                type="text"
                value={form.bankDetails.accountNumber}
                onChange={(e) =>
                  setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: e.target.value } })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Routing / SWIFT / IBAN</label>
              <input
                type="text"
                value={form.bankDetails.routingOrIban}
                onChange={(e) =>
                  setForm({ ...form, bankDetails: { ...form.bankDetails, routingOrIban: e.target.value } })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Default Payment Remittance Note</label>
              <textarea
                rows={2}
                value={form.paymentInstructions}
                onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 mt-1 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Invoice Numbering & Tax Rules */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Invoicing Defaults & Standard Tax Rate
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Invoice Number Prefix</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Next Sequence Number</label>
              <input
                type="number"
                value={form.invoiceNextNumber}
                onChange={(e) => setForm({ ...form, invoiceNextNumber: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>

            <div>
              <label className="text-slate-500 text-[10px] uppercase font-semibold">Default Sales Tax / VAT %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.defaultTaxRate}
                onChange={(e) => setForm({ ...form, defaultTaxRate: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Offline Mode & PWA Installation Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              Offline Capability & Local Persistence
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              LedgerFlow runs with offline storage and service worker caching.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Database Engine</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Local Browser Persistence</span>
            </div>
            <p className="text-[11px] text-slate-500">Invoices, GL accounts, and books persist across reboots.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">PDF & Financial Reports</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Client-Side Engine</span>
            </div>
            <p className="text-[11px] text-slate-500">PDF creation, P&L, balance sheets, and tax reports require zero internet.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Cloud AI Model Sync</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Auto-resumes when online</span>
            </div>
            <p className="text-[11px] text-slate-500">Receipt OCR and Copilot advisory connect when network is live.</p>
          </div>
        </div>
      </div>

      {/* VoiceOver & Hands-Free Voice Controller Settings Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-600" />
              VoiceOver & Hands-Free Voice Commands
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control invoices, expenses, reports, and ledger lookups using your voice. Includes spoken audio feedback.
            </p>
          </div>

          <button
            type="button"
            id="settings-open-voice-commander-btn"
            onClick={() => setIsVoiceWidgetOpen(true)}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Open Voice Assistant</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Spoken Feedback Toggle */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Auto-Spoken VoiceOver Audio</span>
              <span className="text-[11px] text-slate-500">Reads answers and confirmations aloud</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={voiceSettings.autoSpeakResponses}
                onChange={(e) => updateVoiceSettings({ autoSpeakResponses: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Sound UI Effects Toggle */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Audio UI Chimes</span>
              <span className="text-[11px] text-slate-500">Play melodic feedback tones on speech start and completion</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={voiceSettings.soundEffectsEnabled}
                onChange={(e) => updateVoiceSettings({ soundEffectsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Speed & Test */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1 text-slate-600 font-semibold">
              <span>Speech Speed Rate:</span>
              <span className="text-emerald-700 font-mono font-bold">{voiceSettings.speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={voiceSettings.speechRate}
              onChange={(e) => updateVoiceSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              id="settings-test-voice-btn"
              onClick={() => speak('VoiceOver is active and ready to execute your accounting instructions.')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Voice Speech Synthesis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup, Clean Slate & Demo Data Management */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Ledger Data Backup, Export & Clear Data
        </h3>
        <p className="text-xs text-slate-500">
          Save an offline JSON snapshot of all your invoices, expenses, client profiles, and automated schedules.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export JSON Backup</span>
          </button>

          <label className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Restore JSON Backup</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('Clear all invoices and expenses for a completely clean slate? Chart of accounts will be preserved.')) {
                clearAllData();
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Clean Slate (Clear Transactions)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all invoices, expenses, and clients to fresh sample data?')) {
                resetToDemoData();
              }
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

