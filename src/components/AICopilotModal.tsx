import React, { useState, useEffect, useRef } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { AIChatIntentAction } from '../types';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  ArrowRight,
  BookOpen,
  FileText,
  Receipt,
  PieChart,
  Landmark,
  CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  action?: AIChatIntentAction;
  suggestedButtons?: {
    label: string;
    actionType: string;
    payload?: any;
  }[];
  timestamp: string;
}

export const AICopilotModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    profitAndLoss,
    balanceSheet,
    cashFlow,
    invoices,
    expenses,
    ledgerAccounts,
    selectedCurrency,
    askAICopilot,
    executeAIAction,
  } = useAccounting();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with CPA executive overview
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const overdueTotal = invoices
        .filter((i) => i.status === 'overdue')
        .reduce((sum, i) => sum + i.balanceDue, 0);

      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        sender: 'ai',
        text: `Hello! I am your AI Financial Copilot and Virtual CPA. 

I can directly control your accounting system:
• **Create new Ledger Accounts** (e.g., *"Create an asset ledger for Crypto Treasury"*)
• **Open & Create Sales / Invoices** (e.g., *"Create sale to Tesla for $12,500 for Consulting"*)
• **Open & Log Purchases / Expenses** (e.g., *"Record purchase of $350 from Staples for Office Supplies"*)
• **Open Financial Reports & Audit Books** (e.g., *"Show Profit & Loss", "Analyze runway"*)

**Current Financial Position:**
• **Net Income**: ${formatCurrency(profitAndLoss.netIncome, selectedCurrency)} (${profitAndLoss.netProfitMarginPercentage.toFixed(1)}% margin)
• **Cash Runway**: ${cashFlow.runwayMonths.toFixed(1)} months
• **Unpaid AR**: ${formatCurrency(balanceSheet.assets.currentAssets.accountsReceivable, selectedCurrency)} (${formatCurrency(overdueTotal, selectedCurrency)} overdue)
• **Chart of Accounts**: ${ledgerAccounts.length} active ledger accounts

What would you like to do?`,
        suggestedButtons: [
          { label: '➕ Create New Ledger', actionType: 'create_ledger_prompt' },
          { label: '📄 Open Sale / Invoice', actionType: 'open_sale_modal' },
          { label: '💳 Log Purchase / Expense', actionType: 'open_purchase_modal' },
          { label: '📊 View P&L Report', actionType: 'navigate_tab', payload: { tab: 'reports' } },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, invoices, expenses, ledgerAccounts]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await askAICopilot(promptToSend);

      // Auto-execute the action if requested (e.g., creating ledger, navigating, etc.)
      if (response.action && response.action.type !== 'none') {
        executeAIAction(response.action);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        action: response.action,
        suggestedButtons: response.suggestedButtons,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI Copilot error:', err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'I encountered an issue analyzing the ledger. You can retry your question or choose one of the quick actions below.',
        suggestedButtons: [
          { label: 'Open Sale Modal', actionType: 'open_sale_modal' },
          { label: 'Log Purchase', actionType: 'open_purchase_modal' },
          { label: 'View Reports', actionType: 'navigate_tab', payload: { tab: 'reports' } },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionButtonClick = (btn: { label: string; actionType: string; payload?: any }) => {
    if (btn.actionType === 'create_ledger_prompt') {
      handleSend('Create a new ledger account for AI & Cloud Infrastructure under Operating Expenses');
      return;
    }

    executeAIAction({
      type: btn.actionType as any,
      payload: btn.payload,
    });

    if (
      btn.actionType === 'open_sale_modal' ||
      btn.actionType === 'open_purchase_modal' ||
      btn.actionType === 'navigate_tab'
    ) {
      onClose();
    }
  };

  const quickCommands = [
    'Create a new ledger account for Cloud Hosting',
    'Open sale invoice for Acme Corp $4,500',
    'Record purchase of $180 for Office Equipment',
    'Open Profit & Loss report',
    'Reconcile unmatched bank transactions',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-3xl h-[88vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>AI Financial Copilot & Command Center</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Gemini 3.7 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Natural Language Control: Ledgers • Sales • Purchases • Reports • Automations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white font-medium ml-12 rounded-tr-none shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none whitespace-pre-wrap shadow-xs'
                }`}
              >
                <div>{m.text}</div>

                {/* Structured Action Executed Notification Card */}
                {m.action && m.action.type !== 'none' && (
                  <div className="mt-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {m.action.type === 'create_ledger_account' && 'Ledger Account Created & Synced'}
                        {m.action.type === 'open_sale_modal' && 'Sales Invoicing Form Prepared'}
                        {m.action.type === 'create_sale' && 'Sale Invoiced into General Ledger'}
                        {m.action.type === 'open_purchase_modal' && 'Purchase & Expense Form Prepared'}
                        {m.action.type === 'create_purchase' && 'Purchase Cleared to General Ledger'}
                        {m.action.type === 'open_report' && 'Financial Reports Statement Loaded'}
                        {m.action.type === 'create_client' && 'Client Account Saved'}
                        {m.action.type === 'navigate_tab' && 'Page Navigated'}
                      </span>
                    </div>

                    {m.action.payload && (
                      <div className="text-[11px] text-slate-700 font-mono bg-white/80 p-2 rounded-lg border border-emerald-100">
                        {m.action.type === 'create_ledger_account' && (
                          <div>
                            Account: <strong>{m.action.payload.name}</strong> ({m.action.payload.code}) • Category:{' '}
                            <span className="uppercase">{m.action.payload.type}</span>
                          </div>
                        )}
                        {(m.action.type === 'create_sale' || m.action.type === 'open_sale_modal') && (
                          <div>
                            Client: <strong>{m.action.payload.clientName || 'Valued Client'}</strong> • Amount:{' '}
                            {m.action.payload.items?.[0]
                              ? `$${(
                                  m.action.payload.items[0].quantity * m.action.payload.items[0].unitPrice
                                ).toFixed(2)}`
                              : 'Open Form'}
                          </div>
                        )}
                        {(m.action.type === 'create_purchase' || m.action.type === 'open_purchase_modal') && (
                          <div>
                            Vendor: <strong>{m.action.payload.payee || 'Expense Payee'}</strong> • Amount:{' '}
                            ${m.action.payload.amount || '0.00'} ({m.action.payload.category || 'General'})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Action Buttons */}
                {m.suggestedButtons && m.suggestedButtons.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {m.suggestedButtons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionButtonClick(btn)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1"
                      >
                        <span>{btn.label}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] font-mono text-right ${
                    m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-3 text-slate-600 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Executing AI accounting instruction & analyzing ledger...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Commands Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Quick Commands:</span>
          {quickCommands.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-50 shadow-xs"
            >
              <span>{q}</span>
              <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="e.g. 'Create a new ledger account for R&D', 'Open sale to Tesla for $15,000', 'Show P&L'..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4 stroke-[2]" />
              <span>Execute</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
