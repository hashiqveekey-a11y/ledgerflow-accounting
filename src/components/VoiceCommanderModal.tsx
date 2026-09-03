import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../context/VoiceContext';
import { useAccounting } from '../context/AccountingContext';
import { formatCurrency } from '../utils/accountingMath';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  ArrowRight,
  Settings,
  X,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  History,
  Trash2,
  TrendingUp,
  Sliders,
  Radio,
  FileText,
  DollarSign,
  PieChart,
  ShoppingBag,
  PlusCircle,
  Globe,
  Languages,
  Check,
  RotateCcw,
} from 'lucide-react';

export const VoiceCommanderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    isListening,
    isSpeaking,
    isSupported,
    status,
    transcript,
    interimTranscript,
    errorMessage,
    history,
    settings,
    availableVoices,
    supportedLanguages,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    updateSettings,
    processVoiceCommand,
    clearHistory,
  } = useVoice();

  const { profitAndLoss, balanceSheet, cashFlow, selectedCurrency } = useAccounting();

  const [activeTab, setActiveTabState] = useState<'voice' | 'history' | 'settings'>('voice');
  const [typedCommand, setTypedCommand] = useState('');
  const [isProcessingManual, setIsProcessingManual] = useState(false);
  const [customTestPhrase, setCustomTestPhrase] = useState('Created invoice number 4 for A-B-C with 1 piece of T-T-T at rate 5 dollars.');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'history') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, activeTab]);

  if (!isOpen) return null;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim() || isProcessingManual) return;
    const cmd = typedCommand;
    setTypedCommand('');
    setIsProcessingManual(true);
    await processVoiceCommand(cmd);
    setIsProcessingManual(false);
  };

  const handleQuickCommand = async (cmdText: string) => {
    setIsProcessingManual(true);
    await processVoiceCommand(cmdText);
    setIsProcessingManual(false);
  };

  const sampleCommands = [
    { label: '⚡ Create invoice in abc name with ttt item 1 pc at rate 5', cmd: 'create invoice in abc name with ttt item 1 pc at rate 5' },
    { label: '📄 Open Invoice Creator Modal', cmd: 'open invoice modal' },
    { label: '🛒 Open Purchase Bill Modal', cmd: 'open purchase invoice modal' },
    { label: '🧾 Open Receipt Scanner (OCR)', cmd: 'open receipt scanner' },
    { label: '👥 Open Client Directory / Modal', cmd: 'open client modal' },
    { label: '📦 Open Inventory Management', cmd: 'open inventory' },
    { label: '🤖 Open AI Financial Copilot', cmd: 'open ai copilot' },
    { label: '📊 Open Financial Reports', cmd: 'open reports' },
    { label: '💳 Record Expense $150', cmd: 'open expense modal' },
    { label: '💰 What is my Net Income?', cmd: 'What is my net income?' },
    { label: '⏳ Cash Runway & Burn Rate', cmd: 'What is my cash runway?' },
    { label: '❌ Close All Modals', cmd: 'close all modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-commander-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/20 animate-pulse'
                    : isSpeaking
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20'
                    : 'bg-slate-800 border border-slate-700 text-emerald-400'
                }`}
              >
                {isListening ? (
                  <Mic className="w-5 h-5 animate-bounce" />
                ) : isSpeaking ? (
                  <Volume2 className="w-5 h-5 animate-pulse" />
                ) : (
                  <Radio className="w-5 h-5" />
                )}
              </div>
              {isListening && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 id="voice-commander-title" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  VoiceOver & Voice Commander
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  AI Hands-Free
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Say any accounting command to execute live in LedgerFlow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Audio Mute Toggle */}
            <button
              id="voice-toggle-mute-btn"
              onClick={() => updateSettings({ autoSpeakResponses: !settings.autoSpeakResponses })}
              className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                settings.autoSpeakResponses
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={settings.autoSpeakResponses ? 'VoiceOver Audio Active' : 'VoiceOver Audio Muted'}
            >
              {settings.autoSpeakResponses ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              id="voice-close-modal-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close Voice Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-2 text-xs font-semibold">
          <div className="flex items-center gap-1">
            <button
              id="voice-tab-active-btn"
              onClick={() => setActiveTabState('voice')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'voice'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Voice Mode
            </button>

            <button
              id="voice-tab-history-btn"
              onClick={() => setActiveTabState('history')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Action History ({history.length})
            </button>

            <button
              id="voice-tab-settings-btn"
              onClick={() => setActiveTabState('settings')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Pronunciation & Voice Settings
            </button>
          </div>

          <button
            id="voice-quick-summary-btn"
            onClick={() => handleQuickCommand('Voice over overview')}
            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium"
          >
            <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            Read Financials Aloud
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'voice' && (
            <div className="space-y-4">
              {/* Pronunciation & Accent Quick Status Bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {supportedLanguages.find((l) => l.code === (settings.language || 'en-US'))?.flag || '🌐'}
                  </span>
                  <span className="text-slate-600">
                    Pronunciation Dialect: <strong className="text-slate-900">{supportedLanguages.find((l) => l.code === (settings.language || 'en-US'))?.name || 'English (US)'}</strong>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                    {settings.clarityMode === 'crisp_slow' ? '0.85x Deliberate' : settings.clarityMode === 'natural' ? '1.0x Natural' : '0.92x High Clarity'}
                  </span>
                </div>
                <button
                  id="voice-quick-tune-pronunciation-btn"
                  onClick={() => setActiveTabState('settings')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Sliders className="w-3 h-3" />
                  Adjust Accent / Speed
                </button>
              </div>

              {/* Interactive Audio Wave & Visualizer Hero */}
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 p-6 text-center text-white border border-slate-800 shadow-inner overflow-hidden">
                {/* Background ambient glow */}
                <div
                  className={`absolute inset-0 opacity-20 pointer-events-none transition-all duration-700 ${
                    isListening
                      ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500'
                      : isSpeaking
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                      : 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700'
                  }`}
                />

                {/* Animated Waveform Bars */}
                <div className="flex items-center justify-center gap-1.5 h-16 mb-4">
                  {[40, 65, 85, 100, 75, 90, 50, 80, 95, 60, 45, 70, 85, 30].map((height, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-150 ${
                        isListening
                          ? 'bg-rose-400'
                          : isSpeaking
                          ? 'bg-emerald-400'
                          : 'bg-slate-700'
                      }`}
                      style={{
                        height:
                          isListening || isSpeaking
                            ? `${Math.max(12, (height * (isListening ? 0.9 : 0.7) * (0.5 + Math.sin(Date.now() / 150 + i) * 0.5)))}px`
                            : '8px',
                      }}
                    />
                  ))}
                </div>

                {/* Status Message */}
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-slate-300">
                    {isListening && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                    {isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                    {status === 'listening'
                      ? 'Listening to your voice... (Speak now)'
                      : status === 'processing'
                      ? 'Processing accounting command...'
                      : status === 'speaking'
                      ? 'VoiceOver is speaking...'
                      : 'Press microphone or press "V" to talk'}
                  </div>

                  {/* Live Transcript Display */}
                  <div className="min-h-[48px] flex items-center justify-center">
                    {interimTranscript || transcript ? (
                      <p className="text-base sm:text-lg font-medium text-emerald-300 tracking-wide animate-fadeIn">
                        "{transcript || interimTranscript}"
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        Try saying: "Create invoice for 500 dollars" or "What is my net profit?"
                      </p>
                    )}
                  </div>
                </div>

                {/* Big Microphone Push-to-Talk Button */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    id="voice-mic-main-toggle"
                    onClick={toggleListening}
                    disabled={!isSupported}
                    className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all shadow-lg ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 scale-105'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-102'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isListening ? (
                      <>
                        <Square className="w-4 h-4 fill-white" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Start Speaking (Key: V)
                      </>
                    )}
                  </button>

                  {isSpeaking && (
                    <button
                      id="voice-stop-speech-btn"
                      onClick={stopSpeaking}
                      className="px-4 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
                      title="Mute current speech"
                    >
                      <VolumeX className="w-4 h-4 text-rose-400" />
                      Stop VoiceOver
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <div className="mt-3 text-xs text-rose-400 bg-rose-950/50 border border-rose-900/80 rounded-lg p-2 flex items-center justify-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Typed Voice Command Alternative Form */}
              <form onSubmit={handleManualSubmit} className="relative">
                <input
                  id="voice-manual-command-input"
                  type="text"
                  value={typedCommand}
                  onChange={(e) => setTypedCommand(e.target.value)}
                  placeholder="Or type any command (e.g., 'Create invoice for $1,200', 'Go to reports')..."
                  className="w-full pl-4 pr-24 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white shadow-sm font-medium"
                />
                <button
                  id="voice-manual-submit-btn"
                  type="submit"
                  disabled={!typedCommand.trim() || isProcessingManual}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Execute
                </button>
              </form>

              {/* Sample Voice Commands Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    One-Click Voice Commands (Tap to execute)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Auto-VoiceOver spoken</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {sampleCommands.map((item, idx) => (
                    <button
                      key={idx}
                      id={`voice-sample-cmd-${idx}`}
                      onClick={() => handleQuickCommand(item.cmd)}
                      className="p-2.5 text-left bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 rounded-xl transition-all group text-xs text-slate-700 font-semibold flex items-center justify-between"
                    >
                      <span className="truncate group-hover:text-emerald-900">{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 flex-shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Voice Action & Execution History</h3>
                  <p className="text-xs text-slate-500">Log of recognized voice commands and executed actions</p>
                </div>
                {history.length > 0 && (
                  <button
                    id="voice-clear-history-btn"
                    onClick={clearHistory}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Mic className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No voice commands recorded yet.</p>
                  <p className="text-xs text-slate-500">Tap the microphone and speak your first accounting instruction!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.success ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-900">
                            "{item.command}"
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                          {item.actionTaken}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {item.response}
                      </p>

                      <div className="flex justify-end">
                        <button
                          id={`voice-replay-${item.id}`}
                          onClick={() => speak(item.response)}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <Volume2 className="w-3 h-3" />
                          Replay VoiceOver
                        </button>
                      </div>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-emerald-600" />
                  Spoken Language & Pronunciation Clarity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize pronunciation accent, enunciation cadence, and phonetic number normalization so speech is always crisp and clear.
                </p>
              </div>

              {/* Pronunciation Dialect & Regional Accent */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    Pronunciation Dialect & Accent
                  </label>
                  <span className="text-[11px] text-slate-400">Affects both voice synthesis and microphone recognition</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {supportedLanguages.map((lang) => {
                    const isSelected = (settings.language || 'en-US') === lang.code;
                    return (
                      <button
                        key={lang.code}
                        id={`voice-lang-select-${lang.code.toLowerCase()}`}
                        onClick={() => {
                          updateSettings({ language: lang.code, voiceUri: '' });
                          speak(`Pronunciation dialect set to ${lang.name}.`);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{lang.flag}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <div className="text-xs font-bold text-slate-900">{lang.name}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{lang.clarityTip}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clarity & Enunciation Mode */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Pronunciation Clarity & Cadence
                  </label>
                  <span className="text-[11px] text-slate-400">Pacing & syllable articulation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    id="voice-clarity-high-btn"
                    onClick={() => {
                      updateSettings({ clarityMode: 'high_clarity', speechRate: 0.92 });
                      speak('High clarity mode activated. Syllables and numbers are articulated clearly.');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.clarityMode === 'high_clarity' || (!settings.clarityMode && settings.speechRate === 0.92)
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>💎 High Clarity</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-mono">0.92x</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Slightly measured pace with clear syllable stress. Recommended for numbers and currency.
                    </p>
                  </button>

                  <button
                    id="voice-clarity-slow-btn"
                    onClick={() => {
                      updateSettings({ clarityMode: 'crisp_slow', speechRate: 0.85 });
                      speak('Deliberate mode activated. Slower pace for maximum comprehension.');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.clarityMode === 'crisp_slow' || settings.speechRate <= 0.85
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>🐢 Crisp & Deliberate</span>
                      <span className="text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono">0.85x</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Slower rate with distinct breathing pauses between amounts, client names, and IDs.
                    </p>
                  </button>

                  <button
                    id="voice-clarity-natural-btn"
                    onClick={() => {
                      updateSettings({ clarityMode: 'natural', speechRate: 1.0 });
                      speak('Natural speed mode activated.');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.clarityMode === 'natural' || settings.speechRate === 1.0
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>⚡ Natural Pace</span>
                      <span className="text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono">1.0x</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Standard conversational speed for fast interactions.
                    </p>
                  </button>
                </div>
              </div>

              {/* Phonetic Normalization Toggle */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">Phonetic Currency & Acronym Normalization</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">Recommended</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Converts symbols and codes into clear phonetic words before speaking: converts <strong>$5.00</strong> to <em>"5 dollars"</em>, <strong>INV-2026-0004</strong> to <em>"invoice number 4"</em>, <strong>1 pc</strong> to <em>"1 piece"</em>, and expands test acronyms like <strong>TTT</strong> to <em>"T-T-T"</em> so the voice never mumbles or mispronounces terms.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                  <input
                    id="voice-toggle-phonetic-switch"
                    type="checkbox"
                    checked={settings.phoneticPronunciation !== false}
                    onChange={(e) => updateSettings({ phoneticPronunciation: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Voice Profile Selector (Filtered to active language) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="voice-select" className="text-xs font-bold text-slate-700">
                    Speech Synthesizer Voice Profile
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Showing voices for {supportedLanguages.find((l) => l.code === (settings.language || 'en-US'))?.name || 'English'}
                  </span>
                </div>
                <select
                  id="voice-select"
                  value={settings.voiceUri}
                  onChange={(e) => updateSettings({ voiceUri: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">⭐ Default Natural High-Clarity Voice (Recommended)</option>
                  {availableVoices
                    .filter((v) => {
                      const prefix = (settings.language || 'en-US').split('-')[0].toLowerCase();
                      return v.lang.toLowerCase().replace('_', '-').startsWith(prefix);
                    })
                    .sort((a, b) => {
                      const aIsNatural = a.name.includes('Natural') || a.name.includes('Google') || a.name.includes('Samantha') || a.name.includes('Daniel') || a.name.includes('Rishi');
                      const bIsNatural = b.name.includes('Natural') || b.name.includes('Google') || b.name.includes('Samantha') || b.name.includes('Daniel') || b.name.includes('Rishi');
                      if (aIsNatural && !bIsNatural) return -1;
                      if (!aIsNatural && bIsNatural) return 1;
                      return a.name.localeCompare(b.name);
                    })
                    .map((voice) => {
                      const isHighQuality = voice.name.includes('Natural') || voice.name.includes('Google') || voice.name.includes('Premium') || voice.name.includes('Enhanced');
                      return (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {isHighQuality ? '⭐ ' : ''}{voice.name} ({voice.lang})
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Speech Rate & Pitch Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Speed / Rate:</span>
                    <span className="text-emerald-700 font-mono">{settings.speechRate.toFixed(2)}x</span>
                  </div>
                  <input
                    id="voice-speed-slider"
                    type="range"
                    min="0.75"
                    max="1.30"
                    step="0.05"
                    value={settings.speechRate}
                    onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.75x (Very Clear)</span>
                    <span>0.92x (Ideal)</span>
                    <span>1.30x (Fast)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Voice Pitch / Tone:</span>
                    <span className="text-emerald-700 font-mono">{settings.speechPitch.toFixed(2)}x</span>
                  </div>
                  <input
                    id="voice-pitch-slider"
                    type="range"
                    min="0.80"
                    max="1.20"
                    step="0.05"
                    value={settings.speechPitch}
                    onChange={(e) => updateSettings({ speechPitch: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.80x (Deeper)</span>
                    <span>1.00x (Neutral)</span>
                    <span>1.20x (Higher)</span>
                  </div>
                </div>
              </div>

              {/* Audio UI Chimes & Auto-Spoken Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">Auto-Spoken Confirmation</h4>
                    <p className="text-[10px] text-slate-500">Speak answers and confirmations aloud</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="voice-toggle-autospeak-switch"
                      type="checkbox"
                      checked={settings.autoSpeakResponses}
                      onChange={(e) => updateSettings({ autoSpeakResponses: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">Audio UI Chimes</h4>
                    <p className="text-[10px] text-slate-500">Melodic chimes on listening & success</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="voice-toggle-chimes-switch"
                      type="checkbox"
                      checked={settings.soundEffectsEnabled}
                      onChange={(e) => updateSettings({ soundEffectsEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Pronunciation Audition & Studio */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pronunciation Audition Studio</h4>
                  </div>
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="px-2 py-0.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 rounded text-[10px] font-bold flex items-center gap-1"
                    >
                      <Square className="w-2.5 h-2.5 fill-rose-300" />
                      Stop Speaking
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300">
                  Click any sample phrase below to test how the current dialect and pronunciation engine enunciate currency, invoice IDs, and product names:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    id="voice-test-invoice-btn"
                    onClick={() => speak('Created invoice number 4 for A-B-C with 1 piece of T-T-T at the rate of 5 dollars. Total invoice amount is 5 dollars.')}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors"
                  >
                    <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                      Invoice & Items Test
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      "Created invoice number 4 for A-B-C with 1 piece of T-T-T at rate 5 dollars."
                    </div>
                  </button>

                  <button
                    id="voice-test-finance-btn"
                    onClick={() => speak(`Financial summary: Net Income is ${formatCurrency(profitAndLoss.netIncome, selectedCurrency)} with ${cashFlow.runwayMonths.toFixed(1)} months of cash runway.`)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors"
                  >
                    <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
                      Financial Health Test
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      "Net income is 14,200 dollars with 8.5 months of cash runway."
                    </div>
                  </button>

                  <button
                    id="voice-test-inventory-btn"
                    onClick={() => speak('Profit and Loss statement: Cost of Goods Sold is 3,200 dollars. Gross profit margin is 68 percent.')}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-colors"
                  >
                    <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                      Accounting & P&L Test
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      "Profit and Loss statement: Cost of Goods Sold is 3,200 dollars."
                    </div>
                  </button>
                </div>

                {/* Custom Phrase Input */}
                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  <input
                    id="voice-custom-test-phrase-input"
                    type="text"
                    value={customTestPhrase}
                    onChange={(e) => setCustomTestPhrase(e.target.value)}
                    placeholder="Type any word or phrase to test pronunciation..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    id="voice-speak-custom-phrase-btn"
                    onClick={() => {
                      if (customTestPhrase.trim()) {
                        speak(customTestPhrase);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors flex-shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Speak Phrase
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Hotkey: Press <strong>V</strong> anywhere to talk</span>
          </div>
          <span>ARIA / Screen-Reader live region enabled</span>
        </div>
      </div>
    </div>
  );
};
