import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Lock,
  Unlock,
  ShieldCheck,
  TrendingUp,
  KeyRound,
  ArrowRight,
  UserCheck,
  Fingerprint,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SecurityLoginViewProps {
  isLocked?: boolean;
}

export const SecurityLoginView: React.FC<SecurityLoginViewProps> = ({ isLocked = false }) => {
  const { currentUser, login, loginWithPin, quickDemoLogin, unlockSession } = useAccounting();

  const [mode, setMode] = useState<'pin' | 'password'>('pin');
  const [pinDigits, setPinDigits] = useState<string>('');
  const [email, setEmail] = useState<string>(currentUser?.email || 'alex.vance@apexenterprise.com');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handlePinInput = (digit: string) => {
    if (pinDigits.length < 4) {
      const nextPin = pinDigits + digit;
      setPinDigits(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        setIsProcessing(true);
        setTimeout(() => {
          if (isLocked) {
            const success = unlockSession(nextPin);
            if (!success) {
              setErrorMsg('Incorrect PIN. Default demo PIN is 1234.');
              setPinDigits('');
            }
          } else {
            const success = loginWithPin(nextPin);
            if (!success) {
              setErrorMsg('Incorrect PIN. Default demo PIN is 1234.');
              setPinDigits('');
            }
          }
          setIsProcessing(false);
        }, 300);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinDigits((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handlePinClear = () => {
    setPinDigits('');
    setErrorMsg('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      if (isLocked) {
        unlockSession(password);
      } else {
        login(email, password);
      }
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-600/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
            {isLocked ? (
              <Lock className="w-7 h-7 stroke-[2.5] text-amber-400 animate-pulse" />
            ) : (
              <TrendingUp className="w-7 h-7 stroke-[2.5]" />
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isLocked ? 'Session Locked' : 'LedgerFlow Accounting'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isLocked
              ? `Enter PIN or password to unlock financial ledger.`
              : 'Secure GAAP-Compliant Financial Management'}
          </p>
        </div>

        {/* User Card if Locked or remembered */}
        {currentUser && (
          <div className="mb-6 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-700 overflow-hidden border border-slate-600 flex items-center justify-center">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-200">{currentUser.name}</p>
                <p className="text-[11px] text-emerald-400 font-mono">{currentUser.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </div>
          </div>
        )}

        {/* Tab Switcher: Quick PIN vs Password */}
        <div className="flex rounded-xl bg-slate-900/80 p-1 mb-6 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setMode('pin');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'pin' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>4-Digit Security PIN</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('password');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'password' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center font-medium animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        {/* PIN Pad Mode */}
        {mode === 'pin' ? (
          <div className="space-y-5">
            {/* PIN Indicators */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pinDigits.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      isFilled
                        ? 'bg-emerald-400 ring-4 ring-emerald-400/20 scale-110'
                        : 'bg-slate-700 border border-slate-600'
                    }`}
                  />
                );
              })}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinInput(digit)}
                  disabled={isProcessing}
                  className="h-12 bg-slate-900/60 hover:bg-slate-700 text-slate-100 font-semibold text-lg rounded-2xl border border-slate-700/60 transition-colors active:scale-95 flex items-center justify-center disabled:opacity-50"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handlePinClear}
                disabled={isProcessing || pinDigits.length === 0}
                className="h-12 bg-slate-900/30 hover:bg-slate-800 text-slate-400 text-xs font-semibold rounded-2xl border border-slate-700/40 transition-colors flex items-center justify-center disabled:opacity-30"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handlePinInput('0')}
                disabled={isProcessing}
                className="h-12 bg-slate-900/60 hover:bg-slate-700 text-slate-100 font-semibold text-lg rounded-2xl border border-slate-700/60 transition-colors active:scale-95 flex items-center justify-center disabled:opacity-50"
              >
                0
              </button>
              <button
                type="button"
                onClick={handlePinBackspace}
                disabled={isProcessing || pinDigits.length === 0}
                className="h-12 bg-slate-900/30 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-2xl border border-slate-700/40 transition-colors flex items-center justify-center disabled:opacity-30"
              >
                Delete
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-400 font-mono">
              Default Demo PIN: <span className="text-emerald-400 font-bold">1234</span>
            </p>
          </div>
        ) : (
          /* Password Form Mode */
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {!isLocked && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLocked ? <Unlock className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              <span>{isLocked ? 'Unlock Ledger' : 'Sign In to LedgerFlow'}</span>
            </button>
          </form>
        )}

        {/* Quick Demo Bypass Button */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
          <button
            type="button"
            onClick={quickDemoLogin}
            className="w-full py-2 px-3 bg-slate-900/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>1-Click Sign In as CFO (Alex Vance)</span>
          </button>
          <p className="text-[10px] text-slate-500 mt-2">
            Protected by 256-bit encryption & localized audit session verification.
          </p>
        </div>
      </div>
    </div>
  );
};
