import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAccounting } from './AccountingContext';
import { formatCurrency } from '../utils/accountingMath';
import { soundEffects } from '../utils/audioChimes';
import { CurrencyCode, TabType } from '../types';
import {
  parseInvoiceVoiceCommand,
  parsePurchaseVoiceCommand,
  parseVoiceOpenIntent,
} from '../utils/voiceCommandParser';
import {
  formatTextForSpeech,
  selectBestVoice,
  SUPPORTED_VOICE_LANGUAGES,
  VoiceLanguageOption,
  getClarityAudioConfig,
} from '../utils/speechPronunciation';

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
  speechRate: number; // 0.8 - 1.5, default 0.92 for crystal-clear diction
  speechPitch: number; // 0.8 - 1.2
  voiceUri: string;
  language: string; // 'en-US' | 'en-IN' | 'en-GB' | 'en-AU' | 'en-CA'
  clarityMode: 'high_clarity' | 'natural' | 'crisp_slow';
  phoneticPronunciation: boolean;
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
  supportedLanguages: VoiceLanguageOption[];
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
    isAICopilotOpen,
    setIsAICopilotOpen,
    isReceiptScannerOpen,
    setIsReceiptScannerOpen,
    isInventoryModalOpen,
    setIsInventoryModalOpen,
    isStockAdjustmentModalOpen,
    setIsStockAdjustmentModalOpen,
    isPaymentVoucherModalOpen,
    setIsPaymentVoucherModalOpen,
    openInvoiceModalWithDraft,
    openPurchaseInvoiceModalWithDraft,
    createInvoiceDirect,
    createPurchaseInvoiceDirect,
    closeAllModals,
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
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          enabled: parsed.enabled ?? true,
          autoSpeakResponses: parsed.autoSpeakResponses ?? true,
          soundEffectsEnabled: parsed.soundEffectsEnabled ?? true,
          speechRate: parsed.speechRate ?? 0.92,
          speechPitch: parsed.speechPitch ?? 1.0,
          voiceUri: parsed.voiceUri ?? '',
          language: parsed.language ?? 'en-US',
          clarityMode: parsed.clarityMode ?? 'high_clarity',
          phoneticPronunciation: parsed.phoneticPronunciation ?? true,
        };
      }
      return {
        enabled: true,
        autoSpeakResponses: true,
        soundEffectsEnabled: true,
        speechRate: 0.92,
        speechPitch: 1.0,
        voiceUri: '',
        language: 'en-US',
        clarityMode: 'high_clarity',
        phoneticPronunciation: true,
      };
    } catch {
      return {
        enabled: true,
        autoSpeakResponses: true,
        soundEffectsEnabled: true,
        speechRate: 0.92,
        speechPitch: 1.0,
        voiceUri: '',
        language: 'en-US',
        clarityMode: 'high_clarity',
        phoneticPronunciation: true,
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

  // Text-To-Speech function with phonetic pronunciation enhancement & clarity tuning
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !settings.autoSpeakResponses) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      // Format text phonetically for clear, natural human pronunciation
      const spokenText = settings.phoneticPronunciation !== false
        ? formatTextForSpeech(text, { currencyCode: selectedCurrency, clarityMode: settings.clarityMode })
        : text;

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = settings.speechRate || 0.92;
      utterance.pitch = settings.speechPitch || 1.0;

      // Select highest clarity voice matching target dialect / language
      const chosenVoice = selectBestVoice(availableVoices, settings.language || 'en-US', settings.voiceUri);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      } else {
        utterance.lang = settings.language || 'en-US';
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

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        setStatus('idle');
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
      announce(text);
    },
    [settings, availableVoices, selectedCurrency, announce]
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
        // 0. Close Everything / Dismiss Modals
        if (
          lower.includes('close modal') ||
          lower.includes('close dialog') ||
          lower.includes('close window') ||
          lower.includes('dismiss modal') ||
          lower.includes('close everything') ||
          lower.includes('close all') ||
          lower === 'close'
        ) {
          closeAllModals();
          responseText = 'Closed all active dialogs and returned to the main screen.';
          actionTaken = 'Modals -> Close All';
        }

        // 1. Parameter-Rich Invoice Creation / Opening
        // E.g.: "create invoice in abc name with ttt item 1 pc at rate 5"
        if (
          !responseText &&
          (lower.includes('invoice') || lower.includes('sale') || lower.includes('bill client') || lower.includes('make invoice'))
        ) {
          const parsedInv = parseInvoiceVoiceCommand(text);
          if (parsedInv.hasDetailedParams) {
            const isJustOpenDraft =
              lower.startsWith('open') ||
              lower.startsWith('draft') ||
              lower.includes('open draft') ||
              lower.includes('open invoice modal with');

            if (isJustOpenDraft) {
              openInvoiceModalWithDraft({
                clientName: parsedInv.clientName,
                lineItems: [
                  {
                    id: `li-draft-${Date.now()}`,
                    description: `${parsedInv.itemDescription}${parsedInv.unit ? ` (${parsedInv.unit})` : ''}`,
                    quantity: parsedInv.quantity,
                    unitPrice: parsedInv.rate,
                    taxRate: businessProfile.defaultTaxRate ?? 8.5,
                    discountPercent: 0,
                    amount: parsedInv.quantity * parsedInv.rate,
                  },
                ],
                notes: `Draft generated via Voice Command: "${text}".`,
              });
              responseText = `Opened invoice creator for ${parsedInv.clientName} prefilled with ${parsedInv.quantity} ${parsedInv.unit} of ${parsedInv.itemDescription} at rate ${formatCurrency(parsedInv.rate, selectedCurrency)}.`;
              actionTaken = `Open Draft Invoice -> ${parsedInv.clientName}`;
            } else {
              // Direct creation as explicitly requested by user!
              const newInvoice = createInvoiceDirect({
                clientName: parsedInv.clientName,
                items: [
                  {
                    description: `${parsedInv.itemDescription}${parsedInv.unit ? ` (${parsedInv.unit})` : ''}`,
                    quantity: parsedInv.quantity,
                    unitPrice: parsedInv.rate,
                  },
                ],
                notes: `Created via Voice Command: "${text}". Payment due in 30 days.`,
                autoOpen: true,
              });
              responseText = `Created and opened invoice ${newInvoice.invoiceNumber} for ${parsedInv.clientName} with ${parsedInv.quantity} ${parsedInv.unit} of ${parsedInv.itemDescription} at rate ${formatCurrency(parsedInv.rate, selectedCurrency)}. Total invoice amount is ${formatCurrency(newInvoice.totalAmount, selectedCurrency)}.`;
              actionTaken = `Created Invoice ${newInvoice.invoiceNumber} -> ${parsedInv.clientName}`;
            }
          }
        }

        // 2. Parameter-Rich Purchase Bill Creation / Opening
        if (
          !responseText &&
          (lower.includes('create bill') || lower.includes('make bill') || lower.includes('create purchase') || lower.includes('record bill') || lower.includes('log bill') || lower.includes('purchase invoice'))
        ) {
          const parsedBill = parsePurchaseVoiceCommand(text);
          if (parsedBill.hasDetailedParams) {
            const isJustOpenDraft =
              lower.startsWith('open') ||
              lower.startsWith('draft') ||
              lower.includes('open draft') ||
              lower.includes('open bill modal with');

            if (isJustOpenDraft) {
              openPurchaseInvoiceModalWithDraft({
                vendorName: parsedBill.vendorName,
                lineItems: [
                  {
                    id: `pi-draft-${Date.now()}`,
                    description: `${parsedBill.itemDescription}${parsedBill.unit ? ` (${parsedBill.unit})` : ''}`,
                    quantity: parsedBill.quantity,
                    unitPrice: parsedBill.rate,
                    taxRate: businessProfile.defaultTaxRate ?? 8.5,
                    discountPercent: 0,
                    amount: parsedBill.quantity * parsedBill.rate,
                  },
                ],
                category: parsedBill.category,
                notes: `Draft generated via Voice Command: "${text}".`,
              });
              responseText = `Opened purchase bill creator for ${parsedBill.vendorName} prefilled with ${parsedBill.quantity} ${parsedBill.unit} of ${parsedBill.itemDescription} at rate ${formatCurrency(parsedBill.rate, selectedCurrency)}.`;
              actionTaken = `Open Draft Bill -> ${parsedBill.vendorName}`;
            } else {
              const newBill = createPurchaseInvoiceDirect({
                vendorName: parsedBill.vendorName,
                items: [
                  {
                    description: `${parsedBill.itemDescription}${parsedBill.unit ? ` (${parsedBill.unit})` : ''}`,
                    quantity: parsedBill.quantity,
                    unitPrice: parsedBill.rate,
                  },
                ],
                category: parsedBill.category,
                notes: `Recorded via Voice Command: "${text}".`,
                autoOpen: true,
              });
              responseText = `Created and recorded bill ${newBill.billNumber} for ${parsedBill.vendorName} with ${parsedBill.quantity} ${parsedBill.unit} of ${parsedBill.itemDescription} at rate ${formatCurrency(parsedBill.rate, selectedCurrency)}. Total bill is ${formatCurrency(newBill.totalAmount, selectedCurrency)}.`;
              actionTaken = `Created Bill ${newBill.billNumber} -> ${parsedBill.vendorName}`;
            }
          }
        }

        // 3. Universal "Open Everything" Intent Dispatcher (Tabs, Modals, Tools)
        if (!responseText) {
          const openTarget = parseVoiceOpenIntent(text);
          if (openTarget) {
            if (openTarget.type === 'close_all') {
              closeAllModals();
              responseText = 'Closed all dialogs and modals.';
              actionTaken = 'Modals -> Close All';
            } else if (openTarget.type === 'modal') {
              switch (openTarget.modal) {
                case 'invoice':
                  setSelectedInvoiceForEdit(null);
                  setIsInvoiceModalOpen(true);
                  responseText = 'Opening Sales Invoice Creator modal.';
                  actionTaken = 'Open -> Invoice Modal';
                  break;
                case 'purchase_invoice':
                  setSelectedPurchaseInvoiceForEdit(null);
                  setIsPurchaseInvoiceModalOpen(true);
                  responseText = 'Opening Purchase Bill Creator modal.';
                  actionTaken = 'Open -> Purchase Bill Modal';
                  break;
                case 'expense':
                  setIsExpenseModalOpen(true);
                  responseText = 'Opening Expense Logger modal.';
                  actionTaken = 'Open -> Expense Modal';
                  break;
                case 'client':
                  setIsClientModalOpen(true);
                  responseText = 'Opening New Client registration modal.';
                  actionTaken = 'Open -> Client Modal';
                  break;
                case 'vendor':
                  setIsVendorModalOpen(true);
                  responseText = 'Opening New Vendor registration modal.';
                  actionTaken = 'Open -> Vendor Modal';
                  break;
                case 'inventory':
                  setIsInventoryModalOpen(true);
                  responseText = 'Opening Inventory Item Creator modal.';
                  actionTaken = 'Open -> Inventory Modal';
                  break;
                case 'stock_adjustment':
                  setIsStockAdjustmentModalOpen(true);
                  responseText = 'Opening Stock Adjustment modal.';
                  actionTaken = 'Open -> Stock Adjustment Modal';
                  break;
                case 'voucher':
                  setIsPaymentVoucherModalOpen(true);
                  responseText = 'Opening Payment and Receipt Voucher modal.';
                  actionTaken = 'Open -> Voucher Modal';
                  break;
                case 'receipt_scanner':
                  setIsReceiptScannerOpen(true);
                  responseText = 'Launching AI Receipt & OCR Scanner.';
                  actionTaken = 'Open -> Receipt Scanner';
                  break;
                case 'copilot':
                  setIsAICopilotOpen(true);
                  responseText = 'Opening AI Financial Copilot.';
                  actionTaken = 'Open -> AI Copilot';
                  break;
                case 'voice_commander':
                  setIsVoiceWidgetOpen(true);
                  responseText = 'Opening Voice Assistant control center.';
                  actionTaken = 'Open -> Voice Commander';
                  break;
              }
            } else if (openTarget.type === 'tab') {
              setActiveTab(openTarget.tab);
              const tabName = openTarget.tab.replace(/_/g, ' ');
              responseText = `Opening ${tabName.charAt(0).toUpperCase() + tabName.slice(1)}.`;
              actionTaken = `Navigate -> ${openTarget.tab}`;
            }
          }
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
      recognition.lang = settings.language || 'en-US';

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
  }, [isSupported, processVoiceCommand, settings.language]);

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
        supportedLanguages: SUPPORTED_VOICE_LANGUAGES,
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
