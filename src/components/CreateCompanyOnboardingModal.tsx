import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Building2,
  UserCheck,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Globe,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  Layers,
  CheckCircle2,
  Store,
  ChevronRight,
} from 'lucide-react';
import { CurrencyCode, BusinessType } from '../types';

interface CreateCompanyOnboardingModalProps {
  onCancel?: () => void;
}

export const CreateCompanyOnboardingModal: React.FC<CreateCompanyOnboardingModalProps> = ({ onCancel }) => {
  const { registerCompanyAndUser, quickDemoLogin } = useAccounting();

  const [step, setStep] = useState<'company' | 'user'>('company');

  // Company Form State
  const [companyName, setCompanyName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('general');
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>('USD');
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(10);
  const [enableInventory, setEnableInventory] = useState(true);

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');

  // User & Login Credentials Form State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [role, setRole] = useState<'CFO / Administrator' | 'Lead Accountant' | 'Financial Analyst' | 'Auditor'>('CFO / Administrator');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('Please enter your legal company or organization name.');
      return;
    }
    setErrorMsg('');
    // Autofill user email if not filled yet
    if (!adminEmail && businessEmail) {
      setAdminEmail(businessEmail);
    }
    setStep('user');
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!adminEmail.trim()) {
      setErrorMsg('Please enter your administrator work email.');
      return;
    }
    if (pin.length !== 4 || isNaN(Number(pin))) {
      setErrorMsg('Please provide a 4-digit security PIN.');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMsg('PINs do not match. Please verify your 4-digit PIN.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      registerCompanyAndUser(
        {
          companyName: companyName.trim(),
          tradingName: tradingName.trim() || companyName.trim(),
          email: businessEmail.trim(),
          phone: phone.trim(),
          website: website.trim(),
          taxNumber: taxNumber.trim() || 'TAX-PENDING',
          businessType,
          defaultCurrency,
          defaultTaxRate: Number(defaultTaxRate) || 0,
          enableInventory,
          address: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zip: zip.trim(),
            country: country.trim() || 'United States',
          },
        },
        {
          name: adminName.trim(),
          email: adminEmail.trim(),
          role,
          pin,
        }
      );
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-emerald-600/30 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-teal-600/30 blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-6 right-6 text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ← Back to Sign In
          </button>
        )}
        {/* Top Header & Steps */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
            <TrendingUp className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome to LedgerFlow
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Set up your organization's financial ledger and administrator credentials to get started.
          </p>

          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep('company')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                step === 'company'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'company' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}>
                1
              </div>
              <span>Organization Details</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-600" />

            <button
              type="button"
              onClick={() => {
                if (companyName.trim()) setStep('user');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                step === 'user'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 bg-slate-800/60 hover:text-slate-200 opacity-80'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 'user' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}>
                2
              </div>
              <span>Admin Login Credentials</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs text-center font-medium animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Company Profile Form */}
        {step === 'company' ? (
          <form onSubmit={handleNextStep} className="space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Company / Organization Name <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corporation or Vertex Global LLC"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pl-10"
                      required
                      autoFocus
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trading / Brand Name</label>
                  <input
                    type="text"
                    value={tradingName}
                    onChange={(e) => setTradingName(e.target.value)}
                    placeholder="e.g. Acme Studio (optional)"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="general">General Commercial Entity</option>
                    <option value="retail_shop">Retail Shop & POS</option>
                    <option value="wholesale">Wholesale & Distribution</option>
                    <option value="service_business">Professional Services & Consulting</option>
                    <option value="manufacturing">Manufacturing & Assembly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Base Functional Currency</label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                    <option value="AUD">AUD ($) - Australian Dollar</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                    <option value="CHF">CHF (Fr) - Swiss Franc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tax Number / EIN / VAT ID</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="e.g. TAX-984021"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Company Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      placeholder="finance@company.com"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pl-10"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pl-10"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Headquarters / Billing Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 100 Financial Blvd, Suite 400"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New York"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              <span>Continue to Create Admin Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: Administrator & Login Credentials Form */
          <form onSubmit={handleCompleteSetup} className="space-y-5 animate-in fade-in duration-200">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-xs text-emerald-300">
              <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-white">Registering organization: {companyName}</p>
                <p className="text-[11px] text-emerald-400/80">Currency: {defaultCurrency} • Fiscal Year 2026</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Sarah Connor"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pl-10"
                      required
                      autoFocus
                    />
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Admin Email (Login ID) <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pl-10"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Role / Position</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="CFO / Administrator">CFO / Administrator (Full Access)</option>
                    <option value="Lead Accountant">Lead Accountant</option>
                    <option value="Financial Analyst">Financial Analyst</option>
                    <option value="Auditor">Auditor (View & Reconciliation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Set 4-Digit Security PIN <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1234"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pl-10 font-mono tracking-widest text-center"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Used for fast keypad login & approvals</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm 4-Digit Security PIN <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1234"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pl-10 font-mono tracking-widest text-center"
                      required
                    />
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('company')}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Initializing Ledger...' : 'Complete Setup & Open Books'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Pre-fill Option */}
        <div className="mt-8 pt-5 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={quickDemoLogin}
            className="w-full py-2 px-3 bg-slate-800/60 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Or Load Sample Company (Apex Enterprise) & Demo Admin</span>
          </button>
          <p className="text-[10px] text-slate-500 mt-2">
            Your data is stored privately in browser storage with double-entry accounting integrity.
          </p>
        </div>
      </div>
    </div>
  );
};
