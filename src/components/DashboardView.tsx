import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Plus,
  ChevronRight,
  PieChart,
  ShieldCheck,
  Boxes,
  ShoppingBag,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart as RechartsPie,
  Pie,
} from 'recharts';
import { formatCurrency, formatCompactCurrency } from '../utils/accountingMath';
import { useVoice } from '../context/VoiceContext';
import { Mic, Volume2 } from 'lucide-react';

export const DashboardView: React.FC<{
  onOpenAICopilot: () => void;
  onOpenReceiptScanner: () => void;
}> = ({ onOpenAICopilot, onOpenReceiptScanner }) => {
  const { isSpeaking, isListening, toggleListening, processVoiceCommand, setIsVoiceWidgetOpen } = useVoice();
  const {
    businessProfile,
    profitAndLoss,
    balanceSheet,
    cashFlow,
    arAging,
    invoices,
    expenses,
    inventoryItems,
    vendors,
    customerInsights,
    paymentVouchers,
    inventoryReport,
    selectedCurrency,
    setActiveTab,
    setIsInvoiceModalOpen,
    setSelectedInvoiceForEdit,
    setSelectedInvoiceForView,
    setIsExpenseModalOpen,
    setIsPaymentVoucherModalOpen,
    setIsInventoryModalOpen,
    setIsVendorModalOpen,
    runAutomatedRecurringEngine,
    automationLogs,
  } = useAccounting();

  const totalRevenue = profitAndLoss.totalRevenue;
  const totalExpenses = profitAndLoss.totalExpenses;
  const netIncome = profitAndLoss.netIncome;
  const netMargin = profitAndLoss.netProfitMarginPercentage;
  const cashBalance = balanceSheet.assets.currentAssets.cashAndEquivalents;
  const accountsReceivable = balanceSheet.assets.currentAssets.accountsReceivable;
  const runwayMonths = cashFlow.runwayMonths;

  // Monthly Revenue & Expense bar chart data
  const monthlyFinancialData = [
    { month: 'Apr', revenue: 38500, expenses: 14200, profit: 24300 },
    { month: 'May', revenue: 44000, expenses: 16800, profit: 27200 },
    { month: 'Jun', revenue: 52000, expenses: 19400, profit: 32600 },
    { month: 'Jul', revenue: 47200, expenses: 17900, profit: 29300 },
    { month: 'Aug', revenue: totalRevenue > 0 ? totalRevenue : 49500, expenses: totalExpenses > 0 ? totalExpenses : 18200, profit: netIncome > 0 ? netIncome : 31300 },
  ];

  // Expense Donut Data
  const categoryColors: Record<string, string> = {
    'Software & SaaS': '#10b981',
    'Rent & Facilities': '#3b82f6',
    'Office Supplies & Equipment': '#f59e0b',
    'Travel & Meals': '#ec4899',
    'Contractor & Payroll': '#8b5cf6',
    'Advertising & Marketing': '#06b6d4',
    'Banking & Payment Fees': '#64748b',
    'Legal & Professional': '#eab308',
    'Other Expenses': '#94a3b8',
  };

  const expenseBreakdownData = profitAndLoss.operatingExpenses.slice(0, 5).map((e) => ({
    name: e.category,
    value: e.amount,
    color: categoryColors[e.category] || '#10b981',
  }));

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with AI Copilot Hook */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Accrual Accounting Real-Time Engine
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">Synced</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
              Financial Executive Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Automated invoicing pipelines are active. Real-time gross margin is{' '}
              <strong className="text-emerald-700 font-semibold">{profitAndLoss.grossMarginPercentage.toFixed(1)}%</strong> with{' '}
              <strong className="text-slate-900 font-semibold">{runwayMonths.toFixed(1)} months</strong> of runway.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setSelectedInvoiceForEdit(null);
                setIsInvoiceModalOpen(true);
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Invoice</span>
            </button>

            <button
              onClick={onOpenReceiptScanner}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4 text-teal-600" />
              <span>Scan Receipt</span>
            </button>

            <button
              id="dashboard-voice-readout-btn"
              onClick={() => processVoiceCommand('Voice over overview')}
              className={`px-3.5 py-2 border font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
                isSpeaking
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
              title="VoiceOver read executive business summary aloud"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Voice Readout</span>
            </button>

            <button
              id="dashboard-voice-command-btn"
              onClick={() => setIsVoiceWidgetOpen(true)}
              className={`px-3.5 py-2 border font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
                isListening
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Open Voice Commander"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
              <span>Voice Command</span>
            </button>

            <button
              onClick={onOpenAICopilot}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time KPI Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Revenue</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
              <ArrowUpRight className="w-3 h-3" /> +14.2%
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {formatCurrency(totalRevenue, selectedCurrency)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Gross Profit:</span>
            <span className="text-slate-800 font-mono font-semibold">
              {formatCurrency(profitAndLoss.grossProfit, selectedCurrency)}
            </span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Expenses</span>
            <span className="inline-flex items-center gap-0.5 text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full text-[10px] border border-slate-200">
              {expenses.length} Records
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {formatCurrency(totalExpenses, selectedCurrency)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tax Deductible:</span>
            <span className="text-emerald-700 font-mono font-semibold">
              {formatCurrency(
                expenses.filter((e) => e.taxDeductible).reduce((s, e) => s + e.amount, 0),
                selectedCurrency
              )}
            </span>
          </div>
        </div>

        {/* Net Income & Margin */}
        <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Net Profit Margin</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
              {netMargin.toFixed(1)}% Margin
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tracking-tight">
            {formatCurrency(netIncome, selectedCurrency)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Estimated Tax Prov:</span>
            <span className="text-slate-800 font-mono font-semibold">
              {formatCurrency(profitAndLoss.estimatedTaxProvision, selectedCurrency)}
            </span>
          </div>
        </div>

        {/* Accounts Receivable & Cash */}
        <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Accounts Receivable</span>
            <span
              className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                invoices.some((i) => i.status === 'overdue')
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length} Unpaid
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {formatCurrency(accountsReceivable, selectedCurrency)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Operating Cash:</span>
            <span className="text-slate-800 font-mono font-semibold">
              {formatCurrency(cashBalance, selectedCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* Operations & Module Quick Access Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Inventory Stock Widget (Optional based on business profile) */}
        {businessProfile.enableInventory !== false ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <Boxes className="w-4 h-4 text-purple-600" />
                <span>Inventory & Stock</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {formatCurrency(inventoryReport.totalInventoryValue, selectedCurrency)}
              </div>
              <p className="text-[11px] text-slate-500">
                {inventoryReport.totalUnitsOnHand} units across {inventoryItems.length} SKUs
                {inventoryReport.lowStockItemsCount > 0 && (
                  <span className="text-amber-600 font-semibold ml-1">
                    ({inventoryReport.lowStockItemsCount} low stock)
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('inventory')}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold rounded-xl transition-all"
              >
                Manage Stock
              </button>
              <button
                onClick={() => setIsInventoryModalOpen(true)}
                className="px-3 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all font-medium"
              >
                + Add Item
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Predictive Insights</span>
              </div>
              <div className="text-base font-bold text-slate-900">
                {customerInsights.length > 0 ? `${customerInsights.length} Customer Models` : 'Predictive Engine'}
              </div>
              <p className="text-[11px] text-slate-500">
                Purchasing pattern forecasts & retention analytics
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ai_insights')}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold rounded-xl transition-all"
            >
              View AI Engine
            </button>
          </div>
        )}

        {/* Payment Vouchers & Receipts Widget */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Payments & Receipts</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {paymentVouchers.length} Vouchers
            </div>
            <p className="text-[11px] text-slate-500">
              {paymentVouchers.filter((v) => v.voucherType === 'receipt').length} Receipts •{' '}
              {paymentVouchers.filter((v) => v.voucherType === 'payment').length} Payments
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('vouchers')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-all"
            >
              View Journal
            </button>
            <button
              onClick={() => setIsPaymentVoucherModalOpen(true)}
              className="px-3 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all font-medium"
            >
              + Record Voucher
            </button>
          </div>
        </div>

        {/* Comprehensive Reports Shortcut Widget */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Financial Reports</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              Daybook, P&L, Assets/Liabilities
            </div>
            <p className="text-[11px] text-slate-500">
              Master All-in-One and GAAP statement exports
            </p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            Open Reports
          </button>
        </div>
      </div>

      {/* Main Bento Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Expense Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue & Expense Trajectory</h3>
              <p className="text-xs text-slate-500">Monthly billing vs. operating expenditure</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-rose-500" /> Expenses
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-teal-400" /> Net Profit
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinancialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => formatCompactCurrency(val, selectedCurrency)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#0f172a',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value), selectedCurrency), '']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="profit" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Donut (1 Col) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Expense Distribution</h3>
              <button
                onClick={() => setActiveTab('expenses')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                View All
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Top operating expense allocations</p>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={expenseBreakdownData}
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      color: '#0f172a',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val), selectedCurrency), '']}
                  />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {formatCompactCurrency(totalExpenses, selectedCurrency)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 pt-3 border-t border-slate-100">
            {expenseBreakdownData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate text-[11px] font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-800 shrink-0 text-[11px]">
                  {formatCurrency(item.value, selectedCurrency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AR Aging Quick Bar & Active Automated Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AR Aging Status */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Accounts Receivable Aging
            </h3>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Full Ledger
            </button>
          </div>

          <div className="space-y-3">
            {arAging.map((bucket, idx) => (
              <div key={bucket.period} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">{bucket.period}</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatCurrency(bucket.amount, selectedCurrency)} ({bucket.count})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-emerald-500'
                        : idx === 1
                        ? 'bg-teal-500'
                        : idx === 2
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{
                      width: `${accountsReceivable > 0 ? (bucket.amount / accountsReceivable) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automated Recurring Schedules Engine Summary */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                Automated Invoicing Engine
              </h3>
              <p className="text-xs text-slate-500">Scheduled automated recurring retainers and triggers</p>
            </div>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <span>Manage Schedules</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {invoices
              .filter((i) => i.recurring?.isRecurring)
              .slice(0, 4)
              .map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {inv.clientCompany || inv.clientName}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {inv.recurring?.frequency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Retainer Amount:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(inv.totalAmount, inv.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>Next Auto-Dispatch:</span>
                    <span className="font-mono text-emerald-700 font-semibold">{inv.recurring?.nextRunDate}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Invoices & Payment Status</h3>
            <p className="text-xs text-slate-500">Real-time invoice records & settlement tracking</p>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <span>All Invoices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-semibold">Invoice #</th>
                <th className="pb-3 font-semibold">Client / Company</th>
                <th className="pb-3 font-semibold">Issue Date</th>
                <th className="pb-3 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.map((inv) => {
                const statusStyles: Record<string, string> = {
                  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  sent: 'bg-blue-50 text-blue-700 border-blue-200',
                  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
                  draft: 'bg-slate-100 text-slate-700 border-slate-200',
                  cancelled: 'bg-slate-100 text-slate-500 border-slate-200 line-through',
                };

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 font-medium text-slate-800">
                      <div>{inv.clientCompany || inv.clientName}</div>
                      <div className="text-[11px] text-slate-500">{inv.clientEmail}</div>
                    </td>
                    <td className="py-3 text-slate-600 font-mono">{inv.issueDate}</td>
                    <td className="py-3 text-slate-600 font-mono">{inv.dueDate}</td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(inv.totalAmount, inv.currency)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                          statusStyles[inv.status] || statusStyles.draft
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedInvoiceForView(inv)}
                        className="px-3 py-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors font-semibold"
                      >
                        View & Print
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
