import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Sparkles,
  Zap,
  Plus,
  Receipt,
  FileText,
  UserPlus,
  BookOpen,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Mic,
  Volume2,
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { CURRENCY_SYMBOLS } from '../utils/accountingMath';
import { useVoice } from '../context/VoiceContext';

export const Navbar: React.FC<{
  onOpenAICopilot: () => void;
  onOpenReceiptScanner: () => void;
  onOpenVoiceCommander: () => void;
}> = ({ onOpenAICopilot, onOpenReceiptScanner, onOpenVoiceCommander }) => {
  const { isListening, isSpeaking } = useVoice();
  const {
    businessProfile,
    selectedCurrency,
    setSelectedCurrency,
    setIsInvoiceModalOpen,
    setSelectedInvoiceForEdit,
    setIsExpenseModalOpen,
    setIsClientModalOpen,
    setIsLedgerModalOpen,
    runAutomatedRecurringEngine,
    automationLogs,
    invoices,
    bankTransactions,
    currentUser,
    lockSession,
    logout,
    setActiveTab,
  } = useAccounting();

  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);

  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;
  const unreconciledCount = bankTransactions.filter((t) => t.status === 'unmatched').length;

  const handleRunAutomation = () => {
    setIsAutomationRunning(true);
    setTimeout(() => {
      runAutomatedRecurringEngine();
      setIsAutomationRunning(false);
    }, 600);
  };

  const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CHF'];

  return (
    <header className="no-print bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand & Organization */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-bold shadow-sm shadow-slate-900/10">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                {businessProfile.companyName}
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Live Books
              </span>
            </div>
            <p className="text-xs text-slate-500">
              FY 2026 • Tax ID: <span className="text-slate-700 font-mono font-medium">{businessProfile.taxNumber}</span>
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs">
            <span className="px-2 text-slate-500 font-medium hidden md:inline">Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-slate-800 font-semibold px-2 py-1 outline-none cursor-pointer rounded"
              title="Display Currency"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr} className="bg-white text-slate-900">
                  {curr} ({CURRENCY_SYMBOLS[curr]})
                </option>
              ))}
            </select>
          </div>

          {/* Automated Invoicing Engine Trigger */}
          <button
            onClick={handleRunAutomation}
            disabled={isAutomationRunning}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-50"
            title="Scan & execute recurring invoice schedules & payment triggers"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isAutomationRunning ? 'animate-spin' : ''}`} />
            <span>Auto Engine</span>
          </button>

          {/* VoiceOver & Voice Commander Access Button */}
          <button
            id="navbar-voice-commander-btn"
            onClick={onOpenVoiceCommander}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-xs ${
              isListening
                ? 'bg-rose-50 text-rose-700 border border-rose-300 animate-pulse'
                : isSpeaking
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
            title="VoiceOver & Hands-Free Voice Commands (Press 'V')"
          >
            {isListening ? (
              <Mic className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="hidden sm:inline">Voice & VoiceOver</span>
            <span className="sm:hidden">Voice</span>
          </button>

          {/* AI Financial Copilot Button */}
          <button
            onClick={onOpenAICopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="hidden md:inline">AI Financial Copilot</span>
            <span className="md:hidden">AI CPA</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Quick Lock Session Button */}
          <button
            onClick={lockSession}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition-colors shadow-xs"
            title="Lock Financial Session (Ctrl+L / PIN protect)"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 relative transition-colors shadow-xs"
              title="Automated Event Logs"
            >
              <Bell className="w-4 h-4" />
              {(overdueCount > 0 || unreconciledCount > 0) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Automated Accounting Events</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{automationLogs.length} logs</span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {automationLogs.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-xs transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{log.title}</p>
                          <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">{log.details}</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Menu */}
          <div className="relative">
            <button
              onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Entry</span>
            </button>

            {isQuickMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50">
                <button
                  onClick={() => {
                    setSelectedInvoiceForEdit(null);
                    setIsInvoiceModalOpen(true);
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Create Invoice / Sale</span>
                </button>

                <button
                  onClick={() => {
                    setIsExpenseModalOpen(true);
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left"
                >
                  <Receipt className="w-4 h-4 text-rose-600" />
                  <span>Log Expense / Purchase</span>
                </button>

                <button
                  onClick={() => {
                    onOpenReceiptScanner();
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Scan Receipt with AI</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setIsLedgerModalOpen(true);
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left"
                >
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>New Ledger Account</span>
                </button>

                <button
                  onClick={() => {
                    setIsClientModalOpen(true);
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Add Client Account</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile & Security Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-800 leading-tight">
                  {currentUser?.name || 'Alex Vance'}
                </p>
                <p className="text-[9px] text-emerald-600 font-semibold leading-tight">
                  {currentUser?.role?.split(' ')[0] || 'CFO'}
                </p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs overflow-hidden">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="User"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>AV</span>
                )}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                <div className="p-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser?.name || 'Alex Vance'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{currentUser?.role || 'Administrator'}</span>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Security & PIN Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      lockSession();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lock Session</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

