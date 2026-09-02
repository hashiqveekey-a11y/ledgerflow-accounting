import React, { useState } from 'react';
import { useVoice } from '../context/VoiceContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Maximize2,
  Square,
  HelpCircle,
} from 'lucide-react';

export const VoiceFloatingWidget: React.FC<{
  onOpenFullModal: () => void;
}> = ({ onOpenFullModal }) => {
  const {
    isListening,
    isSpeaking,
    status,
    transcript,
    interimTranscript,
    toggleListening,
    stopSpeaking,
    settings,
    updateSettings,
  } = useVoice();

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 no-print"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expanded Live Speech Balloon / Action Status */}
      {(isListening || isSpeaking || isHovered || interimTranscript) && (
        <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs p-3 rounded-2xl shadow-xl border border-slate-700/80 max-w-xs animate-fadeIn space-y-2">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Voice Commander</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                id="voice-widget-mute-toggle"
                onClick={() => updateSettings({ autoSpeakResponses: !settings.autoSpeakResponses })}
                className="p-1 text-slate-400 hover:text-white rounded"
                title={settings.autoSpeakResponses ? 'Mute VoiceOver' : 'Unmute VoiceOver'}
              >
                {settings.autoSpeakResponses ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              <button
                id="voice-widget-expand-btn"
                onClick={onOpenFullModal}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Expand Voice Modal"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-slate-300 min-h-[24px]">
            {isListening ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-rose-300 font-medium italic truncate">
                  {interimTranscript || transcript || 'Listening... speak command'}
                </span>
              </div>
            ) : isSpeaking ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-300 font-medium italic">VoiceOver speaking...</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Say: <em>"Create invoice"</em>, <em>"Log expense"</em>, or <em>"Go to reports"</em>. Press <strong>V</strong> to talk.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {isSpeaking && (
          <button
            id="voice-widget-stop-speech"
            onClick={stopSpeaking}
            className="px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold rounded-full shadow-lg flex items-center gap-1.5 transition-all animate-fadeIn"
            title="Stop VoiceOver readout"
          >
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            <span>Stop Audio</span>
          </button>
        )}

        <button
          id="voice-widget-mic-btn"
          onClick={toggleListening}
          aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
          className={`relative group p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
            isListening
              ? 'bg-rose-600 text-white shadow-rose-600/50 ring-4 ring-rose-500/30 scale-110'
              : isSpeaking
              ? 'bg-emerald-600 text-white shadow-emerald-600/50 ring-4 ring-emerald-500/30'
              : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 hover:scale-105 shadow-slate-950/40'
          }`}
          title="VoiceOver Assistant (Press V)"
        >
          {isListening ? (
            <Mic className="w-6 h-6 animate-pulse" />
          ) : isSpeaking ? (
            <Volume2 className="w-6 h-6 animate-pulse" />
          ) : (
            <Mic className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300" />
          )}

          {/* Active Ping Dot */}
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
