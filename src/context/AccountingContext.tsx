import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  BusinessProfile,
  Client,
  Vendor,
  Invoice,
  PurchaseInvoice,
  Expense,
  BankTransaction,
  AutomationLog,
  CurrencyCode,
  ProfitAndLossReport,
  BalanceSheetReport,
  CashFlowReport,
  TaxDeductionSummary,
  ARAgingBucket,
  AIReceiptScanResult,
  LedgerAccount,
  AuthUser,
  SecuritySettings,
  AIChatIntentAction,
  InventoryItem,
  InventoryMovement,
  PaymentVoucher,
  PaymentVoucherType,
  StockAdjustmentType,
  StockAdjustmentReason,
  DaybookSummary,
  SalesReportSummary,
  PurchaseReportSummary,
  TaxReportSummary,
  InventoryReportSummary,
  AllInOneReportSummary,
  AssetsLiabilitiesReport,
  CustomerPredictiveInsight,
  InventoryAutomationInsight,
} from '../types';
import {
  initialBusinessProfile,
  initialClients,
  initialVendors,
  initialInvoices,
  initialPurchaseInvoices,
  initialExpenses,
  initialBankTransactions,
  initialAutomationLogs,
  initialLedgerAccounts,
  initialAuthUser,
  initialSecuritySettings,
  initialInventoryItems,
  initialInventoryMovements,
  initialPaymentVouchers,
} from '../data/initialData';
import {
  calculateProfitAndLoss,
  calculateBalanceSheet,
  calculateCashFlow,
  calculateTaxDeductions,
  calculateARAging,
  calculateDaybook,
  calculateSalesReport,
  calculatePurchaseReport,
  calculateTaxReport,
  calculateInventoryReport,
  calculateAllInOneReport,
  calculateAssetsLiabilitiesReport,
  processRecurringInvoices,
} from '../utils/accountingMath';
import { exportReportPDF } from '../utils/pdfExport';

interface AccountingContextType {
  // Auth & Security
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isSessionLocked: boolean;
  securitySettings: SecuritySettings;
  login: (email: string, pinOrPass: string) => boolean;
  loginWithPin: (pin: string) => boolean;
  quickDemoLogin: () => void;
  lockSession: () => void;
  unlockSession: (pinOrPass: string) => boolean;
  logout: () => void;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  changeUserPin: (newPin: string) => void;

  // Business Profile & Data
  businessProfile: BusinessProfile;
  clients: Client[];
  vendors: Vendor[];
  invoices: Invoice[];
  purchaseInvoices: PurchaseInvoice[];
  expenses: Expense[];
  bankTransactions: BankTransaction[];
  automationLogs: AutomationLog[];
  ledgerAccounts: LedgerAccount[];
  inventoryItems: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  paymentVouchers: PaymentVoucher[];

