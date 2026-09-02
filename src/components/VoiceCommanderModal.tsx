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
    { label: '📄 Create Invoice for $500', cmd: 'Create invoice for 500 dollars' },
    { label: '💳 Log $150 Office Expense', cmd: 'Record purchase of 150 dollars for Office Supplies' },
    { label: '📊 What is my Net Income?', cmd: 'What is my net income?' },
    { label: '⏳ What is my Cash Runway?', cmd: 'What is my cash runway?' },
    { label: '🧾 Scan Receipt with OCR', cmd: 'Scan receipt' },
    { label: '📈 Go to Financial Reports', cmd: 'Go to reports' },
    { label: '📦 Check Inventory & Stock', cmd: 'Go to inventory' },
    { label: '👥 Add New Client', cmd: 'Add new client' },
    { label: '💱 Switch Currency to EUR', cmd: 'Switch currency to EUR' },
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
              VoiceOver Settings
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
            <div className="space-y-5">
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
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">VoiceOver & Speech Configuration</h3>
                <p className="text-xs text-slate-500">Customize audio synthesis, voice timbre, speech rate and feedback</p>
              </div>

              {/* Automatic Readout Toggle */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900">Auto-Spoken VoiceOver Feedback</h4>
                  <p className="text-xs text-slate-500">Speak confirmations and financial answers aloud automatically</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="voice-toggle-autospeak-switch"
                    type="checkbox"
                    checked={settings.autoSpeakResponses}
                    onChange={(e) => updateSettings({ autoSpeakResponses: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Sound Effects Toggle */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900">Audio UI Chimes</h4>
                  <p className="text-xs text-slate-500">Play pleasant melodic tones on speech activation and action success</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="voice-toggle-chimes-switch"
                    type="checkbox"
                    checked={settings.soundEffectsEnabled}
                    onChange={(e) => updateSettings({ soundEffectsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Voice Selector */}
              {availableVoices.length > 0 && (
                <div className="space-y-1.5">
                  <label htmlFor="voice-select" className="text-xs font-bold text-slate-700">
                    Voiceover Persona & Voice Profile
                  </label>
                  <select
                    id="voice-select"
                    value={settings.voiceUri}
                    onChange={(e) => updateSettings({ voiceUri: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Default Natural Voice (Recommended)</option>
                    {availableVoices
                      .filter((v) => v.lang.startsWith('en'))
                      .map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Speech Rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Voice Speed / Rate:</span>
                  <span className="text-emerald-700">{settings.speechRate.toFixed(1)}x</span>
                </div>
                <input
                  id="voice-speed-slider"
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={settings.speechRate}
                  onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>0.8x (Deliberate)</span>
                  <span>1.0x (Standard)</span>
                  <span>1.5x (Fast)</span>
                </div>
              </div>

              {/* Test Voice Button */}
              <div className="pt-2">
                <button
                  id="voice-test-sample-btn"
                  onClick={() => speak(`VoiceOver active. Net Income is ${formatCurrency(profitAndLoss.netIncome, selectedCurrency)} with ${cashFlow.runwayMonths.toFixed(1)} months of cash runway.`)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Test Voice & Settings
                </button>
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
