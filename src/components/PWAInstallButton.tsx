import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC<{
  className?: string;
  variant?: 'navbar' | 'sidebar' | 'banner';
}> = ({ className = '', variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed standalone PWA, hide the install prompt
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installed App</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      {/* Chromium / Android / Desktop flow */}
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-xs hover:shadow-emerald-500/20 active:scale-98 cursor-pointer ${className}`}
          title="Install LedgerFlow on your desktop or mobile device"
        >
          <Download className={`w-3.5 h-3.5 ${isInstalling ? 'animate-bounce' : ''}`} />
          <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
        </button>
      )}

      {/* iOS Safari flow */}
      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all ${className}`}
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add to Home Screen</span>
        </button>
      )}

      {/* Default fallback for browsers when not installable yet */}
      {!isInstallable && !isIOS && variant === 'sidebar' && (
        <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800/80 space-y-1 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Offline Ready</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            All data persists locally in your browser. Install via browser menu anytime.
          </p>
        </div>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Install on iOS</h3>
                  <p className="text-[10px] text-slate-400">Add LedgerFlow to your home screen</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-100">Tap the Share Button</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    Tap <Share2 className="w-3.5 h-3.5 text-blue-400 inline" /> in the Safari bottom toolbar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-100">Add to Home Screen</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    Scroll down and tap <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-100">Launch Fullscreen Offline</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tap <strong>Add</strong> in the top right to install the standalone app icon.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