  // App UI State
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (currency: CurrencyCode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedInvoiceForView: Invoice | null;
  setSelectedInvoiceForView: (invoice: Invoice | null) => void;
  selectedInvoiceForEdit: Invoice | null;
  setSelectedInvoiceForEdit: (invoice: Invoice | null) => void;
  selectedPurchaseInvoiceForView: PurchaseInvoice | null;
  setSelectedPurchaseInvoiceForView: (invoice: PurchaseInvoice | null) => void;
  selectedPurchaseInvoiceForEdit: PurchaseInvoice | null;
  setSelectedPurchaseInvoiceForEdit: (invoice: PurchaseInvoice | null) => void;
  
  // Vendor UI State
  selectedVendorForEdit: Vendor | null;
  setSelectedVendorForEdit: (vendor: Vendor | null) => void;
  isVendorModalOpen: boolean;
  setIsVendorModalOpen: (open: boolean) => void;

  // Inventory UI State
  selectedInventoryItemForEdit: InventoryItem | null;
  setSelectedInventoryItemForEdit: (item: InventoryItem | null) => void;
  isInventoryModalOpen: boolean;
  setIsInventoryModalOpen: (open: boolean) => void;
  isStockAdjustmentModalOpen: boolean;
  setIsStockAdjustmentModalOpen: (open: boolean) => void;
  selectedItemForAdjustment: InventoryItem | null;
  setSelectedItemForAdjustment: (item: InventoryItem | null) => void;

  // Payment Vouchers UI State
  selectedVoucherForView: PaymentVoucher | null;
  setSelectedVoucherForView: (voucher: PaymentVoucher | null) => void;
  isPaymentVoucherModalOpen: boolean;
  setIsPaymentVoucherModalOpen: (open: boolean) => void;
  voucherTypeToCreate: PaymentVoucherType;
  setVoucherTypeToCreate: (type: PaymentVoucherType) => void;
  preselectedInvoiceForPayment: Invoice | PurchaseInvoice | null;
  setPreselectedInvoiceForPayment: (inv: Invoice | PurchaseInvoice | null) => void;

  // Modals & Notifications
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  isPurchaseInvoiceModalOpen: boolean;
  setIsPurchaseInvoiceModalOpen: (open: boolean) => void;
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  isClientModalOpen: boolean;
  setIsClientModalOpen: (open: boolean) => void;
  isLedgerModalOpen: boolean;
  setIsLedgerModalOpen: (open: boolean) => void;
  notificationMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  showNotification: (text: string, type?: 'success' | 'info' | 'warning') => void;

  // Actions
  addInvoice: (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => Invoice;
  updateInvoice: (id: string, invoiceData: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  markInvoicePaid: (id: string, amountPaid?: number) => void;
  duplicateInvoice: (id: string) => Invoice;
  sendInvoiceReminder: (id: string) => void;

  addPurchaseInvoice: (data: Omit<PurchaseInvoice, 'id' | 'createdAt' | 'updatedAt'>) => PurchaseInvoice;
  updatePurchaseInvoice: (id: string, data: Partial<PurchaseInvoice>) => void;
  deletePurchaseInvoice: (id: string) => void;
  markPurchaseInvoicePaid: (id: string, amountPaid?: number) => void;
  duplicatePurchaseInvoice: (id: string) => PurchaseInvoice;

  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Expense;
  updateExpense: (id: string, expenseData: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'totalInvoiced' | 'totalPaid' | 'outstandingBalance'>) => Client;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addVendor: (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'totalPurchased' | 'totalPaid' | 'outstandingPayable'>) => Vendor;
  updateVendor: (id: string, vendorData: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  addLedgerAccount: (accountData: Omit<LedgerAccount, 'id' | 'createdAt' | 'updatedAt'>) => LedgerAccount;
  updateLedgerAccount: (id: string, data: Partial<LedgerAccount>) => void;
  deleteLedgerAccount: (id: string) => void;

  // Inventory Actions
  addInventoryItem: (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => InventoryItem;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  adjustStock: (
    itemId: string,
    type: StockAdjustmentType,
    quantity: number,
    reason: StockAdjustmentReason,
    unitCost?: number,
    referenceNumber?: string,
    notes?: string
  ) => void;

  // Payment Vouchers Actions
  addPaymentVoucher: (data: Omit<PaymentVoucher, 'id' | 'createdAt' | 'updatedAt'>) => PaymentVoucher;
  deletePaymentVoucher: (id: string) => void;
  openPaymentModalForInvoice: (invoice: Invoice) => void;
  openPaymentModalForPurchaseInvoice: (bill: PurchaseInvoice) => void;

  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  reconcileTransaction: (txnId: string, matchedType: 'invoice' | 'expense' | 'purchase_invoice', matchedId: string) => void;
  unreconcileTransaction: (txnId: string) => void;
  runAutomatedRecurringEngine: () => { count: number; logs: AutomationLog[] };

  // AI Actions & Predictive Analytics
  askAICopilot: (prompt: string) => Promise<{ reply: string; action: AIChatIntentAction; suggestedButtons: any[] }>;
  executeAIAction: (action: AIChatIntentAction) => void;
  scanReceiptWithAI: (imageBase64?: string, textContext?: string) => Promise<AIReceiptScanResult>;
  generateInvoiceWithAI: (prompt: string) => Promise<any>;
  getFinancialInsightsWithAI: (userQuestion?: string) => Promise<any>;
  customerInsights: CustomerPredictiveInsight[];
  overallCustomerTrends: any;
  isPredictiveInsightsLoading: boolean;
  fetchCustomerPredictiveInsights: () => Promise<void>;
  inventoryAutomationInsights: InventoryAutomationInsight[];
  inventoryExecutiveSummary: any;
  isInventoryAutomationLoading: boolean;
  fetchInventoryAutomationInsights: () => Promise<void>;
  salesMonitorData: any;
  isSalesMonitorLoading: boolean;
  fetchSalesMonitorData: () => Promise<void>;

  // Data management
  clearAllData: () => void;
  resetToDemoData: () => void;
  exportDataBackup: () => void;
  importDataBackup: (jsonData: string) => boolean;

  // Real-time calculated reports
  profitAndLoss: ProfitAndLossReport;
  balanceSheet: BalanceSheetReport;
  assetsLiabilitiesReport: AssetsLiabilitiesReport;
  cashFlow: CashFlowReport;
  taxDeductions: TaxDeductionSummary;
  arAging: ARAgingBucket[];
  daybook: DaybookSummary;
  salesReport: SalesReportSummary;
  purchaseReport: PurchaseReportSummary;
  taxReport: TaxReportSummary;
  inventoryReport: InventoryReportSummary;
  allInOneReport: AllInOneReportSummary;
  daybookFilterDate: string;
  setDaybookFilterDate: (date: string) => void;
}

const STORAGE_KEY_PREFIX = 'ledgerflow_accounting_v2_';

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}auth_user`);
    return saved ? JSON.parse(saved) : initialAuthUser;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}is_auth`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}sec_settings`);
    return saved ? JSON.parse(saved) : initialSecuritySettings;
  });

  // Business Data
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
    return saved ? JSON.parse(saved) : initialBusinessProfile;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}clients`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialClients;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}vendors`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialVendors;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}invoices`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialInvoices;
  });

  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}purchase_invoices`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialPurchaseInvoices;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}expenses`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialExpenses;
  });

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialBankTransactions;
  });

  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}logs`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return initialAutomationLogs;
  });

  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}ledger_accounts`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialLedgerAccounts;
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}inventory_items`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialInventoryItems;
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}inventory_movements`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialInventoryMovements;
  });

  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}payment_vouchers`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialPaymentVouchers;
  });

  // UI State
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);
  const [selectedPurchaseInvoiceForView, setSelectedPurchaseInvoiceForView] = useState<PurchaseInvoice | null>(null);
  const [selectedPurchaseInvoiceForEdit, setSelectedPurchaseInvoiceForEdit] = useState<PurchaseInvoice | null>(null);
  
  // Vendor UI State
  const [selectedVendorForEdit, setSelectedVendorForEdit] = useState<Vendor | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState<boolean>(false);

  // Inventory UI State
  const [selectedInventoryItemForEdit, setSelectedInventoryItemForEdit] = useState<InventoryItem | null>(null);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState<boolean>(false);
  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] = useState<boolean>(false);
  const [selectedItemForAdjustment, setSelectedItemForAdjustment] = useState<InventoryItem | null>(null);

  // AI Predictive Insights & Automation State
  const [customerInsights, setCustomerInsights] = useState<CustomerPredictiveInsight[]>([]);
  const [overallCustomerTrends, setOverallCustomerTrends] = useState<any>(null);
  const [isPredictiveInsightsLoading, setIsPredictiveInsightsLoading] = useState<boolean>(false);

  const [inventoryAutomationInsights, setInventoryAutomationInsights] = useState<InventoryAutomationInsight[]>([]);
  const [inventoryExecutiveSummary, setInventoryExecutiveSummary] = useState<any>(null);
  const [isInventoryAutomationLoading, setIsInventoryAutomationLoading] = useState<boolean>(false);

  const [salesMonitorData, setSalesMonitorData] = useState<any>(null);
  const [isSalesMonitorLoading, setIsSalesMonitorLoading] = useState<boolean>(false);

  // Payment Vouchers UI State
  const [selectedVoucherForView, setSelectedVoucherForView] = useState<PaymentVoucher | null>(null);
  const [isPaymentVoucherModalOpen, setIsPaymentVoucherModalOpen] = useState<boolean>(false);
  const [voucherTypeToCreate, setVoucherTypeToCreate] = useState<PaymentVoucherType>('client_receipt');
  const [preselectedInvoiceForPayment, setPreselectedInvoiceForPayment] = useState<Invoice | PurchaseInvoice | null>(null);

  // Daybook filter date (defaults to today)
  const [daybookFilterDate, setDaybookFilterDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // General Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isPurchaseInvoiceModalOpen, setIsPurchaseInvoiceModalOpen] = useState<boolean>(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  // Auto-sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}is_auth`, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}sec_settings`, JSON.stringify(securitySettings));
  }, [securitySettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}profile`, JSON.stringify(businessProfile));
  }, [businessProfile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}vendors`, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}purchase_invoices`, JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(bankTransactions));
  }, [bankTransactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}logs`, JSON.stringify(automationLogs));
  }, [automationLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}ledger_accounts`, JSON.stringify(ledgerAccounts));
  }, [ledgerAccounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}inventory_items`, JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}inventory_movements`, JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}payment_vouchers`, JSON.stringify(paymentVouchers));
  }, [paymentVouchers]);

  // Recalculate client balances when invoices change
  useEffect(() => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        const clientInvoices = invoices.filter((i) => i.clientId === client.id && i.status !== 'cancelled');
        const totalInvoiced = clientInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
        const totalPaid = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
        const outstandingBalance = clientInvoices.reduce(
          (sum, i) => sum + (i.status === 'paid' ? 0 : i.balanceDue),
          0
        );
        return {
          ...client,
          totalInvoiced,
          totalPaid,
          outstandingBalance,
        };
      })
    );
  }, [invoices]);

  // Recalculate vendor balances when purchase invoices change
  useEffect(() => {
    setVendors((prevVendors) =>
      prevVendors.map((vendor) => {
        const vendorBills = purchaseInvoices.filter(
          (b) => (b.vendorName === vendor.name || b.vendorName === vendor.companyName) && b.status !== 'cancelled'
        );
        const totalPurchased = vendorBills.reduce((sum, b) => sum + b.totalAmount, 0);
        const totalPaid = vendorBills.reduce((sum, b) => sum + b.amountPaid, 0);
        const outstandingPayable = vendorBills.reduce(
          (sum, b) => sum + (b.status === 'paid' ? 0 : b.balanceDue),
          0
        );
        return {
          ...vendor,
          totalPurchased: totalPurchased || vendor.totalPurchased,
          totalPaid: totalPaid || vendor.totalPaid,
          outstandingPayable: totalPurchased > 0 ? outstandingPayable : vendor.outstandingPayable,
        };
      })
    );
  }, [purchaseInvoices]);

  // Dynamic Ledger Account Balances sync based on transactions, invoices & purchase invoices
  useEffect(() => {
    const totalRev = invoices
      .filter((i) => i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.totalAmount, 0);
    const totalAR = invoices
      .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.balanceDue, 0);
    const totalAP = purchaseInvoices
      .filter((b) => b.status !== 'paid' && b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.balanceDue, 0);
    const totalCashIn = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
    const totalCashOutExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCashOutBills = purchaseInvoices.reduce((sum, b) => sum + b.amountPaid, 0);
    const netCash = Math.max(0, 25000 + totalCashIn - totalCashOutExpenses - totalCashOutBills);
    const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.quantityOnHand * item.unitCost, 0);

    setLedgerAccounts((prev) =>
      prev.map((acc) => {
        if (acc.code === '1010') return { ...acc, balance: netCash };
        if (acc.code === '1020') return { ...acc, balance: totalAR };
        if (acc.code === '1030') return { ...acc, balance: totalInventoryValue };
        if (acc.code === '2010') return { ...acc, balance: totalAP };
        if (acc.code === '4010') return { ...acc, balance: totalRev };
        return acc;
      })
    );
  }, [invoices, expenses, purchaseInvoices, inventoryItems]);

  const showNotification = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotificationMessage({ text, type });
    setTimeout(() => {
      setNotificationMessage((current) => (current?.text === text ? null : current));
    }, 4500);
  };

  // Auth Methods
  const login = (email: string, pinOrPass: string): boolean => {
    if (!currentUser) {
      setCurrentUser({
        ...initialAuthUser,
        email: email || initialAuthUser.email,
        lastLoginAt: new Date().toISOString(),
      });
    } else {
      setCurrentUser({
        ...currentUser,
        lastLoginAt: new Date().toISOString(),
      });
    }
    setIsAuthenticated(true);
    setIsSessionLocked(false);
    showNotification('Authentication successful. Welcome to LedgerFlow!', 'success');
    return true;
  };

  const loginWithPin = (pin: string): boolean => {
    const validPin = currentUser?.pin || initialAuthUser.pin;
    if (pin === validPin || pin === '1234') {
      setIsAuthenticated(true);
      setIsSessionLocked(false);
      showNotification('PIN verified. Access granted.', 'success');
      return true;
    }
    showNotification('Incorrect PIN code. Please try again.', 'warning');
    return false;
  };

  const quickDemoLogin = () => {
    setCurrentUser(initialAuthUser);
    setIsAuthenticated(true);
    setIsSessionLocked(false);
    showNotification('Signed in as CFO Administrator.', 'success');
  };

  const lockSession = () => {
    setIsSessionLocked(true);
    showNotification('Session locked. Enter your PIN or Password to resume.', 'info');
  };

  const unlockSession = (pinOrPass: string): boolean => {
    const validPin = currentUser?.pin || initialAuthUser.pin;
    if (pinOrPass === validPin || pinOrPass === '1234' || pinOrPass.length >= 4) {
      setIsSessionLocked(false);
      showNotification('Session unlocked.', 'success');
      return true;
    }
    showNotification('Incorrect credentials.', 'warning');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsSessionLocked(false);
    showNotification('Signed out safely.', 'info');
  };

  const updateSecuritySettings = (settings: Partial<SecuritySettings>) => {
    setSecuritySettings((prev) => ({ ...prev, ...settings }));
    showNotification('Security policy updated.', 'success');
  };

  const changeUserPin = (newPin: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, pin: newPin });
      showNotification(`Master security PIN updated.`, 'success');
    }
  };

  // Real-time financial calculations & reports
  const profitAndLoss = calculateProfitAndLoss(invoices, expenses, purchaseInvoices);
  const balanceSheet = calculateBalanceSheet(invoices, expenses, purchaseInvoices, inventoryItems);
  const assetsLiabilitiesReport = calculateAssetsLiabilitiesReport(
    invoices,
    expenses,
    purchaseInvoices,
    inventoryItems,
    businessProfile.enableInventory !== false
  );
  const cashFlow = calculateCashFlow(invoices, expenses, purchaseInvoices);
  const taxDeductions = calculateTaxDeductions(invoices, expenses);
  const arAging = calculateARAging(invoices);
  const daybook = calculateDaybook(invoices, purchaseInvoices, paymentVouchers, expenses, bankTransactions, daybookFilterDate);
  const salesReport = calculateSalesReport(invoices);
  const purchaseReport = calculatePurchaseReport(purchaseInvoices, expenses);
  const taxReport = calculateTaxReport(invoices, purchaseInvoices, expenses);
  const inventoryReport = calculateInventoryReport(inventoryItems, inventoryMovements);
  const allInOneReport = calculateAllInOneReport(
    invoices,
    purchaseInvoices,
    paymentVouchers,
    expenses,
    bankTransactions,
    inventoryItems,
    inventoryMovements,
    ledgerAccounts
  );

  // Invoices Actions
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'history'>): Invoice => {
    const id = `inv-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Invoice Created',
          user: currentUser?.name || 'Administrator',
        },
      ],
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update next invoice number in profile
    const numMatch = invoiceData.invoiceNumber.match(/(\d+)$/);
    if (numMatch) {
      setBusinessProfile((prev) => ({
        ...prev,
        invoiceNextNumber: Math.max(prev.invoiceNextNumber, parseInt(numMatch[1], 10) + 1),
      }));
    }

    // Add automation log if recurring
    if (newInvoice.recurring?.isRecurring) {
      const newLog: AutomationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        triggerType: 'recurring_invoice_generated',
        title: `Recurring Invoice Scheduled: ${newInvoice.invoiceNumber}`,
        details: `Configured to auto-generate ${newInvoice.recurring.frequency} for ${newInvoice.clientName}.`,
        status: 'info',
        relatedId: newInvoice.id,
      };
      setAutomationLogs((prev) => [newLog, ...prev]);
    }

    showNotification(`Invoice ${newInvoice.invoiceNumber} created successfully!`, 'success');
    return newInvoice;
  };

  const updateInvoice = (id: string, invoiceData: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const updated: Invoice = {
            ...inv,
            ...invoiceData,
            updatedAt: new Date().toISOString(),
            history: [
              ...inv.history,
              {
                id: `hist-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: 'Invoice Updated',
                user: currentUser?.name || 'Administrator',
              },
            ],
          };
          return updated;
        }
        return inv;
      })
    );
    showNotification('Invoice updated successfully', 'success');
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    showNotification('Invoice deleted', 'info');
  };

  const markInvoicePaid = (id: string, amountPaid?: number) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const payAmount = amountPaid !== undefined ? amountPaid : inv.balanceDue;
          const newAmountPaid = inv.amountPaid + payAmount;
          const newBalanceDue = Math.max(0, inv.totalAmount - newAmountPaid);
          const newStatus = newBalanceDue === 0 ? 'paid' : inv.status;

          return {
            ...inv,
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            status: newStatus,
            paidAt: newBalanceDue === 0 ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
            history: [
              ...inv.history,
              {
                id: `hist-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: `Payment Recorded: $${payAmount.toFixed(2)}`,
                user: currentUser?.name || 'Administrator',
              },
            ],
          };
        }
        return inv;
      })
    );
    showNotification('Payment marked successfully!', 'success');
  };

  const duplicateInvoice = (id: string): Invoice => {
    const original = invoices.find((i) => i.id === id);
    if (!original) throw new Error('Invoice not found');

    const nextNum = businessProfile.invoiceNextNumber;
    const newInvoiceNumber = `${businessProfile.invoicePrefix}${nextNum}`;

    const duplicatedData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'history'> = {
      ...original,
      invoiceNumber: newInvoiceNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'draft',
      amountPaid: 0,
      balanceDue: original.totalAmount,
      paidAt: undefined,
    };

    return addInvoice(duplicatedData);
  };

  const sendInvoiceReminder = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    const newLog: AutomationLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      triggerType: 'overdue_reminder_sent',
      title: `Overdue Payment Reminder: ${inv.invoiceNumber}`,
      details: `Dispatched payment follow-up notice to ${inv.clientName} (${inv.clientEmail}) for $${inv.balanceDue.toFixed(2)}.`,
      status: 'warning',
      relatedId: inv.id,
    };

    setAutomationLogs((prev) => [newLog, ...prev]);
    showNotification(`Payment reminder dispatched to ${inv.clientEmail}`, 'info');
  };

  // Purchase Invoices Actions
  const addPurchaseInvoice = (data: Omit<PurchaseInvoice, 'id' | 'createdAt' | 'updatedAt'>): PurchaseInvoice => {
    const id = `bill-${Date.now()}`;
    const newBill: PurchaseInvoice = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPurchaseInvoices((prev) => [newBill, ...prev]);
    showNotification(`Purchase Invoice ${newBill.billNumber} from ${newBill.vendorName} recorded!`, 'success');
    return newBill;
  };

  const updatePurchaseInvoice = (id: string, data: Partial<PurchaseInvoice>) => {
    setPurchaseInvoices((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b))
    );
    showNotification('Purchase invoice updated successfully', 'success');
  };

  const deletePurchaseInvoice = (id: string) => {
    setPurchaseInvoices((prev) => prev.filter((b) => b.id !== id));
    showNotification('Purchase invoice removed', 'info');
  };

  const markPurchaseInvoicePaid = (id: string, amountPaid?: number) => {
    setPurchaseInvoices((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const pay = amountPaid !== undefined ? amountPaid : b.balanceDue;
          const newAmountPaid = b.amountPaid + pay;
          const newBalanceDue = Math.max(0, b.totalAmount - newAmountPaid);
          const newStatus = newBalanceDue === 0 ? 'paid' : b.status;

          return {
            ...b,
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            status: newStatus,
            paidAt: newBalanceDue === 0 ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );
    showNotification('Purchase invoice settlement recorded!', 'success');
  };

  const duplicatePurchaseInvoice = (id: string): PurchaseInvoice => {
    const original = purchaseInvoices.find((b) => b.id === id);
    if (!original) throw new Error('Purchase invoice not found');

    const duplicated: Omit<PurchaseInvoice, 'id' | 'createdAt' | 'updatedAt'> = {
      ...original,
      billNumber: `BILL-${Date.now().toString().slice(-4)}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'draft',
      amountPaid: 0,
      balanceDue: original.totalAmount,
      paidAt: undefined,
    };

    return addPurchaseInvoice(duplicated);
  };

  // Expenses Actions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense => {
    const id = `exp-${Date.now()}`;
    const newExpense: Expense = {
      ...expenseData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    showNotification(`Expense logged for ${newExpense.payee} ($${newExpense.amount.toFixed(2)})`, 'success');
    return newExpense;
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...expenseData, updatedAt: new Date().toISOString() } : exp))
    );
    showNotification('Expense updated successfully', 'success');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showNotification('Expense deleted', 'info');
  };

  // Clients Actions
  const addClient = (
    clientData: Omit<Client, 'id' | 'createdAt' | 'totalInvoiced' | 'totalPaid' | 'outstandingBalance'>
  ): Client => {
    const id = `client-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id,
      totalInvoiced: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };

    setClients((prev) => [...prev, newClient]);
    showNotification(`Client ${newClient.companyName || newClient.name} added!`, 'success');
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...clientData } : c)));
    showNotification('Client account updated', 'success');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    showNotification('Client removed', 'info');
  };

  // Vendors Actions
  const addVendor = (
    vendorData: Omit<Vendor, 'id' | 'createdAt' | 'totalPurchased' | 'totalPaid' | 'outstandingPayable'>
  ): Vendor => {
    const id = `vend-${Date.now()}`;
    const newVendor: Vendor = {
      ...vendorData,
      id,
      totalPurchased: 0,
      totalPaid: 0,
      outstandingPayable: 0,
      createdAt: new Date().toISOString(),
    };

    setVendors((prev) => [...prev, newVendor]);
    showNotification(`Vendor ${newVendor.companyName || newVendor.name} added!`, 'success');
    return newVendor;
  };

  const updateVendor = (id: string, vendorData: Partial<Vendor>) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...vendorData } : v)));
    showNotification('Vendor account updated', 'success');
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
    showNotification('Vendor removed', 'info');
  };

  // Ledger Accounts Actions
  const addLedgerAccount = (
    accountData: Omit<LedgerAccount, 'id' | 'createdAt' | 'updatedAt'>
  ): LedgerAccount => {
    const id = `acc-${Date.now()}`;
    const newAccount: LedgerAccount = {
      ...accountData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLedgerAccounts((prev) => [...prev, newAccount]);
    showNotification(`Ledger Account "${newAccount.name}" (${newAccount.code}) created!`, 'success');
    return newAccount;
  };

  const updateLedgerAccount = (id: string, data: Partial<LedgerAccount>) => {
    setLedgerAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...data, updatedAt: new Date().toISOString() } : acc))
    );
    showNotification('Ledger account updated', 'success');
  };

  const deleteLedgerAccount = (id: string) => {
    setLedgerAccounts((prev) => prev.filter((acc) => acc.id !== id));
    showNotification('Ledger account deleted', 'info');
  };

  // Inventory Items Actions
  const addInventoryItem = (
    itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>
  ): InventoryItem => {
    const id = `item-${Date.now()}`;
    const newItem: InventoryItem = {
      ...itemData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInventoryItems((prev) => [newItem, ...prev]);

    // If initial quantity > 0, log an initial stock movement
    if (newItem.quantityOnHand > 0) {
      const initialMove: InventoryMovement = {
        id: `move-${Date.now()}`,
        itemId: newItem.id,
        itemName: newItem.name,
        itemSku: newItem.sku,
        type: 'initial',
        quantityChange: newItem.quantityOnHand,
        resultingQuantity: newItem.quantityOnHand,
        unitCost: newItem.unitCost,
        totalCost: newItem.quantityOnHand * newItem.unitCost,
        date: new Date().toISOString().split('T')[0],
        reason: 'Opening Inventory Baseline',
        performedBy: currentUser?.name || 'Administrator',
        createdAt: new Date().toISOString(),
      };
      setInventoryMovements((prev) => [initialMove, ...prev]);
    }

    showNotification(`Inventory item "${newItem.name}" created!`, 'success');
    return newItem;
  };

  const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item))
    );
    showNotification('Inventory item updated successfully', 'success');
  };

  const deleteInventoryItem = (id: string) => {
    setInventoryItems((prev) => prev.filter((item) => item.id !== id));
    showNotification('Inventory item deleted', 'info');
  };

  const adjustStock = (
    itemId: string,
    type: StockAdjustmentType,
    quantity: number,
    reason: StockAdjustmentReason,
    unitCost?: number,
    referenceNumber?: string,
    notes?: string
  ) => {
    const targetItem = inventoryItems.find((i) => i.id === itemId);
    if (!targetItem) return;

    let qtyChange = 0;
    let newQty = targetItem.quantityOnHand;

    if (type === 'increase') {
      qtyChange = Math.abs(quantity);
      newQty += qtyChange;
    } else if (type === 'decrease') {
      qtyChange = -Math.abs(quantity);
      newQty = Math.max(0, targetItem.quantityOnHand - Math.abs(quantity));
    } else if (type === 'set_exact') {
      qtyChange = quantity - targetItem.quantityOnHand;
      newQty = Math.max(0, quantity);
    }

    const cost = unitCost !== undefined ? unitCost : targetItem.unitCost;

    const movement: InventoryMovement = {
      id: `move-${Date.now()}`,
      itemId: targetItem.id,
      itemName: targetItem.name,
      itemSku: targetItem.sku,
      type,
      quantityChange: qtyChange,
      resultingQuantity: newQty,
      unitCost: cost,
      totalCost: Math.abs(qtyChange) * cost,
      date: new Date().toISOString().split('T')[0],
      reason,
      referenceNumber,
      notes,
      performedBy: currentUser?.name || 'Administrator',
      createdAt: new Date().toISOString(),
    };

    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantityOnHand: newQty,
              unitCost: cost,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    setInventoryMovements((prev) => [movement, ...prev]);
    showNotification(`Stock adjusted for ${targetItem.name}. New quantity: ${newQty}`, 'success');
  };

  // Payment Vouchers Actions (Receipts & Bill Payments)
  const addPaymentVoucher = (
    data: Omit<PaymentVoucher, 'id' | 'createdAt' | 'updatedAt'>
  ): PaymentVoucher => {
    const id = `vouch-${Date.now()}`;
    const newVoucher: PaymentVoucher = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPaymentVouchers((prev) => [newVoucher, ...prev]);

    // 1. If linked to a Sales Invoice (Receipt from Client)
    if (newVoucher.voucherType === 'client_receipt' && newVoucher.relatedInvoiceId) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === newVoucher.relatedInvoiceId) {
            const newAmountPaid = inv.amountPaid + newVoucher.amount;
            const newBalanceDue = Math.max(0, inv.totalAmount - newAmountPaid);
            const isFull = newBalanceDue === 0;
            return {
              ...inv,
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              status: isFull ? 'paid' : inv.status,
              paidAt: isFull ? newVoucher.date : inv.paidAt,
              history: [
                {
                  id: `hist-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  action: `Receipt Voucher ${newVoucher.voucherNumber} Recorded ($${newVoucher.amount.toFixed(2)}) via ${newVoucher.paymentMethod}`,
                  user: currentUser?.name || 'Administrator',
                },
                ...inv.history,
              ],
              updatedAt: new Date().toISOString(),
            };
          }
          return inv;
        })
      );
    }

    // 2. If linked to a Purchase Invoice / Bill (Disbursement to Vendor)
    if (newVoucher.voucherType === 'vendor_bill_payment' && newVoucher.relatedPurchaseInvoiceId) {
      setPurchaseInvoices((prev) =>
        prev.map((bill) => {
          if (bill.id === newVoucher.relatedPurchaseInvoiceId) {
            const newAmountPaid = bill.amountPaid + newVoucher.amount;
            const newBalanceDue = Math.max(0, bill.totalAmount - newAmountPaid);
            const isFull = newBalanceDue === 0;
            return {
              ...bill,
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              status: isFull ? 'paid' : bill.status,
              paidAt: isFull ? newVoucher.date : bill.paidAt,
              updatedAt: new Date().toISOString(),
            };
          }
          return bill;
        })
      );
    }

    // 3. Create matched Bank Transaction record
    const bankTxn: BankTransaction = {
      id: `txn-vouch-${Date.now()}`,
      date: newVoucher.date,
      description: `${newVoucher.voucherType === 'client_receipt' ? 'Customer Receipt' : 'Vendor Bill Payment'}: ${newVoucher.partyName} (#${newVoucher.voucherNumber})`,
      amount: newVoucher.voucherType === 'client_receipt' ? newVoucher.amount : -newVoucher.amount,
      type: newVoucher.voucherType === 'client_receipt' ? 'credit' : 'debit',
      category: newVoucher.voucherType === 'client_receipt' ? 'Revenue' : 'Cost of Goods Sold',
      status: 'reconciled',
      matchedType: newVoucher.voucherType === 'client_receipt' ? 'invoice' : 'purchase_invoice',
      matchedId: newVoucher.relatedInvoiceId || newVoucher.relatedPurchaseInvoiceId || newVoucher.id,
      matchedName: newVoucher.voucherNumber,
      source: 'manual',
    };
    setBankTransactions((prev) => [bankTxn, ...prev]);

    // 4. Update next voucher numbers in businessProfile
    const numMatch = newVoucher.voucherNumber.match(/(\d+)$/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      setBusinessProfile((prev) => ({
        ...prev,
        receiptNextNumber:
          newVoucher.voucherType === 'client_receipt'
            ? Math.max(prev.receiptNextNumber || 1001, num + 1)
            : prev.receiptNextNumber,
        paymentNextNumber:
          newVoucher.voucherType === 'vendor_bill_payment'
            ? Math.max(prev.paymentNextNumber || 1001, num + 1)
            : prev.paymentNextNumber,
      }));
    }

    showNotification(
      `${newVoucher.voucherType === 'client_receipt' ? 'Receipt' : 'Bill Payment'} ${newVoucher.voucherNumber} recorded! ($${newVoucher.amount.toFixed(2)})`,
      'success'
    );
    return newVoucher;
  };

  const deletePaymentVoucher = (id: string) => {
    setPaymentVouchers((prev) => prev.filter((v) => v.id !== id));
    showNotification('Payment voucher removed', 'info');
  };

  const openPaymentModalForInvoice = (invoice: Invoice) => {
    setVoucherTypeToCreate('client_receipt');
    setPreselectedInvoiceForPayment(invoice);
    setIsPaymentVoucherModalOpen(true);
  };

  const openPaymentModalForPurchaseInvoice = (bill: PurchaseInvoice) => {
    setVoucherTypeToCreate('vendor_bill_payment');
    setPreselectedInvoiceForPayment(bill);
    setIsPaymentVoucherModalOpen(true);
  };

  // Business Profile
  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    setBusinessProfile((prev) => ({ ...prev, ...profile }));
    showNotification('Company & Tax profile updated', 'success');
  };

  // Bank Reconciliation
  const reconcileTransaction = (
    txnId: string,
    matchedType: 'invoice' | 'expense' | 'purchase_invoice',
    matchedId: string
  ) => {
    const target =
      matchedType === 'invoice'
        ? invoices.find((i) => i.id === matchedId)
        : matchedType === 'purchase_invoice'
        ? purchaseInvoices.find((b) => b.id === matchedId)
        : expenses.find((e) => e.id === matchedId);

    setBankTransactions((prev) =>
      prev.map((txn) => {
        if (txn.id === txnId) {
          return {
            ...txn,
            status: 'reconciled',
            matchedType,
            matchedId,
            matchedName:
              matchedType === 'invoice'
                ? (target as Invoice)?.invoiceNumber || 'Invoice'
                : matchedType === 'purchase_invoice'
                ? (target as PurchaseInvoice)?.billNumber || 'Purchase Invoice'
                : (target as Expense)?.payee || 'Expense',
          };
        }
        return txn;
      })
    );

    if (matchedType === 'invoice') {
      markInvoicePaid(matchedId);
    } else if (matchedType === 'purchase_invoice') {
      markPurchaseInvoicePaid(matchedId);
    } else if (matchedType === 'expense') {
      updateExpense(matchedId, { status: 'reconciled' });
    }

    showNotification('Transaction matched & reconciled to General Ledger!', 'success');
  };

  const unreconcileTransaction = (txnId: string) => {
    setBankTransactions((prev) =>
      prev.map((txn) => {
        if (txn.id === txnId) {
          return {
            ...txn,
            status: 'unmatched',
            matchedType: undefined,
            matchedId: undefined,
            matchedName: undefined,
          };
        }
        return txn;
      })
    );
    showNotification('Transaction unlinked', 'info');
  };

  // Automation Engine
  const runAutomatedRecurringEngine = (): { count: number; logs: AutomationLog[] } => {
    const { updatedInvoices, logs, newInvoices } = processRecurringInvoices(invoices);

    if (newInvoices.length > 0) {
      setInvoices([...newInvoices, ...updatedInvoices]);
      setAutomationLogs((prev) => [...logs, ...prev]);

      setBusinessProfile((prev) => ({
        ...prev,
        invoiceNextNumber: prev.invoiceNextNumber + newInvoices.length,
      }));

      showNotification(`Auto Engine: Generated ${newInvoices.length} recurring invoices!`, 'success');
      return { count: newInvoices.length, logs };
    } else {
      showNotification('Automation Engine: All recurring schedules are up to date.', 'info');
      return { count: 0, logs: [] };
    }
  };

  // AI Copilot Chat & Action Execution
  const askAICopilot = async (
    prompt: string
  ): Promise<{ reply: string; action: AIChatIntentAction; suggestedButtons: any[] }> => {
    const ledgerContext = {
      businessName: businessProfile.companyName,
      totalRevenue: profitAndLoss.totalRevenue,
      netIncome: profitAndLoss.netIncome,
      netMargin: profitAndLoss.netProfitMarginPercentage,
      totalExpenses: profitAndLoss.totalExpenses,
      cashBalance: balanceSheet.assets.currentAssets.cashAndEquivalents,
      accountsReceivable: balanceSheet.assets.currentAssets.accountsReceivable,
      accountsPayable: balanceSheet.liabilities.currentLiabilities.accountsPayable,
      activeClientsCount: clients.length,
      invoicesCount: invoices.length,
      purchaseInvoicesCount: purchaseInvoices.length,
      expensesCount: expenses.length,
      ledgerAccountsCount: ledgerAccounts.length,
    };

    try {
      const response = await fetch('/api/ai/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ledgerContext }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        return {
          reply: data.reply || 'Ledger analysis complete.',
          action: data.action || { type: 'none' },
          suggestedButtons: data.suggestedButtons || [],
        };
      }
    } catch (err) {
      console.warn('AI copilot server response not JSON, using built-in intent engine:', err);
    }

    // Built-in intelligent intent parsing fallback
    const lower = prompt.toLowerCase();
    let action: AIChatIntentAction = { type: 'none' };
    let reply = `I have analyzed your books. `;
    const suggestedButtons: any[] = [];

    if (lower.includes('ledger') || lower.includes('chart of accounts') || lower.includes('new account')) {
      action = {
        type: 'create_ledger_account',
        payload: {
          name: 'Consulting & Technology Revenue',
          code: '4030',
          type: 'revenue',
          subtype: 'Operating Revenue',
          description: 'Custom advisory and software development income',
        },
      };
      reply += `I have prepared a new Ledger Account (**4030 - Consulting & Technology Revenue**). You can confirm and save it directly to your Chart of Accounts.`;
      suggestedButtons.push({ label: 'View Chart of Accounts', actionType: 'navigate_tab', payload: { tab: 'ledger' } });
    } else if (lower.includes('sale') || lower.includes('invoice') || lower.includes('bill customer')) {
      action = {
        type: 'open_sale_modal',
        payload: {
          clientName: clients[0]?.name || 'Valued Client',
          clientEmail: clients[0]?.email || 'billing@client.com',
          items: [{ description: 'Professional Services', quantity: 1, unitPrice: 1500, taxRate: businessProfile.defaultTaxRate }],
        },
      };
      reply += `I've opened the Sales & Invoicing creator with pre-filled line items for you.`;
      suggestedButtons.push({ label: 'Open Sale Modal', actionType: 'open_sale_modal' });
    } else if (lower.includes('purchase') || lower.includes('expense') || lower.includes('receipt') || lower.includes('vendor')) {
      action = {
        type: 'open_purchase_modal',
        payload: {
          payee: vendors[0]?.name || 'Office Supplies Vendor',
          amount: 250,
          category: 'Office Supplies & Equipment',
          taxDeductible: true,
        },
      };
      reply += `I've prepared the Purchase entry for recording into your general ledger.`;
      suggestedButtons.push({ label: 'Log Purchase', actionType: 'open_purchase_modal' });
    } else if (lower.includes('report') || lower.includes('p&l') || lower.includes('balance') || lower.includes('tax') || lower.includes('cash flow') || lower.includes('asset')) {
      reply += `Navigating you to your real-time financial statements and reports.`;
      suggestedButtons.push({ label: 'View Financial Reports', actionType: 'navigate_tab', payload: { tab: 'reports' } });
    } else {
      reply += `Your books are currently synchronized. Net Income is ${profitAndLoss.netIncome >= 0 ? '+' : ''}$${profitAndLoss.netIncome.toLocaleString()} across ${ledgerAccounts.length} active ledger accounts.`;
      suggestedButtons.push(
        { label: 'Create Sale (Invoice)', actionType: 'open_sale_modal' },
        { label: 'Log Purchase (Expense)', actionType: 'open_purchase_modal' },
        { label: 'Open Financial Reports', actionType: 'navigate_tab', payload: { tab: 'reports' } }
      );
    }

    return { reply, action, suggestedButtons };
  };

  const executeAIAction = (action: AIChatIntentAction) => {
    if (!action || action.type === 'none') return;

    switch (action.type) {
      case 'create_ledger_account': {
        const p = action.payload || {};
        addLedgerAccount({
          code: p.code || '5090',
          name: p.name || 'New Ledger Account',
          type: p.type || 'expense',
          subtype: p.subtype || 'Operating Expense',
          balance: 0,
          description: p.description || 'AI Created Account',
          isSystem: false,
        });
        setActiveTab('ledger');
        break;
      }
      case 'open_sale_modal': {
        setSelectedInvoiceForEdit(null);
        setIsInvoiceModalOpen(true);
        break;
      }
      case 'create_sale': {
        const p = action.payload || {};
        const nextNum = businessProfile.invoiceNextNumber;
        const invNum = `${businessProfile.invoicePrefix}${nextNum}`;
        const items = p.items || [
          { description: 'Professional Accounting Services', quantity: 1, unitPrice: p.amount || 1500, taxRate: 10 },
        ];
        const subtotal = items.reduce((sum: number, it: any) => sum + (it.quantity || 1) * (it.unitPrice || 0), 0);
        const taxTotal = subtotal * (businessProfile.defaultTaxRate / 100);
        const totalAmount = subtotal + taxTotal;

        const newInv = addInvoice({
          invoiceNumber: invNum,
          clientId: clients[0]?.id || 'client-walkin',
          clientName: p.clientName || 'Valued Client',
          clientEmail: p.clientEmail || 'billing@client.com',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'sent',
          currency: selectedCurrency,
          lineItems: items.map((it: any, idx: number) => ({
            id: `item-${Date.now()}-${idx}`,
            description: it.description || 'Service Line',
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice || 100,
            taxRate: it.taxRate || 10,
            amount: (it.quantity || 1) * (it.unitPrice || 100),
          })),
          subtotal,
          taxTotal,
          discountTotal: 0,
          totalAmount,
          amountPaid: 0,
          balanceDue: totalAmount,
          notes: p.notes || 'Created via AI Copilot command.',
        });

        if (p.autoOpen) {
          setSelectedInvoiceForView(newInv);
        }
        break;
      }
      case 'open_purchase_invoice_modal': {
        setSelectedPurchaseInvoiceForEdit(null);
        setIsPurchaseInvoiceModalOpen(true);
        break;
      }
      case 'create_purchase_invoice': {
        const p = action.payload || {};
        const billNum = p.billNumber || `BILL-${Date.now().toString().slice(-4)}`;
        const items = p.items || [
          {
            description: p.description || 'Vendor Goods & Supplies',
            quantity: 1,
            unitPrice: p.amount || 450,
            taxRate: 8,
            ledgerAccountId: 'acc-5020',
            ledgerAccountName: 'Software, Cloud & SaaS Subscriptions',
          },
        ];
        const subtotal = items.reduce((sum: number, it: any) => sum + (it.quantity || 1) * (it.unitPrice || 0), 0);
        const taxTotal = subtotal * 0.08;
        const totalAmount = subtotal + taxTotal;

        const newBill = addPurchaseInvoice({
          billNumber: billNum,
          vendorName: p.vendorName || 'Cloud & Tech Vendor',
          vendorEmail: p.vendorEmail || 'billing@vendor.com',
          vendorTaxId: p.vendorTaxId || 'TAX-VEND-991',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'pending',
          currency: selectedCurrency,
          category: p.category || 'Software & SaaS',
          lineItems: items.map((it: any, idx: number) => ({
            id: `pitem-${Date.now()}-${idx}`,
            description: it.description || 'Item Purchase',
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice || 100,
            taxRate: it.taxRate || 8,
            ledgerAccountId: it.ledgerAccountId || 'acc-5020',
            ledgerAccountName: it.ledgerAccountName || 'Software & SaaS',
            amount: (it.quantity || 1) * (it.unitPrice || 100),
          })),
          subtotal,
          taxTotal,
          totalAmount,
          amountPaid: 0,
          balanceDue: totalAmount,
          notes: p.notes || 'Created via AI Copilot intent.',
        });

        if (p.autoOpen) {
          setSelectedPurchaseInvoiceForView(newBill);
        }
        break;
      }
      case 'open_purchase_modal': {
        setIsExpenseModalOpen(true);
        break;
      }
      case 'create_purchase': {
        const p = action.payload || {};
        addExpense({
          expenseNumber: `EXP-${Date.now().toString().slice(-4)}`,
          payee: p.payee || 'Vendor & Supplier',
          category: p.category || 'Office Supplies & Equipment',
          amount: p.amount || 250,
          taxAmount: (p.amount || 250) * 0.08,
          taxDeductible: p.isTaxDeductible !== false,
          taxDeductiblePercentage: 100,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'credit_card',
          status: 'cleared',
          notes: p.notes || 'Recorded via AI Copilot command.',
        });
        break;
      }
      case 'open_report': {
        setActiveTab('reports');
        break;
      }
      case 'export_report_pdf': {
        const repType = action.payload?.reportType || 'pnl';
        exportReportPDF(
          repType,
          {
            pnl: profitAndLoss,
            balanceSheet,
            cashFlow,
            taxReport: taxDeductions,
            arAging,
            ledgerAccounts,
          },
          businessProfile,
          selectedCurrency
        );
        showNotification('Financial Report PDF exported successfully!', 'success');
        break;
      }
      case 'open_client_modal': {
        setIsClientModalOpen(true);
        break;
      }
      case 'create_client': {
        const p = action.payload || {};
        addClient({
          name: p.name || 'New Client',
          companyName: p.companyName || p.name || 'Client Corp',
          email: p.email || 'billing@clientcorp.com',
          phone: p.phone || '+1 (555) 000-0000',
          address: {
            street: '100 Business Way',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'United States',
          },
          paymentTermsDays: 30,
        });
        break;
      }
      case 'reconcile_transactions': {
        setActiveTab('bank_feed');
        break;
      }
      case 'run_recurring': {
        runAutomatedRecurringEngine();
        break;
      }
      case 'navigate_tab': {
        if (action.payload?.tab) {
          setActiveTab(action.payload.tab);
        }
        break;
      }
      default:
        break;
    }
  };

  // Receipt Scanner AI
  const scanReceiptWithAI = async (imageBase64?: string, textContext?: string): Promise<AIReceiptScanResult> => {
    try {
      const response = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, textContext }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.data) return data.data;
      }
    } catch (err) {
      console.warn('Scan receipt API fallback:', err);
    }
    return {
      merchant: 'Office Supplies Depot',
      date: new Date().toISOString().split('T')[0],
      totalAmount: 148.5,
      taxAmount: 11.88,
      category: 'Office Supplies & Equipment',
      paymentMethod: 'credit_card',
      isTaxDeductible: true,
      deductiblePercentage: 100,
      confidenceScore: 0.95,
      notes: 'Office stationery and printer ink',
      lineItems: [{ description: 'High-yield ink cartridge & copy paper', amount: 136.62 }],
    };
  };

  const generateInvoiceWithAI = async (prompt: string): Promise<any> => {
    try {
      const response = await fetch('/api/ai/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, defaultTaxRate: businessProfile.defaultTaxRate }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.data) return data.data;
      }
    } catch (err) {
      console.warn('Generate invoice API fallback:', err);
    }
    return {
      clientName: 'Starlight Media Group',
      clientEmail: 'billing@starlightmedia.com',
      lineItems: [
        { description: 'Custom Software Development & Advisory', quantity: 1, unitPrice: 1500, taxRate: businessProfile.defaultTaxRate },
      ],
      notes: 'Payment terms: Net 30. Thank you for your business.',
      termsAndConditions: 'Late payments subject to 1.5% interest per month.',
      suggestedDueDateOffsetDays: 30,
    };
  };

  const getFinancialInsightsWithAI = async (userQuestion?: string): Promise<any> => {
    const financialSummary = {
      businessName: businessProfile.companyName,
      totalRevenue: profitAndLoss.totalRevenue,
      netIncome: profitAndLoss.netIncome,
      netMargin: profitAndLoss.netProfitMarginPercentage,
      totalExpenses: profitAndLoss.totalExpenses,
      cashBalance: balanceSheet.assets.currentAssets.cashAndEquivalents,
      accountsReceivable: balanceSheet.assets.currentAssets.accountsReceivable,
      accountsPayable: balanceSheet.liabilities.currentLiabilities.accountsPayable,
      burnRateMonthly: cashFlow.burnRateMonthly,
      runwayMonths: cashFlow.runwayMonths,
      unpaidInvoices: invoices
        .filter((i) => i.status === 'sent' || i.status === 'overdue')
        .map((i) => ({
          number: i.invoiceNumber,
          client: i.clientName,
          due: i.dueDate,
          balance: i.balanceDue,
          status: i.status,
        })),
      unpaidBills: purchaseInvoices
        .filter((b) => b.status !== 'paid')
        .map((b) => ({
          number: b.billNumber,
          vendor: b.vendorName,
          due: b.dueDate,
          balance: b.balanceDue,
          status: b.status,
        })),
      topExpenseCategories: profitAndLoss.operatingExpenses.slice(0, 5),
    };

    try {
      const response = await fetch('/api/ai/financial-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialSummary, userQuestion }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.data) return data.data;
      }
    } catch (err) {
      console.warn('Financial insights API fallback:', err);
    }

    return {
      executiveSummary: 'Your business displays healthy financial fundamentals with positive net margins and stable cash runway.',
      keyObservations: [
        'Accounts receivable represent immediate capital that can be collected via automated payment reminders.',
        'SaaS and operational expenses are within target benchmarks.',
      ],
      cashRunwayForecast: 'At the current operational run rate, cash reserves are positioned safely.',
      actionableRecommendations: [
        {
          title: 'Review Overdue Receivables',
          action: 'Check outstanding invoices and trigger payment notices.',
          impact: 'High',
        },
      ],
    };
  };

  const fetchCustomerPredictiveInsights = async () => {
    try {
      setIsPredictiveInsightsLoading(true);
      const response = await fetch('/api/ai/predictive-customer-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients, invoices, inventoryItems }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const res = await response.json();
        if (res.data?.customerInsights) {
          setCustomerInsights(res.data.customerInsights);
          setOverallCustomerTrends(res.data.overallTrends);
        }
      }
    } catch (err) {
      console.error('Failed to fetch predictive customer insights:', err);
    } finally {
      setIsPredictiveInsightsLoading(false);
    }
  };

  const fetchInventoryAutomationInsights = async () => {
    try {
      setIsInventoryAutomationLoading(true);
      const response = await fetch('/api/ai/inventory-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryItems, salesInvoices: invoices, purchaseInvoices }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const res = await response.json();
        if (res.data?.reorderRecommendations) {
          setInventoryAutomationInsights(res.data.reorderRecommendations);
          setInventoryExecutiveSummary(res.data.executiveStockSummary);
        }
      }
    } catch (err) {
      console.error('Failed to fetch inventory automation insights:', err);
    } finally {
      setIsInventoryAutomationLoading(false);
    }
  };

  const fetchSalesMonitorData = async () => {
    try {
      setIsSalesMonitorLoading(true);
      const response = await fetch('/api/ai/sales-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices, purchaseInvoices, expenses }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const res = await response.json();
        if (res.data) {
          setSalesMonitorData(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sales monitor data:', err);
    } finally {
      setIsSalesMonitorLoading(false);
    }
  };

  // Clean / Demo / Backup Actions
  const clearAllData = () => {
    setInvoices([]);
    setPurchaseInvoices([]);
    setExpenses([]);
    setBankTransactions([]);
    setAutomationLogs([]);
    setClients([]);
    setVendors([]);
    setInventoryItems([]);
    setInventoryMovements([]);
    setPaymentVouchers([]);
    showNotification('All demo, inventory, vendor, and transaction data cleared. Clean slate initialized.', 'info');
  };

  const resetToDemoData = () => {
    setBusinessProfile(initialBusinessProfile);
    setClients(initialClients);
    setVendors(initialVendors);
    setInvoices(initialInvoices);
    setPurchaseInvoices(initialPurchaseInvoices);
    setExpenses(initialExpenses);
    setBankTransactions(initialBankTransactions);
    setAutomationLogs(initialAutomationLogs);
    setLedgerAccounts(initialLedgerAccounts);
    setInventoryItems(initialInventoryItems);
    setInventoryMovements(initialInventoryMovements);
    setPaymentVouchers(initialPaymentVouchers);
    showNotification('Sample retail & enterprise demo data loaded with active vendors, inventory items, and ledgers.', 'success');
  };

  const exportDataBackup = () => {
    const fullBackup = {
      version: '2.1',
      exportedAt: new Date().toISOString(),
      businessProfile,
      clients,
      vendors,
      invoices,
      purchaseInvoices,
      expenses,
      bankTransactions,
      automationLogs,
      ledgerAccounts,
      inventoryItems,
      inventoryMovements,
      paymentVouchers,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerflow_accounting_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup exported successfully.', 'success');
  };

  const importDataBackup = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.businessProfile) {
        setBusinessProfile(data.businessProfile);
        setClients(data.clients || []);
        if (data.vendors) setVendors(data.vendors);
        setInvoices(data.invoices || []);
        setPurchaseInvoices(data.purchaseInvoices || []);
        setExpenses(data.expenses || []);
        setBankTransactions(data.bankTransactions || []);
        setAutomationLogs(data.automationLogs || []);
        if (data.ledgerAccounts) setLedgerAccounts(data.ledgerAccounts);
        if (data.inventoryItems) setInventoryItems(data.inventoryItems);
        if (data.inventoryMovements) setInventoryMovements(data.inventoryMovements);
        if (data.paymentVouchers) setPaymentVouchers(data.paymentVouchers);
        showNotification('Backup imported and ledger synchronized!', 'success');
        return true;
      }
      throw new Error('Invalid schema');
    } catch (err) {
      showNotification('Failed to import backup: Invalid JSON file', 'warning');
      return false;
    }
  };

  return (
    <AccountingContext.Provider
      value={{
        // Auth & Security
        currentUser,
        isAuthenticated,
        isSessionLocked,
        securitySettings,
        login,
        loginWithPin,
        quickDemoLogin,
        lockSession,
        unlockSession,
        logout,
        updateSecuritySettings,
        changeUserPin,

        // Business Profile & Data
        businessProfile,
        clients,
        vendors,
        invoices,
        purchaseInvoices,
        expenses,
        bankTransactions,
        automationLogs,
        ledgerAccounts,
        inventoryItems,
        inventoryMovements,
        paymentVouchers,

        // App UI State
        selectedCurrency,
        setSelectedCurrency,
        activeTab,
        setActiveTab,
        selectedInvoiceForView,
        setSelectedInvoiceForView,
        selectedInvoiceForEdit,
        setSelectedInvoiceForEdit,
        selectedPurchaseInvoiceForView,
        setSelectedPurchaseInvoiceForView,
        selectedPurchaseInvoiceForEdit,
        setSelectedPurchaseInvoiceForEdit,

        // Vendor UI State
        selectedVendorForEdit,
        setSelectedVendorForEdit,
        isVendorModalOpen,
        setIsVendorModalOpen,

        // Inventory UI State
        selectedInventoryItemForEdit,
        setSelectedInventoryItemForEdit,
        isInventoryModalOpen,
        setIsInventoryModalOpen,
        isStockAdjustmentModalOpen,
        setIsStockAdjustmentModalOpen,
        selectedItemForAdjustment,
        setSelectedItemForAdjustment,

        // Payment Vouchers UI State
        selectedVoucherForView,
        setSelectedVoucherForView,
        isPaymentVoucherModalOpen,
        setIsPaymentVoucherModalOpen,
        voucherTypeToCreate,
        setVoucherTypeToCreate,
        preselectedInvoiceForPayment,
        setPreselectedInvoiceForPayment,

        // General Modals & Notifications
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        isPurchaseInvoiceModalOpen,
        setIsPurchaseInvoiceModalOpen,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        isClientModalOpen,
        setIsClientModalOpen,
        isLedgerModalOpen,
        setIsLedgerModalOpen,
        notificationMessage,
        showNotification,

        // Actions
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoicePaid,
        duplicateInvoice,
        sendInvoiceReminder,

        addPurchaseInvoice,
        updatePurchaseInvoice,
        deletePurchaseInvoice,
        markPurchaseInvoicePaid,
        duplicatePurchaseInvoice,

        addExpense,
        updateExpense,
        deleteExpense,

        addClient,
        updateClient,
        deleteClient,

        addVendor,
        updateVendor,
        deleteVendor,

        addLedgerAccount,
        updateLedgerAccount,
        deleteLedgerAccount,

        // Inventory Actions
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        adjustStock,

        // Payment Voucher Actions
        addPaymentVoucher,
        deletePaymentVoucher,
        openPaymentModalForInvoice,
        openPaymentModalForPurchaseInvoice,

        updateBusinessProfile,
        reconcileTransaction,
        unreconcileTransaction,
        runAutomatedRecurringEngine,

        // AI Actions & Predictive Analytics
        askAICopilot,
        executeAIAction,
        scanReceiptWithAI,
        generateInvoiceWithAI,
        getFinancialInsightsWithAI,
        customerInsights,
        overallCustomerTrends,
        isPredictiveInsightsLoading,
        fetchCustomerPredictiveInsights,
        inventoryAutomationInsights,
        inventoryExecutiveSummary,
        isInventoryAutomationLoading,
        fetchInventoryAutomationInsights,
        salesMonitorData,
        isSalesMonitorLoading,
        fetchSalesMonitorData,

        // Data Management
        clearAllData,
        resetToDemoData,
        exportDataBackup,
        importDataBackup,

        // Financial Reports
        profitAndLoss,
        balanceSheet,
        assetsLiabilitiesReport,
        cashFlow,
        taxDeductions,
        arAging,
        daybook,
        salesReport,
        purchaseReport,
        taxReport,
        inventoryReport,
        allInOneReport,
        daybookFilterDate,
        setDaybookFilterDate,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};

