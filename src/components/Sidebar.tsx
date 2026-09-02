import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  ShoppingBag,
  PieChart,
  Landmark,
  Users,
  Building2,
  BookOpen,
  Settings,
  Boxes,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    businessProfile,
    invoices,
    purchaseInvoices,
    expenses,
    bankTransactions,
    ledgerAccounts,
    inventoryItems,
    paymentVouchers,
    vendors,
  } = useAccounting();

  const overdueInvoicesCount = invoices.filter((i) => i.status === 'overdue').length;
  const recurringInvoicesCount = invoices.filter((i) => i.recurring?.isRecurring && i.recurring?.active).length;
  const unpaidPurchaseInvoicesCount = purchaseInvoices.filter((b) => b.status !== 'paid' && b.status !== 'cancelled').length;
  const unmatchedTransactionsCount = bankTransactions.filter((t) => t.status === 'unmatched').length;
  const lowStockCount = inventoryItems.filter((item) => item.quantityOnHand <= item.reorderLevel).length;

  const isInventoryEnabled = businessProfile.enableInventory !== false;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Financial Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'invoices',
      label: 'Sales Invoices',
      icon: FileSpreadsheet,
      badge: overdueInvoicesCount > 0 ? `${overdueInvoicesCount} overdue` : `${recurringInvoicesCount} recurring`,
      badgeColor: overdueInvoicesCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'purchase_invoices',
      label: 'Purchase Invoices',
      icon: ShoppingBag,
      badge: unpaidPurchaseInvoicesCount > 0 ? `${unpaidPurchaseInvoicesCount} unpaid` : `${purchaseInvoices.length}`,
      badgeColor: unpaidPurchaseInvoicesCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'vouchers',
      label: 'Payments & Receipts',
      icon: CreditCard,
      badge: `${paymentVouchers.length}`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    ...(isInventoryEnabled
      ? [
          {
            id: 'inventory',
            label: 'Inventory & Stock',
            icon: Boxes,
            badge: lowStockCount > 0 ? `${lowStockCount} low stock` : `${inventoryItems.length} items`,
            badgeColor: lowStockCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200',
          },
        ]
      : []),
    {
      id: 'expenses',
      label: 'Expenses & Cash Out',
      icon: Receipt,
      badge: `${expenses.length}`,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'ledger',
      label: 'Chart of Accounts',
      icon: BookOpen,
      badge: `${ledgerAccounts.length}`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'reports',
      label: 'Financial Reports',
      icon: PieChart,
      badge: 'All-in-One',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      id: 'ai_insights',
      label: 'AI Predictive & Insights',
      icon: Sparkles,
      badge: 'AI Smart',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'bank_feed',
      label: 'Bank Reconciliation',
      icon: Landmark,
      badge: unmatchedTransactionsCount > 0 ? `${unmatchedTransactionsCount} unmatched` : null,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'clients',
      label: 'Customers & CRM',
      icon: Users,
      badge: null,
    },
    {
      id: 'vendors',
      label: 'Vendors & Suppliers',
      icon: Building2,
      badge: `${vendors?.length || 0}`,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'settings',
      label: 'Company & Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="no-print w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 p-3.5">
      {/* Navigation Links */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 stroke-[2.5]' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${
                    isActive ? 'bg-slate-800 text-emerald-300 border-slate-700' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Accounting System Status Box */}
      <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Books Status
            </span>
            <span className="text-emerald-700 font-bold font-mono">Balanced</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>Automated Engine:</span>
              <span className="text-slate-700 font-medium">Active (24/7)</span>
            </div>
            <div className="flex justify-between">
              <span>Accounting Basis:</span>
              <span className="text-slate-700 font-medium">Accrual GAAP</span>
            </div>
          </div>
        </div>

        <PWAInstallButton variant="sidebar" className="w-full justify-center" />
      </div>
    </aside>
  );
};
