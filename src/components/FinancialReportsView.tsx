import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  PieChart,
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  FileDown,
  Boxes,
  Receipt,
  ShoppingBag,
  BookOpen,
  Filter,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';
import { exportReportPDF } from '../utils/pdfExport';
import { useVoice } from '../context/VoiceContext';
import { Volume2 } from 'lucide-react';

type ReportTab =
  | 'all_in_one'
  | 'assets_liabilities'
  | 'daybook'
  | 'pnl'
  | 'sales'
  | 'purchase'
  | 'tax'
  | 'inventory'
  | 'balance_sheet'
  | 'cash_flow'
  | 'ar_aging';

export const FinancialReportsView: React.FC<{
  onOpenAICopilot: () => void;
}> = ({ onOpenAICopilot }) => {
  const {
    profitAndLoss,
    balanceSheet,
    cashFlow,
    taxReport,
    arAging,
    daybook,
    salesReport,
    purchaseReport,
    inventoryReport,
    allInOneReport,
    assetsLiabilitiesReport,
    daybookFilterDate,
    setDaybookFilterDate,
    ledgerAccounts,
    selectedCurrency,
    businessProfile,
    invoices,
    purchaseInvoices,
    inventoryItems,
    paymentVouchers,
    sendInvoiceReminder,
  } = useAccounting();

  const { speak, isSpeaking, stopSpeaking } = useVoice();
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('all_in_one');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleReadReportAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    let summaryText = '';
    if (activeReportTab === 'all_in_one') {
      summaryText = `All-in-One Master Report for ${businessProfile.companyName}: Total Revenue is ${formatCurrency(allInOneReport.sales.totalRevenue, selectedCurrency)}. Gross profit is ${formatCurrency(allInOneReport.pnl.grossProfit, selectedCurrency)} with a gross margin of ${allInOneReport.pnl.grossMarginPercentage.toFixed(1)}%. Total operating expenses are ${formatCurrency(allInOneReport.pnl.totalExpenses, selectedCurrency)}, resulting in a Net Income of ${formatCurrency(allInOneReport.pnl.netIncome, selectedCurrency)}. Cash reserves stand at ${formatCurrency(allInOneReport.balanceSheet.assets.currentAssets.cashAndEquivalents, selectedCurrency)}.`;
    } else if (activeReportTab === 'pnl') {
      summaryText = `Profit and Loss Report: Operating Revenue is ${formatCurrency(profitAndLoss.totalRevenue, selectedCurrency)}. Total Operating Expenses are ${formatCurrency(profitAndLoss.totalExpenses, selectedCurrency)}, yielding a net profit of ${formatCurrency(profitAndLoss.netIncome, selectedCurrency)} with a margin of ${profitAndLoss.netProfitMarginPercentage.toFixed(1)} percent.`;
    } else if (activeReportTab === 'assets_liabilities') {
      summaryText = `Assets and Liabilities Summary: Total Assets are ${formatCurrency(assetsLiabilitiesReport.assets.totalAssets, selectedCurrency)}. Total Liabilities are ${formatCurrency(assetsLiabilitiesReport.liabilities.totalLiabilities, selectedCurrency)}, and Business Net Worth is ${formatCurrency(assetsLiabilitiesReport.netWorth, selectedCurrency)}. Working capital is ${formatCurrency(assetsLiabilitiesReport.workingCapital, selectedCurrency)}.`;
    } else if (activeReportTab === 'tax') {
      summaryText = `Tax and VAT Audit Report: Output tax collected from sales is ${formatCurrency(taxReport.totalOutputTax, selectedCurrency)}. Input tax paid on eligible expenses is ${formatCurrency(taxReport.totalInputTax, selectedCurrency)}. Net tax liability payable is ${formatCurrency(taxReport.netTaxLiability, selectedCurrency)}.`;
    } else if (activeReportTab === 'inventory') {
      summaryText = `Inventory Valuation Report: Total stock valuation is ${formatCurrency(inventoryReport.totalInventoryValue, selectedCurrency)} across ${inventoryReport.totalUnitsOnHand} units on hand. There are ${inventoryReport.lowStockItemCount} items needing reorder.`;
    } else if (activeReportTab === 'cash_flow') {
      summaryText = `Cash Flow Statement: Net operating cash flow is ${formatCurrency(cashFlow.operatingActivities.netOperatingCash, selectedCurrency)}. Cash runway is estimated at ${cashFlow.runwayMonths.toFixed(1)} months.`;
    } else {
      summaryText = `Financial Report summary: Revenue is ${formatCurrency(profitAndLoss.totalRevenue, selectedCurrency)}, Net Income is ${formatCurrency(profitAndLoss.netIncome, selectedCurrency)}, and Cash Reserves are ${formatCurrency(balanceSheet.assets.currentAssets.cashAndEquivalents, selectedCurrency)}.`;
    }

    speak(summaryText);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      exportReportPDF(
        activeReportTab as any,
        {
          pnl: profitAndLoss,
          balanceSheet,
          cashFlow,
          taxReport,
          arAging,
          ledgerAccounts,
          daybook,
          salesReport,
          purchaseReport,
          inventoryReport,
          allInOneReport,
        } as any,
        businessProfile,
        selectedCurrency
      );
    } finally {
      setTimeout(() => setIsExportingPDF(false), 600);
    }
  };

  const handleExportReportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const filename = `${activeReportTab}_report_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReportTab === 'all_in_one') {
      headers = ['Category / Metric', 'Value'];
      rows = [
        ['Company Name', businessProfile.companyName],
        ['Fiscal Period', 'FY 2026'],
        ['Total Sales Revenue', allInOneReport.sales.totalRevenue.toFixed(2)],
        ['Cost of Goods Sold', allInOneReport.pnl.costOfGoodsSold.toFixed(2)],
        ['Gross Profit', allInOneReport.pnl.grossProfit.toFixed(2)],
        ['Gross Margin %', `${allInOneReport.pnl.grossMarginPercentage.toFixed(2)}%`],
        ['Total Operating Expenses', allInOneReport.pnl.totalExpenses.toFixed(2)],
        ['Operating Net Income', allInOneReport.pnl.netIncome.toFixed(2)],
        ['Total Purchases & OPEX', allInOneReport.purchases.totalPurchases.toFixed(2)],
        ['Total Inventory Asset Valuation', allInOneReport.inventory.totalInventoryValue.toFixed(2)],
        ['Total Units on Hand', allInOneReport.inventory.totalUnitsOnHand.toString()],
        ['Output Tax (Sales Tax Collected)', allInOneReport.tax.totalOutputTax.toFixed(2)],
        ['Input Tax (Tax Paid on Purchases)', allInOneReport.tax.totalInputTax.toFixed(2)],
        ['Net Tax Liability', allInOneReport.tax.netTaxLiability.toFixed(2)],
        ['Cash and Bank Equivalents', allInOneReport.balanceSheet.assets.currentAssets.cashAndEquivalents.toFixed(2)],
        ['Accounts Receivable (A/R)', allInOneReport.balanceSheet.assets.currentAssets.accountsReceivable.toFixed(2)],
        ['Accounts Payable (A/P)', allInOneReport.balanceSheet.liabilities.currentLiabilities.accountsPayable.toFixed(2)],
      ];
    } else if (activeReportTab === 'daybook') {
      headers = ['Time / ID', 'Type', 'Account / Entity', 'Description', 'Debit Amount', 'Credit Amount', 'Status'];
      rows = daybook.entries.map((e) => [
        e.id,
        e.type.toUpperCase(),
        `"${e.accountOrEntity.replace(/"/g, '""')}"`,
        `"${e.description.replace(/"/g, '""')}"`,
        e.debit > 0 ? e.debit.toFixed(2) : '',
        e.credit > 0 ? e.credit.toFixed(2) : '',
        e.status,
      ]);
    } else if (activeReportTab === 'sales') {
      headers = ['Client / Account', 'Invoice Count', 'Total Invoiced', 'Amount Paid', 'Balance Due'];
      rows = salesReport.byClient.map((c) => [
        `"${c.clientName.replace(/"/g, '""')}"`,
        c.invoiceCount.toString(),
        c.totalInvoiced.toFixed(2),
        c.amountPaid.toFixed(2),
        c.balanceDue.toFixed(2),
      ]);
    } else if (activeReportTab === 'purchase') {
      headers = ['Vendor / Expense Category', 'Count', 'Total Amount', 'Paid Amount', 'Balance Due'];
      rows = purchaseReport.byVendor.map((v) => [
        `"${v.vendorName.replace(/"/g, '""')}"`,
        v.billCount.toString(),
        v.totalBilled.toFixed(2),
        v.amountPaid.toFixed(2),
        v.balanceDue.toFixed(2),
      ]);
    } else if (activeReportTab === 'inventory') {
      headers = ['SKU', 'Item Name', 'Category', 'Quantity on Hand', 'Unit Cost', 'Selling Price', 'Valuation Cost', 'Status'];
      rows = inventoryItems.map((i) => [
        i.sku,
        `"${i.name.replace(/"/g, '""')}"`,
        i.category,
        i.quantityOnHand.toString(),
        i.unitCost.toFixed(2),
        i.sellingPrice.toFixed(2),
        (i.quantityOnHand * i.unitCost).toFixed(2),
        i.quantityOnHand <= 0 ? 'Out of Stock' : i.quantityOnHand <= i.reorderLevel ? 'Low Stock' : 'Healthy',
      ]);
    } else if (activeReportTab === 'tax') {
      headers = ['Tax Component', 'Amount'];
      rows = [
        ['Total Output Tax (Collected on Sales)', taxReport.totalOutputTax.toFixed(2)],
        ['Total Input Tax (Paid on Purchases & Expenses)', taxReport.totalInputTax.toFixed(2)],
        ['Net Tax Liability / (Refundable)', taxReport.netTaxLiability.toFixed(2)],
        ['Total Schedule C Deductible Expenses', taxReport.totalDeductibleExpenses.toFixed(2)],
        ['Estimated Taxable Income', taxReport.estimatedTaxableIncome.toFixed(2)],
      ];
    } else if (activeReportTab === 'pnl') {
      headers = ['Category / Line Item', 'Amount'];
      rows = [
        ['Total Revenue', profitAndLoss.totalRevenue.toFixed(2)],
        ['Cost of Goods Sold (COGS)', profitAndLoss.costOfGoodsSold.toFixed(2)],
        ['Gross Profit', profitAndLoss.grossProfit.toFixed(2)],
        ['Gross Margin %', `${profitAndLoss.grossMarginPercentage.toFixed(2)}%`],
        ...profitAndLoss.operatingExpenses.map((e) => [`Operating Expense: ${e.category}`, e.amount.toFixed(2)]),
        ['Total Operating Expenses', profitAndLoss.totalExpenses.toFixed(2)],
        ['Operating Income (EBITDA)', profitAndLoss.operatingIncome.toFixed(2)],
        ['Estimated Tax Provision', profitAndLoss.estimatedTaxProvision.toFixed(2)],
        ['Net Income', profitAndLoss.netIncome.toFixed(2)],
        ['Net Margin %', `${profitAndLoss.netProfitMarginPercentage.toFixed(2)}%`],
      ];
    } else if (activeReportTab === 'balance_sheet') {
      headers = ['Balance Sheet Item', 'Amount'];
      rows = [
        ['Cash and Cash Equivalents', balanceSheet.assets.currentAssets.cashAndEquivalents.toFixed(2)],
        ['Accounts Receivable', balanceSheet.assets.currentAssets.accountsReceivable.toFixed(2)],
        ['Inventory Assets', balanceSheet.assets.currentAssets.inventoryAssets.toFixed(2)],
        ['Total Current Assets', balanceSheet.assets.currentAssets.totalCurrentAssets.toFixed(2)],
        ['Total Assets', balanceSheet.assets.totalAssets.toFixed(2)],
        ['Accounts Payable', balanceSheet.liabilities.currentLiabilities.accountsPayable.toFixed(2)],
        ['Accrued Expenses', balanceSheet.liabilities.currentLiabilities.accruedExpenses.toFixed(2)],
        ['Total Liabilities', balanceSheet.liabilities.totalLiabilities.toFixed(2)],
        ['Retained Earnings', balanceSheet.equity.retainedEarnings.toFixed(2)],
        ['Total Equity', balanceSheet.equity.totalEquity.toFixed(2)],
      ];
    } else if (activeReportTab === 'assets_liabilities') {
      headers = ['Category', 'Line Item', 'Amount'];
      rows = [
        ['Current Assets', 'Cash and Cash Equivalents', assetsLiabilitiesReport.assets.cashAndEquivalents.toFixed(2)],
        ['Current Assets', 'Accounts Receivable (Trade Debtors)', assetsLiabilitiesReport.assets.accountsReceivable.toFixed(2)],
        ['Current Assets', 'Merchandise Inventory Stock', assetsLiabilitiesReport.assets.inventoryValue.toFixed(2)],
        ['Current Assets', 'Other Current Assets', assetsLiabilitiesReport.assets.otherCurrentAssets.toFixed(2)],
        ['Non-Current Assets', 'Fixed Tangible Assets & Equipment', assetsLiabilitiesReport.assets.fixedAssets.toFixed(2)],
        ['SUMMARY', 'TOTAL ASSETS', assetsLiabilitiesReport.assets.totalAssets.toFixed(2)],
        ['Current Liabilities', 'Accounts Payable (Trade Creditors)', assetsLiabilitiesReport.liabilities.accountsPayable.toFixed(2)],
        ['Current Liabilities', 'Sales Tax & VAT Liability', assetsLiabilitiesReport.liabilities.salesTaxPayable.toFixed(2)],
        ['Current Liabilities', 'Accrued Expenses & Wages', assetsLiabilitiesReport.liabilities.accruedExpenses.toFixed(2)],
        ['Current Liabilities', 'Short-Term Commercial Loans', assetsLiabilitiesReport.liabilities.shortTermLoans.toFixed(2)],
        ['Non-Current Liabilities', 'Long-Term Liabilities', assetsLiabilitiesReport.liabilities.longTermLiabilities.toFixed(2)],
        ['SUMMARY', 'TOTAL LIABILITIES', assetsLiabilitiesReport.liabilities.totalLiabilities.toFixed(2)],
        ['EQUITY & NET WORTH', 'TOTAL NET WORTH (Assets - Liabilities)', assetsLiabilitiesReport.netWorth.toFixed(2)],
        ['LIQUIDITY', 'Working Capital', assetsLiabilitiesReport.workingCapital.toFixed(2)],
        ['LIQUIDITY', 'Current Ratio', assetsLiabilitiesReport.currentRatio.toFixed(2)],
      ];
    } else {
      headers = ['Period / Metric', 'Value'];
      rows = arAging.map((b) => [b.period, b.amount.toFixed(2)]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reportTabs: { id: ReportTab; label: string; icon: any; badge?: string }[] = [
    { id: 'all_in_one', label: 'All-in-One Report', icon: Sparkles, badge: 'Master' },
    { id: 'assets_liabilities', label: 'Assets & Liabilities Summary', icon: Layers, badge: 'Real-Time' },
    { id: 'daybook', label: 'Daybook Journal', icon: BookOpen, badge: `${daybook.entries.length}` },
    { id: 'pnl', label: 'Profit & Loss', icon: TrendingUp },
    { id: 'sales', label: 'Sales Report', icon: FileSpreadsheet },
    { id: 'purchase', label: 'Purchase Report', icon: ShoppingBag },
    { id: 'tax', label: 'Tax & VAT Audit', icon: ShieldCheck },
    { id: 'inventory', label: 'Inventory Valuation', icon: Boxes },
    { id: 'balance_sheet', label: 'Balance Sheet', icon: Layers },
    { id: 'cash_flow', label: 'Cash Flow', icon: DollarSign },
    { id: 'ar_aging', label: 'A/R Aging', icon: Clock },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-6 h-6 text-emerald-600" />
            Financial & Operational Audit Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-dimensional reports: Daybook, Sales, Purchase, Tax, P&L, Inventory, and Master All-in-One.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="reports-voice-readout-btn"
            onClick={handleReadReportAloud}
            className={`px-3 py-2 border text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs ${
              isSpeaking
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
            title="Read active report aloud via VoiceOver"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
          </button>

          <button
            onClick={onOpenAICopilot}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Financial Analyst</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            title="Export Report as PDF"
          >
            <FileDown className={`w-3.5 h-3.5 ${isExportingPDF ? 'animate-spin' : ''}`} />
            <span>{isExportingPDF ? 'Generating...' : 'Export PDF'}</span>
          </button>

          <button
            onClick={handleExportReportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="no-print flex items-center gap-1.5 bg-white border border-slate-200/80 p-1.5 rounded-2xl overflow-x-auto scrollbar-none shadow-xs">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Report Document Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Printable Report Header */}
        <div className="pb-4 border-b border-slate-200 print:border-slate-300 flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 print:text-black">{businessProfile.companyName}</h3>
            <p className="text-xs text-slate-500 print:text-slate-600">
              {activeReportTab === 'all_in_one' && 'All-in-One Comprehensive Master Financial & Operations Report'}
              {activeReportTab === 'daybook' && `Daybook Journal & Daily Cash Ledger (Date: ${daybookFilterDate})`}
              {activeReportTab === 'pnl' && 'Statement of Profit and Loss (Income Statement)'}
              {activeReportTab === 'sales' && 'Sales, Invoicing & Customer Revenue Audit Report'}
              {activeReportTab === 'purchase' && 'Procurement, Vendor Bills & Expense Audit Report'}
              {activeReportTab === 'tax' && 'Tax Liability, Input/Output VAT & Deductions Schedule'}
              {activeReportTab === 'inventory' && 'Inventory Valuation, Reorder Status & Asset Tracking Report'}
              {activeReportTab === 'balance_sheet' && 'Balance Sheet (Statement of Financial Position)'}
              {activeReportTab === 'cash_flow' && 'Statement of Cash Flows & Cash Runway Analysis'}
              {activeReportTab === 'ar_aging' && 'Accounts Receivable Aging & Delinquency Schedule'}
            </p>
          </div>
          <div className="sm:text-right text-xs text-slate-500 font-mono print:text-slate-600">
            <p>Fiscal Period: FY 2026</p>
            <p>Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 0. ALL-IN-ONE MASTER REPORT */}
        {activeReportTab === 'all_in_one' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            {/* KPI Summary Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Total Sales Revenue
                </span>
                <span className="text-xl font-black text-emerald-900 font-mono mt-1 block">
                  {formatCurrency(allInOneReport.sales.totalRevenue, selectedCurrency)}
                </span>
                <p className="text-[11px] text-emerald-700 mt-0.5">{allInOneReport.sales.totalInvoicesCount} invoices issued</p>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Total Procurement & OPEX
                </span>
                <span className="text-xl font-black text-amber-900 font-mono mt-1 block">
                  {formatCurrency(allInOneReport.purchases.totalPurchases, selectedCurrency)}
                </span>
                <p className="text-[11px] text-amber-700 mt-0.5">Bills & direct operating expenses</p>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  Operating Net Income
                </span>
                <span className="text-xl font-black text-blue-900 font-mono mt-1 block">
                  {formatCurrency(allInOneReport.pnl.netIncome, selectedCurrency)}
                </span>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  {allInOneReport.pnl.netProfitMarginPercentage.toFixed(1)}% Net Margin
                </p>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200">
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                  Inventory Asset Value
                </span>
                <span className="text-xl font-black text-purple-900 font-mono mt-1 block">
                  {formatCurrency(allInOneReport.inventory.totalInventoryValue, selectedCurrency)}
                </span>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  {allInOneReport.inventory.totalUnitsOnHand} units on hand
                </p>
              </div>
            </div>

            {/* Comprehensive Executive Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: P&L & Cash Overview */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-2">
                  1. Profit & Loss Summary
                </h4>
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Total Sales Revenue:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(allInOneReport.pnl.totalRevenue, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Cost of Goods Sold (COGS):</span>
                    <span className="font-mono text-slate-700">
                      -{formatCurrency(allInOneReport.pnl.costOfGoodsSold, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 font-bold text-emerald-800">
                    <span>Gross Profit:</span>
                    <span className="font-mono">
                      {formatCurrency(allInOneReport.pnl.grossProfit, selectedCurrency)} ({allInOneReport.pnl.grossMarginPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Operating Expenses (OPEX):</span>
                    <span className="font-mono text-rose-700">
                      -{formatCurrency(allInOneReport.pnl.totalExpenses, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold text-sm text-slate-900 bg-emerald-100/60 p-2 rounded-xl">
                    <span>Operating Net Profit:</span>
                    <span className="font-mono text-emerald-800">
                      {formatCurrency(allInOneReport.pnl.netIncome, selectedCurrency)}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-2 pt-2">
                  2. Tax & Compliance Overview
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Output Tax (Collected from Customers):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(allInOneReport.tax.totalOutputTax, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Input Tax (Paid to Vendors / Suppliers):</span>
                    <span className="font-mono text-slate-700">
                      -{formatCurrency(allInOneReport.tax.totalInputTax, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold text-amber-800 bg-amber-50 p-2 rounded-xl">
                    <span>Net Tax Liability Payable:</span>
                    <span className="font-mono">
                      {formatCurrency(allInOneReport.tax.netTaxLiability, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Balance Sheet & Working Capital */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-2">
                  3. Working Capital & Balance Sheet Position
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Cash & Bank Accounts:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(allInOneReport.balanceSheet.assets.currentAssets.cashAndEquivalents, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Accounts Receivable (Open Invoices):</span>
                    <span className="font-mono text-slate-800">
                      {formatCurrency(allInOneReport.balanceSheet.assets.currentAssets.accountsReceivable, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Inventory Stock Valuation:</span>
                    <span className="font-mono text-slate-800">
                      {formatCurrency(allInOneReport.inventory.totalInventoryValue, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Accounts Payable (Vendor Bills Due):</span>
                    <span className="font-mono text-rose-700">
                      {formatCurrency(allInOneReport.balanceSheet.liabilities.currentLiabilities.accountsPayable, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold text-slate-900 bg-blue-100/60 p-2 rounded-xl">
                    <span>Total Retained Equity:</span>
                    <span className="font-mono text-blue-900">
                      {formatCurrency(allInOneReport.balanceSheet.equity.totalEquity, selectedCurrency)}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-2 pt-2">
                  4. Inventory Health & Reorder Metrics
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Total Active SKUs:</span>
                    <span className="font-mono font-bold text-slate-900">{inventoryItems.length} Products</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Total Quantity on Hand:</span>
                    <span className="font-mono text-slate-800">{allInOneReport.inventory.totalUnitsOnHand} units</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Estimated Retail Sales Value:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(allInOneReport.inventory.potentialRetailValue, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold text-amber-700">
                    <span>Low / Out of Stock Items:</span>
                    <span className="font-mono font-bold">
                      {allInOneReport.inventory.lowStockItemsCount + allInOneReport.inventory.outOfStockItemsCount} Items Need Reorder
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. DAYBOOK (DAILY JOURNAL) */}
        {activeReportTab === 'daybook' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            {/* Daybook Date Selector & Totals Banner */}
            <div className="no-print p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Filter Daybook Date:
                </label>
                <input
                  type="date"
                  value={daybookFilterDate}
                  onChange={(e) => setDaybookFilterDate(e.target.value)}
                  className="px-3 py-1.5 font-mono text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={() => setDaybookFilterDate(new Date().toISOString().split('T')[0])}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Debits</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatCurrency(daybook.totalDebit, selectedCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Credits</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatCurrency(daybook.totalCredit, selectedCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Day's Balance</span>
                  <span
                    className={`font-mono font-extrabold ${
                      daybook.netDayBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatCurrency(daybook.netDayBalance, selectedCurrency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Daybook Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                    <th className="py-3 px-4 font-semibold">Ref / Voucher ID</th>
                    <th className="py-3 px-4 font-semibold">Entry Type</th>
                    <th className="py-3 px-4 font-semibold">Account / Counterparty</th>
                    <th className="py-3 px-4 font-semibold">Description / Memo</th>
                    <th className="py-3 px-4 text-right font-semibold text-emerald-700">Debit ($)</th>
                    <th className="py-3 px-4 text-right font-semibold text-slate-800">Credit ($)</th>
                    <th className="py-3 px-4 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {daybook.entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                        <p className="font-medium text-slate-600">No journal entries recorded for {daybookFilterDate}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Select a different date or record transactions to generate daybook lines.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    daybook.entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{entry.id}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              entry.type === 'receipt'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : entry.type === 'payment'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : entry.type === 'invoice'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{entry.accountOrEntity}</td>
                        <td className="py-3 px-4 text-slate-600">{entry.description}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {entry.debit > 0 ? formatCurrency(entry.debit, selectedCurrency) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                          {entry.credit > 0 ? formatCurrency(entry.credit, selectedCurrency) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {daybook.entries.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-[11px]">
                        Day's Journal Total:
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-800 text-sm">
                        {formatCurrency(daybook.totalDebit, selectedCurrency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                        {formatCurrency(daybook.totalCredit, selectedCurrency)}
                      </td>
                      <td className="py-3 px-4 text-center text-[10px] font-mono font-bold text-emerald-700">
                        BALANCED
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* 2. SALES REPORT */}
        {activeReportTab === 'sales' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            {/* Sales Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Sales Revenue</span>
                <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">
                  {formatCurrency(salesReport.totalSales, selectedCurrency)}
                </span>
                <span className="text-[11px] text-emerald-700">{salesReport.totalInvoices} Invoices</span>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Collections Received</span>
                <span className="text-xl font-bold font-mono text-blue-900 mt-1 block">
                  {formatCurrency(salesReport.paidSales, selectedCurrency)}
                </span>
                <span className="text-[11px] text-blue-700">
                  {salesReport.totalSales > 0
                    ? ((salesReport.paidSales / salesReport.totalSales) * 100).toFixed(1)
                    : 0}% collected
                </span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Open Receivables (A/R)</span>
                <span className="text-xl font-bold font-mono text-amber-900 mt-1 block">
                  {formatCurrency(salesReport.unpaidSales, selectedCurrency)}
                </span>
                <span className="text-[11px] text-amber-700">Awaiting customer payment</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">Sales Tax (VAT) Billed</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {formatCurrency(salesReport.totalTaxCollected, selectedCurrency)}
                </span>
                <span className="text-[11px] text-slate-500">Output tax liability</span>
              </div>
            </div>

            {/* Sales by Client Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Sales & Invoicing Performance by Client
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">Client Name</th>
                      <th className="py-3 px-4 font-semibold text-center">Invoices</th>
                      <th className="py-3 px-4 font-semibold text-right">Total Invoiced</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount Collected</th>
                      <th className="py-3 px-4 font-semibold text-right">Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {salesReport.byClient.map((c) => (
                      <tr key={c.clientId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{c.clientName}</td>
                        <td className="py-3 px-4 text-center font-mono">{c.invoiceCount}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(c.totalInvoiced, selectedCurrency)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">
                          {formatCurrency(c.amountPaid, selectedCurrency)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                          {formatCurrency(c.balanceDue, selectedCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. PURCHASE REPORT */}
        {activeReportTab === 'purchase' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            {/* Purchase Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Total Purchases & OPEX</span>
                <span className="text-xl font-bold font-mono text-amber-900 mt-1 block">
                  {formatCurrency(purchaseReport.totalPurchases, selectedCurrency)}
                </span>
                <span className="text-[11px] text-amber-700">{purchaseReport.totalBills} Vendor Bills</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Disbursements Paid</span>
                <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">
                  {formatCurrency(purchaseReport.paidPurchases, selectedCurrency)}
                </span>
                <span className="text-[11px] text-emerald-700">Settled to suppliers</span>
              </div>

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Open Payables (A/P)</span>
                <span className="text-xl font-bold font-mono text-rose-900 mt-1 block">
                  {formatCurrency(purchaseReport.unpaidPurchases, selectedCurrency)}
                </span>
                <span className="text-[11px] text-rose-700">Outstanding vendor bills</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">Input Tax / VAT Paid</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {formatCurrency(purchaseReport.totalTaxPaid, selectedCurrency)}
                </span>
                <span className="text-[11px] text-slate-500">Eligible input tax credit</span>
              </div>
            </div>

            {/* Purchases by Vendor Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Procurement & Disbursements by Vendor
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">Vendor / Supplier</th>
                      <th className="py-3 px-4 font-semibold text-center">Bills Count</th>
                      <th className="py-3 px-4 font-semibold text-right">Total Billed</th>
                      <th className="py-3 px-4 font-semibold text-right">Paid Amount</th>
                      <th className="py-3 px-4 font-semibold text-right">Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {purchaseReport.byVendor.map((v) => (
                      <tr key={v.vendorName} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{v.vendorName}</td>
                        <td className="py-3 px-4 text-center font-mono">{v.billCount}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(v.totalBilled, selectedCurrency)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">
                          {formatCurrency(v.amountPaid, selectedCurrency)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                          {formatCurrency(v.balanceDue, selectedCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. INVENTORY VALUATION REPORT */}
        {activeReportTab === 'inventory' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            {/* Inventory Valuation KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Asset Stock Valuation</span>
                <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">
                  {formatCurrency(inventoryReport.totalInventoryValue, selectedCurrency)}
                </span>
                <span className="text-[11px] text-emerald-700">Purchase cost basis</span>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Total Stock Units</span>
                <span className="text-xl font-bold font-mono text-blue-900 mt-1 block">
                  {inventoryReport.totalUnitsOnHand}
                </span>
                <span className="text-[11px] text-blue-700">Across {inventoryItems.length} SKUs</span>
              </div>

              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200">
                <span className="text-[10px] font-bold text-teal-800 uppercase block">Potential Retail Value</span>
                <span className="text-xl font-bold font-mono text-teal-900 mt-1 block">
                  {formatCurrency(inventoryReport.potentialRetailValue, selectedCurrency)}
                </span>
                <span className="text-[11px] text-teal-700">
                  +{formatCurrency(inventoryReport.potentialGrossMargin, selectedCurrency)} margin
                </span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Reorder Warnings</span>
                <span className="text-xl font-bold font-mono text-amber-900 mt-1 block">
                  {inventoryReport.lowStockItemsCount + inventoryReport.outOfStockItemsCount} Items
                </span>
                <span className="text-[11px] text-amber-700">
                  {inventoryReport.outOfStockItemsCount} out of stock
                </span>
              </div>
            </div>

            {/* Inventory Items Valuation Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Product Inventory Valuation & Stock On Hand
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">SKU & Item Name</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 text-right font-semibold">Qty on Hand</th>
                      <th className="py-3 px-4 text-right font-semibold">Unit Cost</th>
                      <th className="py-3 px-4 text-right font-semibold">Selling Price</th>
                      <th className="py-3 px-4 text-right font-semibold">Asset Valuation</th>
                      <th className="py-3 px-4 text-center font-semibold">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {inventoryItems.map((item) => {
                      const isOutOfStock = item.quantityOnHand <= 0;
                      const isLowStock = item.quantityOnHand > 0 && item.quantityOnHand <= item.reorderLevel;
                      const valuation = item.quantityOnHand * item.unitCost;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900">{item.name}</span>
                            <span className="font-mono text-[11px] text-emerald-700 ml-2 font-semibold">
                              ({item.sku})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{item.category}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {item.quantityOnHand} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {formatCurrency(item.unitCost, selectedCurrency)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-900 font-semibold">
                            {formatCurrency(item.sellingPrice, selectedCurrency)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                            {formatCurrency(valuation, selectedCurrency)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isOutOfStock ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Healthy
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. TAX REPORT */}
        {activeReportTab === 'tax' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  Output Tax (Sales Tax Collected)
                </span>
                <span className="text-2xl font-extrabold text-emerald-900 font-mono">
                  {formatCurrency(taxReport.totalOutputTax, selectedCurrency)}
                </span>
                <p className="text-[11px] text-emerald-700">Collected from invoices</p>
              </div>

              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">
                  Input Tax (Tax Paid on Purchases)
                </span>
                <span className="text-2xl font-extrabold text-blue-900 font-mono">
                  {formatCurrency(taxReport.totalInputTax, selectedCurrency)}
                </span>
                <p className="text-[11px] text-blue-700">Paid on bills & operational expenses</p>
              </div>

              <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Net Tax Liability Payable
                </span>
                <span className="text-2xl font-extrabold text-amber-900 font-mono">
                  {formatCurrency(taxReport.netTaxLiability, selectedCurrency)}
                </span>
                <p className="text-[11px] text-amber-700">Output Tax minus Input Tax credit</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Eligible Tax Deductions by Category (Schedule C)
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">Expense Category</th>
                      <th className="py-3 px-4 font-semibold text-center">Eligibility</th>
                      <th className="py-3 px-4 font-semibold text-right">Total Deductible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {taxReport.deductionsByCategory.map((d) => (
                      <tr key={d.category}>
                        <td className="py-3 px-4 font-medium text-slate-800">{d.category}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {d.category === 'Travel & Meals' ? '50% Rate' : '100% Full'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(d.amount, selectedCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. PROFIT & LOSS STATEMENT */}
        {activeReportTab === 'pnl' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            {/* Revenue */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl font-bold text-slate-800 border-l-4 border-emerald-600 print:bg-slate-100 print:text-black">
                <span className="uppercase tracking-wider">Total Revenue / Billings</span>
                <span className="font-mono text-emerald-700 text-sm">
                  {formatCurrency(profitAndLoss.totalRevenue, selectedCurrency)}
                </span>
              </div>
              <div className="pl-4 pr-2.5 py-1.5 flex justify-between text-slate-600 print:text-slate-700">
                <span>Client Services & Product Sales</span>
                <span className="font-mono">{formatCurrency(profitAndLoss.totalRevenue, selectedCurrency)}</span>
              </div>
            </div>

            {/* COGS & Gross Profit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl font-bold text-slate-800 border-l-4 border-slate-400 print:bg-slate-100 print:text-black">
                <span className="uppercase tracking-wider">Cost of Goods Sold (COGS)</span>
                <span className="font-mono text-slate-700 print:text-black">
                  {formatCurrency(profitAndLoss.costOfGoodsSold, selectedCurrency)}
                </span>
              </div>
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex justify-between items-center print:bg-slate-50 print:border-slate-300">
                <div>
                  <span className="font-bold text-slate-900 text-sm print:text-black">Gross Profit</span>
                  <span className="text-emerald-700 text-xs ml-2 font-semibold">
                    ({profitAndLoss.grossMarginPercentage.toFixed(1)}% Gross Margin)
                  </span>
                </div>
                <span className="font-mono font-extrabold text-emerald-700 text-base">
                  {formatCurrency(profitAndLoss.grossProfit, selectedCurrency)}
                </span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl font-bold text-slate-800 border-l-4 border-rose-500 print:bg-slate-100 print:text-black">
                <span className="uppercase tracking-wider">Operating Expenses (OPEX)</span>
                <span className="font-mono text-rose-700 text-sm">
                  {formatCurrency(profitAndLoss.totalExpenses, selectedCurrency)}
                </span>
              </div>

              <div className="space-y-1.5 pl-4 pr-2.5">
                {profitAndLoss.operatingExpenses.map((exp) => (
                  <div
                    key={exp.category}
                    className="flex justify-between text-slate-600 py-1.5 border-b border-slate-100 print:border-slate-200 print:text-slate-700"
                  >
                    <span>{exp.category}</span>
                    <span className="font-mono font-medium">{formatCurrency(exp.amount, selectedCurrency)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Income */}
            <div className="p-5 bg-slate-900 text-white rounded-3xl flex justify-between items-center print:bg-slate-200 print:text-black">
              <div>
                <span className="text-sm font-bold uppercase tracking-wider">Net Operating Income</span>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {profitAndLoss.netProfitMarginPercentage.toFixed(1)}% Net Profit Margin
                </p>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-400 print:text-emerald-800">
                {formatCurrency(profitAndLoss.netIncome, selectedCurrency)}
              </span>
            </div>
          </div>
        )}

        {/* 7. BALANCE SHEET */}
        {activeReportTab === 'balance_sheet' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            {/* Assets */}
            <div className="space-y-3">
              <div className="bg-slate-900 text-white p-3 rounded-xl font-bold flex justify-between print:bg-slate-800">
                <span className="uppercase tracking-wider">Total Assets</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(balanceSheet.assets.totalAssets, selectedCurrency)}
                </span>
              </div>
              <div className="space-y-2 pl-4 pr-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Cash & Cash Equivalents:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(balanceSheet.assets.currentAssets.cashAndEquivalents, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Accounts Receivable (A/R):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(balanceSheet.assets.currentAssets.accountsReceivable, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Inventory Merchandise Assets:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(balanceSheet.assets.currentAssets.inventoryAssets, selectedCurrency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-3">
              <div className="bg-slate-900 text-white p-3 rounded-xl font-bold flex justify-between print:bg-slate-800">
                <span className="uppercase tracking-wider">Total Liabilities & Retained Equity</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(
                    balanceSheet.liabilities.totalLiabilities + balanceSheet.equity.totalEquity,
                    selectedCurrency
                  )}
                </span>
              </div>
              <div className="space-y-2 pl-4 pr-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Accounts Payable (A/P):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(balanceSheet.liabilities.currentLiabilities.accountsPayable, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Accrued Taxes & Expenses:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(balanceSheet.liabilities.currentLiabilities.accruedExpenses, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700 font-semibold">Retained Earnings (Equity):</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatCurrency(balanceSheet.equity.retainedEarnings, selectedCurrency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. CASH FLOW STATEMENT */}
        {activeReportTab === 'cash_flow' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Operating Cash Flow</span>
                <span className="text-xl font-bold font-mono text-emerald-900 mt-1 block">
                  {formatCurrency(cashFlow.operatingActivities.netCashFromOperations, selectedCurrency)}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">Net Change in Cash</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                  {formatCurrency(cashFlow.netChangeInCash, selectedCurrency)}
                </span>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Ending Cash Balance</span>
                <span className="text-xl font-bold font-mono text-blue-900 mt-1 block">
                  {formatCurrency(cashFlow.cashAtEndOfPeriod, selectedCurrency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 9. AR AGING SCHEDULE */}
        {activeReportTab === 'ar_aging' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {arAging.map((b) => (
                <div key={b.period} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{b.period}</span>
                  <span className="text-lg font-extrabold text-slate-900 font-mono mt-1 block">
                    {formatCurrency(b.amount, selectedCurrency)}
                  </span>
                  <span className="text-[10px] text-slate-500">{b.count} invoices</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Outstanding Invoices Awaiting Settlement
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold">Invoice #</th>
                      <th className="py-3 px-4 font-semibold">Client</th>
                      <th className="py-3 px-4 font-semibold">Due Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Balance Due</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {invoices
                      .filter((i) => i.status === 'sent' || i.status === 'overdue')
                      .map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{inv.clientCompany || inv.clientName}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{inv.dueDate}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            {formatCurrency(inv.balanceDue, inv.currency)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                inv.status === 'overdue'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => sendInvoiceReminder(inv.id)}
                              className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl transition-colors font-semibold"
                            >
                              Send Reminder
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* 10. ASSETS & LIABILITIES DETAILED SUMMARY REPORT */}
        {activeReportTab === 'assets_liabilities' && (
          <div className="space-y-6 text-xs animate-in fade-in">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Business Assets</span>
                <span className="text-xl font-bold font-mono text-emerald-950 mt-1 block">
                  {formatCurrency(assetsLiabilitiesReport.assets.totalAssets, selectedCurrency)}
                </span>
                <span className="text-[11px] text-emerald-700">Cash, AR, Stock & Equipment</span>
              </div>

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 shadow-xs">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Total Liabilities (Debts)</span>
                <span className="text-xl font-bold font-mono text-rose-950 mt-1 block">
                  {formatCurrency(assetsLiabilitiesReport.liabilities.totalLiabilities, selectedCurrency)}
                </span>
                <span className="text-[11px] text-rose-700">Trade AP, Tax & Accruals</span>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-300 uppercase block">Total Net Worth (Equity)</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                  {formatCurrency(assetsLiabilitiesReport.netWorth, selectedCurrency)}
                </span>
                <span className="text-[11px] text-slate-400">Assets minus Liabilities</span>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 shadow-xs">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Working Capital & Ratio</span>
                <span className="text-xl font-bold font-mono text-blue-950 mt-1 block">
                  {formatCurrency(assetsLiabilitiesReport.workingCapital, selectedCurrency)}
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">
                  Current Ratio: {assetsLiabilitiesReport.currentRatio.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Assets and Liabilities 2-Column Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assets Breakdown Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Detailed Assets Schedule
                  </h4>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatCurrency(assetsLiabilitiesReport.assets.totalAssets, selectedCurrency)}
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Liquid Assets</span>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <span className="font-medium">Cash on Hand & Bank Accounts:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(assetsLiabilitiesReport.assets.cashAndEquivalents, selectedCurrency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <div>
                      <span className="font-medium block">Accounts Receivable (Trade Debtors):</span>
                      <span className="text-[10px] text-slate-400">Outstanding client invoices</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(assetsLiabilitiesReport.assets.accountsReceivable, selectedCurrency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <div>
                      <span className="font-medium block">Merchandise & Inventory Valuation:</span>
                      <span className="text-[10px] text-slate-400">
                        {businessProfile.enableInventory !== false ? 'Active stock on hand' : 'Inventory module disabled'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(assetsLiabilitiesReport.assets.inventoryValue, selectedCurrency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <span className="font-medium">Prepayments & Other Current Assets:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(assetsLiabilitiesReport.assets.otherCurrentAssets, selectedCurrency)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex justify-between font-bold text-slate-900">
                    <span>Subtotal Current Assets:</span>
                    <span className="font-mono">
                      {formatCurrency(assetsLiabilitiesReport.assets.currentAssetsTotal, selectedCurrency)}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2">Non-Current / Fixed Assets</span>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <span className="font-medium">Equipment, Furniture & Plant:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(assetsLiabilitiesReport.assets.fixedAssets, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Liabilities Breakdown Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Detailed Liabilities Schedule
                  </h4>
                  <span className="font-mono font-bold text-rose-700 text-sm">
                    {formatCurrency(assetsLiabilitiesReport.liabilities.totalLiabilities, selectedCurrency)}
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Obligations (Due &lt; 1 Year)</span>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <div>
                      <span className="font-medium block">Accounts Payable (Trade Creditors):</span>
                      <span className="text-[10px] text-slate-400">Bills owed to suppliers</span>
                    </div>
                    <span className="font-mono font-bold text-rose-700">
                      {formatCurrency(assetsLiabilitiesReport.liabilities.accountsPayable, selectedCurrency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <div>
                      <span className="font-medium block">Sales Tax & VAT Payable:</span>
                      <span className="text-[10px] text-slate-400">Net tax collected awaiting remittance</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(assetsLiabilitiesReport.liabilities.salesTaxPayable, selectedCurrency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <span className="font-medium">Accrued Expenses & Wages:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(assetsLiabilitiesReport.liabilities.accruedExpenses, selectedCurrency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <span className="font-medium">Short-Term Loans / Credit Lines:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(assetsLiabilitiesReport.liabilities.shortTermLoans, selectedCurrency)}
                    </span>
                  </div>

                  <div className="p-3 bg-rose-50/70 rounded-xl flex justify-between font-bold text-rose-900">
                    <span>Subtotal Current Liabilities:</span>
                    <span className="font-mono">
                      {formatCurrency(assetsLiabilitiesReport.liabilities.currentLiabilitiesTotal, selectedCurrency)}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2">Non-Current Long-Term Liabilities</span>

                  <div className="flex justify-between py-2 border-b border-slate-100 text-slate-700">
                    <span className="font-medium">Long-Term Bank Facilities:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(assetsLiabilitiesReport.liabilities.longTermLiabilities, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Worth Bottom Banner */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Business Financial Solvency Summary
                </span>
                <h3 className="text-base font-bold mt-0.5">
                  Assets ({formatCurrency(assetsLiabilitiesReport.assets.totalAssets, selectedCurrency)}) − Liabilities ({formatCurrency(assetsLiabilitiesReport.liabilities.totalLiabilities, selectedCurrency)})
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Working capital is healthy with a {assetsLiabilitiesReport.currentRatio.toFixed(2)}x coverage ratio.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Net Worth</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {formatCurrency(assetsLiabilitiesReport.netWorth, selectedCurrency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
