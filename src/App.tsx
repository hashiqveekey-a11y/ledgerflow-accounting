import React, { useState } from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InvoicesView } from './components/InvoicesView';
import { InvoiceModal } from './components/InvoiceModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { PurchaseInvoicesView } from './components/PurchaseInvoicesView';
import { PurchaseInvoiceModal } from './components/PurchaseInvoiceModal';
import { PurchaseInvoiceDetailModal } from './components/PurchaseInvoiceDetailModal';
import { ExpensesView } from './components/ExpensesView';
import { ExpenseModal } from './components/ExpenseModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { FinancialReportsView } from './components/FinancialReportsView';
import { BankReconciliationView } from './components/BankReconciliationView';
import { ClientsView } from './components/ClientsView';
import { ClientModal } from './components/ClientModal';
import { AICopilotModal } from './components/AICopilotModal';
import { LedgerAccountsView } from './components/LedgerAccountsView';
import { LedgerAccountModal } from './components/LedgerAccountModal';
import { InventoryView } from './components/InventoryView';
import { InventoryItemModal } from './components/InventoryItemModal';
import { StockAdjustmentModal } from './components/StockAdjustmentModal';
import { PaymentVouchersView } from './components/PaymentVouchersView';
import { PaymentVoucherModal } from './components/PaymentVoucherModal';
import { VoucherReceiptModal } from './components/VoucherReceiptModal';
import { SecurityLoginView } from './components/SecurityLoginView';
import { CreateCompanyOnboardingModal } from './components/CreateCompanyOnboardingModal';
import { SettingsView } from './components/SettingsView';
import { VendorsView } from './components/VendorsView';
import { VendorModal } from './components/VendorModal';
import { AIPredictiveInsightsView } from './components/AIPredictiveInsightsView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { VoiceProvider, useVoice } from './context/VoiceContext';
import { VoiceCommanderModal } from './components/VoiceCommanderModal';
import { VoiceFloatingWidget } from './components/VoiceFloatingWidget';
import { Expense, Client, LedgerAccount, Vendor } from './types';

const MainLayout: React.FC = () => {
  const {
    businessProfile,
    activeTab,
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    isClientModalOpen,
    setIsClientModalOpen,
    isVendorModalOpen,
    setIsVendorModalOpen,
    setIsInvoiceModalOpen,
    setSelectedInvoiceForEdit,
    setIsPurchaseInvoiceModalOpen,
    setSelectedPurchaseInvoiceForEdit,
    isLedgerModalOpen,
    setIsLedgerModalOpen,
    isAuthenticated,
    isSessionLocked,
  } = useAccounting();

  const { isVoiceWidgetOpen, setIsVoiceWidgetOpen } = useVoice();

  // Modal states
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [ledgerToEdit, setLedgerToEdit] = useState<LedgerAccount | null>(null);

  // If no organization is registered yet, show onboarding
  if (!businessProfile.companyName) {
    return <CreateCompanyOnboardingModal />;
  }

  // Security Login and Lock Screen Gate
  if (!isAuthenticated) {
    return <SecurityLoginView isLocked={false} />;
  }

  if (isSessionLocked) {
    return <SecurityLoginView isLocked={true} />;
  }

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setExpenseToEdit(null);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleCloseClientModal = () => {
    setIsClientModalOpen(false);
    setClientToEdit(null);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setVendorToEdit(vendor);
    setIsVendorModalOpen(true);
  };

  const handleCloseVendorModal = () => {
    setIsVendorModalOpen(false);
    setVendorToEdit(null);
  };

  const handleCreateInvoiceForClient = (client: Client) => {
    setSelectedInvoiceForEdit(null);
    setIsInvoiceModalOpen(true);
  };

  const handleCreateBillForVendor = (vendor: Vendor) => {
    setSelectedPurchaseInvoiceForEdit(null);
    setIsPurchaseInvoiceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white antialiased">
      {/* Offline Status Bar */}
      <OfflineIndicator />

      {/* Top Navigation */}
      <Navbar
        onOpenAICopilot={() => setIsAICopilotOpen(true)}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        onOpenVoiceCommander={() => setIsVoiceWidgetOpen(true)}
      />

      {/* Main App Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAICopilot={() => setIsAICopilotOpen(true)}
              onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              onOpenAICreator={() => {
                setSelectedInvoiceForEdit(null);
                setIsInvoiceModalOpen(true);
              }}
            />
          )}

          {activeTab === 'purchase_invoices' && (
            <PurchaseInvoicesView onOpenAICopilot={() => setIsAICopilotOpen(true)} />
          )}

          {activeTab === 'vouchers' && <PaymentVouchersView />}

          {activeTab === 'inventory' && <InventoryView />}

          {activeTab === 'expenses' && (
            <ExpensesView
              onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
              onEditExpense={handleEditExpense}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerAccountsView onOpenAICopilot={() => setIsAICopilotOpen(true)} />
          )}

          {activeTab === 'reports' && (
            <FinancialReportsView onOpenAICopilot={() => setIsAICopilotOpen(true)} />
          )}

          {activeTab === 'bank_feed' && <BankReconciliationView />}

          {activeTab === 'clients' && (
            <ClientsView
              onEditClient={handleEditClient}
              onCreateInvoiceForClient={handleCreateInvoiceForClient}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorsView
              onEditVendor={handleEditVendor}
              onCreateBillForVendor={handleCreateBillForVendor}
            />
          )}

          {activeTab === 'ai_insights' && (
            <AIPredictiveInsightsView
              onCreateInvoiceForClient={(clientName) => {
                setSelectedInvoiceForEdit(null);
                setIsInvoiceModalOpen(true);
              }}
              onCreatePurchaseOrder={(vendorName) => {
                setSelectedPurchaseInvoiceForEdit(null);
                setIsPurchaseInvoiceModalOpen(true);
              }}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Floating Hands-Free Voice Controller Widget */}
      <VoiceFloatingWidget onOpenFullModal={() => setIsVoiceWidgetOpen(true)} />

      {/* Global Modals & Drawers */}
      <InvoiceModal />
      <InvoiceDetailModal />
      <PurchaseInvoiceModal />
      <PurchaseInvoiceDetailModal />
      <InventoryItemModal />
      <StockAdjustmentModal />
      <PaymentVoucherModal />
      <VoucherReceiptModal />
      <ExpenseModal
        expenseToEdit={expenseToEdit}
        onClose={handleCloseExpenseModal}
      />
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
      />
      <ClientModal
        clientToEdit={clientToEdit}
        onClose={handleCloseClientModal}
      />
      <VendorModal
        vendorToEdit={vendorToEdit}
        onClose={handleCloseVendorModal}
      />
      <LedgerAccountModal
        isOpen={isLedgerModalOpen}
        accountToEdit={ledgerToEdit}
        onClose={() => {
          setIsLedgerModalOpen(false);
          setLedgerToEdit(null);
        }}
      />
      <AICopilotModal
        isOpen={isAICopilotOpen}
        onClose={() => setIsAICopilotOpen(false)}
      />
      <VoiceCommanderModal
        isOpen={isVoiceWidgetOpen}
        onClose={() => setIsVoiceWidgetOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AccountingProvider>
      <VoiceProvider>
        <MainLayout />
      </VoiceProvider>
    </AccountingProvider>
  );
}
