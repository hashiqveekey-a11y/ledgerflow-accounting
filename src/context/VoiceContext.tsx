import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAccounting } from './AccountingContext';
import { formatCurrency } from '../utils/accountingMath';
import { soundEffects } from '../utils/audioChimes';
import { CurrencyCode, TabType } from '../types';

export interface VoiceHistoryItem {
  id: string;
  command: string;
  response: string;
  actionTaken: string;
  timestamp: string;
  success: boolean;
}

export interface VoiceSettings {
  enabled: boolean;
  autoSpeakResponses: boolean;
  soundEffectsEnabled: boolean;
  speechRate: number; // 0.8 - 1.5
  speechPitch: number; // 0.8 - 1.2
  voiceUri: string;
}

interface VoiceContextType {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  history: VoiceHistoryItem[];
  settings: VoiceSettings;
  availableVoices: SpeechSynthesisVoice[];
  isVoiceWidgetOpen: boolean;
  liveAnnouncement: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  setIsVoiceWidgetOpen: (open: boolean) => void;
  processVoiceCommand: (rawText: string) => Promise<string>;
  clearHistory: () => void;
  announce: (message: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const accounting = useAccounting();
  const {
    activeTab,
    setActiveTab,
    profitAndLoss,
    balanceSheet,
    cashFlow,
    invoices,
    expenses,
    inventoryItems,
    clients,
    vendors,
    ledgerAccounts,
    selectedCurrency,
    setSelectedCurrency,
    setIsInvoiceModalOpen,
    setSelectedInvoiceForEdit,
    setIsPurchaseInvoiceModalOpen,
    setSelectedPurchaseInvoiceForEdit,
    setIsExpenseModalOpen,
    setIsClientModalOpen,
    setIsVendorModalOpen,
    setIsLedgerModalOpen,
    businessProfile,
    runAutomatedRecurringEngine,
    lockSession,
    askAICopilot,
    executeAIAction,
  } = accounting;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<VoiceHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ledgerflow_voice_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isVoiceWidgetOpen, setIsVoiceWidgetOpen] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem('ledgerflow_voice_settings');
      return saved
        ? JSON.parse(saved)
        : {
            enabled: true,
            autoSpeakResponses: true,
            soundEffectsEnabled: true,
            speechRate: 1.0,
            speechPitch: 1.0,
            voiceUri: '',
          };
    } catch {
      return {
        enabled: true,
        autoSpeakResponses: true,
        soundEffectsEnabled: true,
        speechRate: 1.0,
        speechPitch: 1.0,
        voiceUri: '',
      };
    }
  });

  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Sync settings
  useEffect(() => {
    localStorage.setItem('ledgerflow_voice_settings', JSON.stringify(settings));
    soundEffects.setMuted(!settings.soundEffectsEnabled);
  }, [settings]);

  // Sync history
  useEffect(() => {
    localStorage.setItem('ledgerflow_voice_history', JSON.stringify(history.slice(-30)));
  }, [history]);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  const announce = useCallback((message: string) => {
    setLiveAnnouncement(message);
    // Clear after 3 seconds so subsequent identical messages re-trigger aria-live
    setTimeout(() => {
      setLiveAnnouncement('');
    }, 3000);
  }, []);

  // Text-To-Speech function
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !settings.autoSpeakResponses) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.speechRate || 1.0;
      utterance.pitch = settings.speechPitch || 1.0;

      if (settings.voiceUri && availableVoices.length > 0) {
        const foundVoice = availableVoices.find((v) => v.voiceURI === settings.voiceUri);
        if (foundVoice) utterance.voice = foundVoice;
      } else if (availableVoices.length > 0) {
        // Prefer natural English voices
        const enVoice = availableVoices.find(
          (v) => (v.lang.startsWith('en') && v.name.includes('Natural')) || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
        ) || availableVoices.find((v) => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setStatus('speaking');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setStatus('idle');
        onEnd?.();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setStatus('idle');
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
      announce(text);
    },
    [settings, availableVoices, announce]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setStatus('idle');
  }, []);

  // Voice Command Execution Core ("when say something do like that")
  const processVoiceCommand = useCallback(
    async (rawText: string): Promise<string> => {
      const text = rawText.trim();
      if (!text) return '';

      setStatus('processing');
      const lower = text.toLowerCase();
      let responseText = '';
      let actionTaken = 'General Query';
      let success = true;

      try {
        // 1. Navigation Commands
        if (lower.includes('go to') || lower.includes('open') || lower.includes('show') || lower.includes('navigate to') || lower.includes('switch to')) {
          if (lower.includes('dashboard') || lower.includes('home') || lower.includes('overview')) {
            setActiveTab('dashboard');
            responseText = 'Navigating to Dashboard overview.';
            actionTaken = 'Navigate -> Dashboard';
          } else if (lower.includes('invoice') || lower.includes('sales') || lower.includes('billing')) {
            setActiveTab('invoices');
            responseText = 'Opening Sales and Invoices.';
            actionTaken = 'Navigate -> Invoices';
          } else if (lower.includes('purchase') || lower.includes('bills') || lower.includes('supplier invoice') || lower.includes('purchase order')) {
            setActiveTab('purchase_invoices');
            responseText = 'Opening Purchase Invoices and Bills.';
            actionTaken = 'Navigate -> Purchase Invoices';
          } else if (lower.includes('expense') || lower.includes('spending')) {
            setActiveTab('expenses');
            responseText = 'Opening Expenses log.';
            actionTaken = 'Navigate -> Expenses';
          } else if (lower.includes('inventory') || lower.includes('stock') || lower.includes('products') || lower.includes('items')) {
            setActiveTab('inventory');
            responseText = 'Opening Inventory and Stock management.';
            actionTaken = 'Navigate -> Inventory';
          } else if (lower.includes('ledger') || lower.includes('chart of accounts') || lower.includes('accounts')) {
            setActiveTab('ledger');
            responseText = 'Opening General Ledger and Chart of Accounts.';
            actionTaken = 'Navigate -> Ledger';
          } else if (lower.includes('report') || lower.includes('p&l') || lower.includes('profit and loss') || lower.includes('balance sheet') || lower.includes('cash flow')) {
            setActiveTab('reports');
            responseText = 'Opening Financial Reports and Statements.';
            actionTaken = 'Navigate -> Reports';
          } else if (lower.includes('bank') || lower.includes('reconciliation') || lower.includes('statement')) {
            setActiveTab('bank_feed');
            responseText = 'Opening Bank Reconciliation and Feeds.';
            actionTaken = 'Navigate -> Bank Feed';
          } else if (lower.includes('client') || lower.includes('customer')) {
            setActiveTab('clients');
            responseText = 'Opening Customer and Client Directory.';
            actionTaken = 'Navigate -> Clients';
          } else if (lower.includes('vendor') || lower.includes('supplier')) {
            setActiveTab('vendors');
            responseText = 'Opening Vendor and Supplier Directory.';
            actionTaken = 'Navigate -> Vendors';
          } else if (lower.includes('voucher') || lower.includes('receipt voucher')) {
            setActiveTab('vouchers');
            responseText = 'Opening Payment and Receipt Vouchers.';
            actionTaken = 'Navigate -> Vouchers';
          } else if (lower.includes('ai insight') || lower.includes('predict') || lower.includes('intelligence')) {
            setActiveTab('ai_insights');
            responseText = 'Opening AI Predictive Insights.';
            actionTaken = 'Navigate -> AI Insights';
          } else if (lower.includes('setting') || lower.includes('preference') || lower.includes('profile')) {
            setActiveTab('settings');
            responseText = 'Opening Organization Settings.';
            actionTaken = 'Navigate -> Settings';
          }
        }

        // 2. Direct Actions: Create Sale / Invoice
        if (!responseText && (lower.includes('create invoice') || lower.includes('create sale') || lower.includes('new invoice') || lower.includes('bill client') || lower.includes('make invoice'))) {
          // Extract amount if spoken (e.g. "for 500 dollars" or "$500")
          const amountMatch = text.match(/\$?(\d+(\.\d{1,2})?)\s*(dollars|usd|bucks)?/i);
          const amount = amountMatch ? parseFloat(amountMatch[1]) : 1000;

          // Extract client name if mentioned
          let matchedClient = clients[0];
          for (const c of clients) {
            if (lower.includes(c.name.toLowerCase())) {
              matchedClient = c;
              break;
            }
          }

          setSelectedInvoiceForEdit(null);
          setIsInvoiceModalOpen(true);
          responseText = `Opened Invoice Creator for ${matchedClient ? matchedClient.name : 'client'} with amount ${formatCurrency(amount, selectedCurrency)}.`;
          actionTaken = 'Action -> Open Invoice Creator';
        }

        // 3. Direct Actions: Log Purchase / Record Expense
        if (!responseText && (lower.includes('log expense') || lower.includes('record expense') || lower.includes('new expense') || lower.includes('add expense') || lower.includes('log purchase') || lower.includes('record purchase') || lower.includes('new purchase'))) {
          setIsExpenseModalOpen(true);
          responseText = 'Opened Expense & Purchase logger.';
          actionTaken = 'Action -> Open Expense Logger';
        }

        // 4. Direct Actions: Scan Receipt
        if (!responseText && (lower.includes('scan receipt') || lower.includes('upload receipt') || lower.includes('ocr receipt') || lower.includes('receipt scanner'))) {
          // We can trigger receipt scanner via action intent or direct state
          executeAIAction({ type: 'scan_receipt' });
          responseText = 'Launching AI Receipt & OCR Scanner.';
          actionTaken = 'Action -> Scan Receipt';
        }

        // 5. Direct Actions: Add Client / Vendor / Ledger Account
        if (!responseText && (lower.includes('add client') || lower.includes('new client') || lower.includes('create client') || lower.includes('add customer'))) {
          setIsClientModalOpen(true);
          responseText = 'Opening New Client registration modal.';
          actionTaken = 'Action -> Add Client';
        } else if (!responseText && (lower.includes('add vendor') || lower.includes('new vendor') || lower.includes('create vendor') || lower.includes('add supplier'))) {
          setIsVendorModalOpen(true);
          responseText = 'Opening New Vendor registration modal.';
          actionTaken = 'Action -> Add Vendor';
        } else if (!responseText && (lower.includes('add ledger') || lower.includes('create ledger') || lower.includes('new ledger') || lower.includes('new account') || lower.includes('create account'))) {
          setIsLedgerModalOpen(true);
          responseText = 'Opening Chart of Accounts ledger creator.';
          actionTaken = 'Action -> Add Ledger Account';
        }

        // 6. Voice Inquiries: Financial Health & Readouts
        if (!responseText) {
          if (lower.includes('net income') || lower.includes('profit') || lower.includes('how much did we make') || lower.includes('earnings')) {
            const net = profitAndLoss.netIncome;
            const margin = profitAndLoss.netProfitMarginPercentage.toFixed(1);
            responseText = `Your current Net Income is ${formatCurrency(net, selectedCurrency)}, representing a ${margin}% profit margin on ${formatCurrency(profitAndLoss.totalRevenue, selectedCurrency)} total revenue.`;
            actionTaken = 'Query -> Profit & Loss';
          } else if (lower.includes('revenue') || lower.includes('total sales') || lower.includes('gross income')) {
            responseText = `Total revenue is ${formatCurrency(profitAndLoss.totalRevenue, selectedCurrency)} with a Gross Profit of ${formatCurrency(profitAndLoss.grossProfit, selectedCurrency)}.`;
            actionTaken = 'Query -> Revenue';
          } else if (lower.includes('runway') || lower.includes('cash runway') || lower.includes('burn rate')) {
            responseText = `Your business has approximately ${cashFlow.runwayMonths.toFixed(1)} months of cash runway based on your current operating expenses and cash reserves of ${formatCurrency(balanceSheet.assets.currentAssets.cashAndEquivalents, selectedCurrency)}.`;
            actionTaken = 'Query -> Cash Runway';
          } else if (lower.includes('overdue') || lower.includes('unpaid') || lower.includes('receivable') || lower.includes('who owes')) {
            const overdueList = invoices.filter((i) => i.status === 'overdue');
            const totalOverdue = overdueList.reduce((sum, i) => sum + i.balanceDue, 0);
            responseText = `You have ${overdueList.length} overdue invoices totaling ${formatCurrency(totalOverdue, selectedCurrency)}. Accounts receivable total is ${formatCurrency(balanceSheet.assets.currentAssets.accountsReceivable, selectedCurrency)}.`;
            actionTaken = 'Query -> Overdue Invoices';
          } else if (lower.includes('asset') || lower.includes('liability') || lower.includes('balance sheet') || lower.includes('equity')) {
            responseText = `Total Assets are ${formatCurrency(balanceSheet.assets.totalAssets, selectedCurrency)}, Total Liabilities are ${formatCurrency(balanceSheet.liabilities.totalLiabilities, selectedCurrency)}, and Total Equity stands at ${formatCurrency(balanceSheet.equity.totalEquity, selectedCurrency)}.`;
            actionTaken = 'Query -> Balance Sheet';
          } else if (lower.includes('inventory') || lower.includes('stockout') || lower.includes('low stock') || lower.includes('reorder')) {
            const lowStock = inventoryItems.filter((i) => i.quantityOnHand <= i.reorderLevel);
            responseText = `You are tracking ${inventoryItems.length} items. There are ${lowStock.length} items currently at or below their reorder threshold.`;
            actionTaken = 'Query -> Inventory Status';
          } else if (lower.includes('summarize') || lower.includes('overview') || lower.includes('financial health') || lower.includes('read page') || lower.includes('voice over')) {
            responseText = `Here is your VoiceOver financial summary: Revenue is ${formatCurrency(profitAndLoss.totalRevenue, selectedCurrency)}, Net Income is ${formatCurrency(profitAndLoss.netIncome, selectedCurrency)}, and Cash Reserves are ${formatCurrency(balanceSheet.assets.currentAssets.cashAndEquivalents, selectedCurrency)} providing ${cashFlow.runwayMonths.toFixed(1)} months of runway.`;
            actionTaken = 'VoiceOver -> Executive Overview';
          }
        }

        // 7. Currency & Utility Commands
        if (!responseText) {
          const curMap: Record<string, CurrencyCode> = {
            usd: 'USD',
            dollar: 'USD',
            dollars: 'USD',
            eur: 'EUR',
            euro: 'EUR',
            euros: 'EUR',
            gbp: 'GBP',
            pound: 'GBP',
            pounds: 'GBP',
            cad: 'CAD',
            aud: 'AUD',
            jpy: 'JPY',
            yen: 'JPY',
            inr: 'INR',
            rupee: 'INR',
            rupees: 'INR',
            chf: 'CHF',
            franc: 'CHF',
          };

          for (const [key, code] of Object.entries(curMap)) {
            if (lower.includes(`switch currency to ${key}`) || lower.includes(`set currency to ${key}`) || lower.includes(`change currency to ${key}`)) {
              setSelectedCurrency(code);
              responseText = `Currency switched to ${code}.`;
              actionTaken = `Config -> Set Currency ${code}`;
              break;
            }
          }
        }

        if (!responseText && (lower.includes('lock screen') || lower.includes('lock app') || lower.includes('lock session'))) {
          lockSession();
          responseText = 'Screen session locked for security.';
          actionTaken = 'Security -> Lock Session';
        } else if (!responseText && (lower.includes('run automation') || lower.includes('recurring engine') || lower.includes('process recurring'))) {
          runAutomatedRecurringEngine();
          responseText = 'Automated recurring engine executed successfully.';
          actionTaken = 'Automation -> Run Engine';
        }

        // 8. Fallback to AI Copilot Reasoning & Action Intent Engine
        if (!responseText) {
          const aiResponse = await askAICopilot(text);
          responseText = aiResponse.reply;
          if (aiResponse.action && aiResponse.action.type !== 'none') {
            executeAIAction(aiResponse.action);
            actionTaken = `AI Action -> ${aiResponse.action.type}`;
          } else {
            actionTaken = 'AI Financial Copilot Response';
          }
        }

        soundEffects.playSuccessTone();
      } catch (err: any) {
        console.error('Error processing voice command:', err);
        success = false;
        responseText = `I heard: "${text}". Please specify a command like "Go to reports", "Create invoice", or "What is my net income?".`;
        actionTaken = 'Error / Unrecognized';
        soundEffects.playErrorTone();
      }

      const newHistoryItem: VoiceHistoryItem = {
        id: `voice-${Date.now()}`,
        command: text,
        response: responseText,
        actionTaken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        success,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 29)]);

      // Speak response back with VoiceOver TTS
      speak(responseText);

      return responseText;
    },
    [
      setActiveTab,
      profitAndLoss,
      balanceSheet,
      cashFlow,
      invoices,
      expenses,
      inventoryItems,
      clients,
      vendors,
      selectedCurrency,
      setSelectedCurrency,
      setIsInvoiceModalOpen,
      setSelectedInvoiceForEdit,
      setIsExpenseModalOpen,
      setIsClientModalOpen,
      setIsVendorModalOpen,
      setIsLedgerModalOpen,
      runAutomatedRecurringEngine,
      lockSession,
      askAICopilot,
      executeAIAction,
      speak,
    ]
  );

  // Initialize Web Speech Recognition
  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. You can type commands or enable VoiceOver readouts.');
      setStatus('error');
      return;
    }

    try {
      window.speechSynthesis?.cancel(); // stop any ongoing speech
      soundEffects.playListeningTone();
      setErrorMessage(null);
      setTranscript('');
      setInterimTranscript('');

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTrans += trans;
          } else {
            currentInterim += trans;
          }
        }

        if (currentInterim) setInterimTranscript(currentInterim);
        if (finalTrans) {
          setTranscript(finalTrans);
          setInterimTranscript('');
          processVoiceCommand(finalTrans);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMessage(`Voice recognition: ${event.error}`);
        }
        setIsListening(false);
        setStatus('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage('Microphone access denied or busy. Please check browser permissions.');
      setIsListening(false);
      setStatus('error');
    }
  }, [isSupported, processVoiceCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setStatus('idle');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('ledgerflow_voice_history');
  }, []);

  // Global Keyboard Hotkey: Press 'v' when not in input/textarea to toggle voice listening
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isInput) return;

      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setIsVoiceWidgetOpen(true);
        toggleListening();
      } else if (e.key === 'Escape') {
        if (isSpeaking) stopSpeaking();
        if (isListening) stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, isListening, toggleListening, stopSpeaking, stopListening]);

  return (
    <VoiceContext.Provider
      value={{
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
        isVoiceWidgetOpen,
        liveAnnouncement,
        startListening,
        stopListening,
        toggleListening,
        speak,
        stopSpeaking,
        updateSettings,
        setIsVoiceWidgetOpen,
        processVoiceCommand,
        clearHistory,
        announce,
      }}
    >
      {children}
      {/* Hidden Accessible Live Region for Screen Readers & VoiceOver */}
      <div
        id="voiceover-live-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
