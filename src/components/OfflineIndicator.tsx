import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi, CheckCircle2, ShieldCheck, HardDrive, Info, X } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (isOnline) {
    return null;
  }

  return (
    <>
      {/* Top persistent offline notice banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs flex items-center justify-between z-40 transition-all">
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-300">Offline Mode Active:</span>
          <span className="text-slate-300 truncate sm:overflow-visible sm:whitespace-normal text-[11px]">
            All invoices, expenses, GL accounts, and PDF generation work seamlessly offline with local persistence.
          </span>
          <button
            onClick={() => setShowDetails(true)}
            className="ml-auto underline font-medium text-amber-300 hover:text-amber-100 text-[11px] whitespace-nowrap cursor-pointer"
          >
            Learn more
          </button>
        </div>
      </div>

      {/* Offline Capabilities Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Offline Functionality</h3>
                  <p className="text-xs text-slate-400">How LedgerFlow operates without internet</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Offline-Capable Features:</span>
                </div>
                <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5 pt-1 pl-1">
                  <li>Creating & editing Sales and Purchase Invoices</li>
                  <li>Logging and categorizing Expenses & Receipts</li>
                  <li>Real-time Profit & Loss, Balance Sheet, Cash Flow calculations</li>
                  <li>Full PDF export & browser printing</li>
                  <li>Bank transaction review & reconciliation</li>
                  <li>Local database backup & JSON export / import</li>
                  <li>PIN lock security & settings</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Info className="w-4 h-4" />
                  <span>Online-Only Features:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cloud AI Copilot analysis and OCR vision receipt scanning utilize Gemini models and will automatically resume once your internet connection is restored.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Continue Working Offline
            </button>
          </div>
        </div>
      )}
    </>
  );
};
