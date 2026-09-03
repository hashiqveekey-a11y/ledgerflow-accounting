export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number;
}

export type BusinessType = 'retail_shop' | 'wholesale' | 'service_business' | 'manufacturing' | 'general';

export interface BusinessProfile {
  companyName: string;
  tradingName: string;
  email: string;
  phone: string;
  website: string;
  taxNumber: string; // e.g. EIN, VAT, GST
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  defaultCurrency: CurrencyCode;
  defaultTaxRate: number; // e.g. 10 for 10%
  fiscalYearStartMonth: number; // 1 = January
  paymentInstructions: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingOrIban: string;
    swiftBic?: string;
  };
  invoicePrefix: string;
  invoiceNextNumber: number;
  billPrefix?: string;
  billNextNumber?: number;
  receiptPrefix?: string;
  receiptNextNumber?: number;
  paymentPrefix?: string;
  paymentNextNumber?: number;
  // Retail & Inventory Options
  enableInventory?: boolean; // Toggle inventory on/off (optional for service businesses)
  businessType?: BusinessType;
  enableAIAutomation?: boolean;
  enablePredictiveAnalytics?: boolean;
}

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  taxId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentTermsDays: number; // e.g. 15, 30, 60
  notes?: string;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  taxId?: string;
  category?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentTermsDays: number; // e.g. 15, 30, 60
  leadTimeDays?: number;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  notes?: string;
  rating?: number; // 1-5 rating
  totalPurchased: number;
  totalPaid: number;
  outstandingPayable: number;
  createdAt: string;
}

export interface CustomerPredictiveInsight {
  clientId: string;
  clientName: string;
  segment: 'Champion' | 'Loyal Retail Shopper' | 'Potential Loyalist' | 'At Risk' | 'Dormant' | 'New Buyer';
  averageOrderValue: number;
  purchaseFrequencyDays: number;
  totalOrdersCount: number;
  totalSpent: number;
  lastPurchaseDate: string;
  predictedNextPurchaseWindow: string;
  churnRiskPercent: number;
  churnRiskLevel: 'Low' | 'Medium' | 'High';
  recommendedProducts: string[];
  actionableCampaign: string;
  lifetimeValueProjection: number;
}

export interface InventoryAutomationInsight {
  sku: string;
  itemName: string;
  currentStock: number;
  reorderLevel: number;
  daysUntilStockout: number;
  recommendedReorderQty: number;
  recommendedSupplier?: string;
  estimatedReorderCost: number;
  demandTrend: 'increasing' | 'stable' | 'decreasing';
  urgency: 'critical' | 'warning' | 'optimal';
  automatedActionSummary: string;
}

export interface AssetsLiabilitiesReport {
  asOfDate: string;
  currentAssets: {
    cashAndCashEquivalents: number;
    accountsReceivable: number;
    inventoryValuation: number;
    prepaidExpensesAndOther: number;
    totalCurrentAssets: number;
  };
  nonCurrentAssets: {
    propertyPlantEquipment: number;
    computerHardwareAndElectronics: number;
    furnitureAndFixtures: number;
    accumulatedDepreciation: number;
    intangibleAssets: number;
    totalNonCurrentAssets: number;
  };
  totalAssets: number;
  currentLiabilities: {
    accountsPayable: number;
    accruedExpenses: number;
    shortTermSalesTaxPayable: number;
    customerDepositsAndAdvances: number;
    totalCurrentLiabilities: number;
  };
  longTermLiabilities: {
    bankNotesAndLoansPayable: number;
    deferredTaxLiabilities: number;
    totalLongTermLiabilities: number;
  };
  totalLiabilities: number;
  equity: {
    ownersCapital: number;
    retainedEarnings: number;
    currentPeriodNetIncome: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  financialRatios: {
    workingCapital: number;
    currentRatio: number;
    quickRatio: number;
    debtToEquityRatio: number;
    solvencyRatio: number;
  };
  // Convenience & UI projection properties
  netWorth?: number;
  workingCapital?: number;
  currentRatio?: number;
  assets?: {
    cashAndEquivalents: number;
    accountsReceivable: number;
    inventoryValue: number;
    otherCurrentAssets: number;
    currentAssetsTotal: number;
    fixedAssets: number;
    totalAssets: number;
  };
  liabilities?: {
    accountsPayable: number;
    salesTaxPayable: number;
    accruedExpenses: number;
    shortTermLoans: number;
    currentLiabilitiesTotal: number;
    longTermLiabilities: number;
    totalLiabilities: number;
  };
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 10 for 10%
  discountPercent?: number;
  inventoryItemId?: string;
  amount: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PurchaseInvoiceStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled';
export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';

export interface PurchaseLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  inventoryItemId?: string;
  ledgerAccountId?: string;
  ledgerAccountName?: string;
  amount: number;
}

export interface PurchaseInvoice {
  id: string;
  billNumber: string;
  vendorName: string;
  vendorEmail?: string;
  vendorTaxId?: string;
  vendorAddress?: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: PurchaseInvoiceStatus;
  currency: CurrencyCode;
  lineItems: PurchaseLineItem[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  category: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  notes?: string;
  attachmentFileName?: string;
  attachmentUrl?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecurringConfig {
  isRecurring: boolean;
  frequency: RecurringFrequency;
  nextRunDate: string;
  autoSend: boolean;
  active: boolean;
  occurrencesRemaining?: number;
  lastGeneratedDate?: string;
}

export interface InvoiceHistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  note?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientAddress?: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  currency: CurrencyCode;
  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  termsAndConditions?: string;
  recurring?: InvoiceRecurringConfig;
  history: InvoiceHistoryEntry[];
  pdfGenerated?: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Software & SaaS'
  | 'Office Supplies & Equipment'
  | 'Travel & Meals'
  | 'Advertising & Marketing'
  | 'Contractor & Payroll'
  | 'Utilities & Internet'
  | 'Rent & Facilities'
  | 'Legal & Professional'
  | 'Banking & Payment Fees'
  | 'Insurance'
  | 'Research & Development'
  | 'Other Expenses';

export type PaymentMethod =
  | 'credit_card'
  | 'bank_transfer'
  | 'cash'
  | 'debit_card'
  | 'paypal'
  | 'check'
  | 'stripe'
  | 'other';

export interface Expense {
  id: string;
  expenseNumber: string;
  payee: string;
  category: ExpenseCategory;
  amount: number;
  taxAmount: number;
  taxDeductible: boolean;
  taxDeductiblePercentage: number; // e.g. 100 for 100%, 50 for meals
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  status: 'cleared' | 'pending' | 'reconciled';
  notes?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  extractedFromReceipt?: boolean;
  items?: { name: string; price: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive for deposit/credit, negative for withdrawal/debit
  type: 'credit' | 'debit';
  accountName?: string;
  category?: string;
  source?: string;
  status: 'unmatched' | 'matched' | 'reconciled';
  matchedType?: 'invoice' | 'expense' | 'purchase_invoice' | 'payment_voucher';
  matchedId?: string;
  matchedName?: string;
}

export interface FinancialMetricCard {
  label: string;
  value: number;
  currency: CurrencyCode;
  changePercentage: number;
  trend: 'up' | 'down' | 'neutral';
  timeframe: string;
  status?: 'positive' | 'negative' | 'warning' | 'neutral';
}

export interface ProfitAndLossReport {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  revenueByClient: { clientName: string; amount: number; percentage: number }[];
  cogs: number;
  grossProfit: number;
  grossMarginPercentage: number;
  operatingExpenses: {
    category: ExpenseCategory;
    amount: number;
    percentageOfTotal: number;
  }[];
  totalExpenses: number;
  ebitda: number;
  estimatedTaxProvision: number;
  netIncome: number;
  netProfitMarginPercentage: number;
  costOfGoodsSold?: number;
  operatingIncome?: number;
}

export interface BalanceSheetReport {
  asOfDate: string;
  assets: {
    currentAssets: {
      cashAndEquivalents: number;
      accountsReceivable: number;
      inventoryValuation: number;
      inventoryAssets: number;
      prepaidExpenses: number;
      totalCurrentAssets: number;
    };
    fixedAssets: {
      equipmentAndHardware: number;
      accumulatedDepreciation: number;
      totalFixedAssets: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: number;
      salesTaxPayable: number;
      accruedExpenses: number;
      totalCurrentLiabilities: number;
    };
    longTermLiabilities: {
      businessLoans: number;
      totalLongTermLiabilities: number;
    };
    totalLiabilities: number;
  };
  equity: {
    retainedEarnings: number;
    currentYearEarnings: number;
    ownerCapital: number;
    totalEquity: number;
  };
  isBalanced: boolean;
  balanceCheckDifference: number;
}

export interface CashFlowReport {
  period: string;
  beginningCash: number;
  operatingCashFlow: {
    netIncome: number;
    arChange: number;
    apChange: number;
    netOperatingCash: number;
  };
  investingCashFlow: {
    equipmentPurchases: number;
    netInvestingCash: number;
  };
  financingCashFlow: {
    ownerContributions: number;
    loanPayments: number;
    netFinancingCash: number;
  };
  netCashIncrease: number;
  endingCash: number;
  burnRateMonthly: number;
  runwayMonths: number;
  // Convenience & UI projection properties
  operatingActivities?: {
    netOperatingCash: number;
    netCashFromOperations: number;
  };
  netChangeInCash?: number;
  cashAtEndOfPeriod?: number;
}

export interface TaxDeductionSummary {
  taxYear: number;
  totalIncome: number;
  taxableIncome: number;
  salesTaxCollected: number;
  salesTaxPaidOnExpenses: number;
  netSalesTaxOwed: number;
  totalExpenses: number;
  totalDeductibleExpenses: number;
  categoryDeductions: {
    category: ExpenseCategory;
    totalAmount: number;
    deductibleAmount: number;
  }[];
  estimatedTaxLiability: number; // based on standard bracket estimate
}

export interface ARAgingBucket {
  period: 'Current (0-30 days)' | '31-60 days' | '61-90 days' | '90+ days Overdue';
  amount: number;
  count: number;
  invoices: {
    id: string;
    invoiceNumber: string;
    clientName: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
  }[];
}

export interface AIChatIntentAction {
  type:
    | 'create_ledger_account'
    | 'open_sale_modal'
    | 'create_sale'
    | 'open_purchase_modal'
    | 'create_purchase'
    | 'open_purchase_invoice_modal'
    | 'create_purchase_invoice'
    | 'open_report'
    | 'export_report_pdf'
    | 'open_client_modal'
    | 'create_client'
    | 'open_vendor_modal'
    | 'create_vendor'
    | 'open_inventory_modal'
    | 'create_inventory_item'
    | 'open_stock_adjustment'
    | 'open_voucher_modal'
    | 'open_receipt_scanner'
    | 'scan_receipt'
    | 'open_copilot'
    | 'open_voice_commander'
    | 'close_modals'
    | 'reconcile_transactions'
    | 'run_recurring'
    | 'navigate_tab'
    | 'none';
  payload?: any;
  summary?: string;
}

export type LedgerAccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface LedgerAccount {
  id: string;
  code: string; // e.g., '1010', '2010', '4010', '5010'
  name: string;
  type: LedgerAccountType;
  subtype: string; // e.g. 'Current Asset', 'Fixed Asset', 'Operating Expense', 'Operating Revenue'
  balance: number;
  description?: string;
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'CFO / Administrator' | 'Lead Accountant' | 'Financial Analyst' | 'Auditor';
  pin: string; // e.g. '1234'
  avatar?: string;
  lastLoginAt: string;
}

export interface SecuritySettings {
  autoLockMinutes: number; // 0 = never, 5, 15, 30, 60
  sessionExpiryHours: number;
  requirePinOnWake: boolean;
  biometricsEnabled: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: AIChatIntentAction;
  suggestedButtons?: {
    label: string;
    actionType: string;
    payload?: any;
  }[];
}

export interface AIReceiptScanResult {
  merchant: string;
  date: string;
  totalAmount: number;
  taxAmount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  lineItems: { description: string; amount: number }[];
  isTaxDeductible: boolean;
  deductiblePercentage: number;
  confidenceScore: number;
  notes: string;
}

export type CameraScanMode = 'sales' | 'purchase';

export interface ScannedSalesDocument {
  documentType: 'sales';
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientAddress?: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    amount: number;
  }[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  notes?: string;
  confidenceScore: number;
}

export interface ScannedPurchaseDocument {
  documentType: 'purchase';
  vendorName: string;
  vendorEmail?: string;
  vendorTaxId?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  billNumber?: string;
  issueDate: string;
  dueDate: string;
  category: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    amount: number;
    ledgerAccountName?: string;
  }[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
  confidenceScore: number;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  triggerType: 'recurring_invoice_generated' | 'overdue_reminder_sent' | 'bank_sync' | 'tax_calculation';
  title: string;
  details: string;
  status: 'success' | 'warning' | 'info';
  relatedId?: string;
}

// ----------------------------------------------------
// INVENTORY & PRODUCT MANAGEMENT
// ----------------------------------------------------
export type InventoryCategory =
  | 'Products & Merchandise'
  | 'Electronics & Hardware'
  | 'Raw Materials & Parts'
  | 'Office Supplies & Consumables'
  | 'Services & Subscriptions'
  | 'Digital Goods'
  | 'Packaging & Shipping'
  | 'Other';

export type InventoryUnit = 'pcs' | 'units' | 'box' | 'pack' | 'kg' | 'lbs' | 'hrs' | 'set' | 'license';

export interface InventoryItem {
  id: string;
  sku: string; // e.g., 'PRD-1001'
  name: string;
  description?: string;
  category: InventoryCategory | string;
  unit: InventoryUnit | string;
  purchasePrice: number; // Cost Price / COGS
  unitCost: number; // Cost alias
  sellingPrice: number; // Retail / Sale Price
  stockOnHand: number;
  quantityOnHand: number; // Qty alias
  minStockLevel: number; // Reorder threshold alert
  reorderLevel: number; // Reorder threshold alias
  taxRate: number; // e.g. 10 for 10%
  barcode?: string;
  location?: string; // Warehouse / Bin / Shelf
  supplier?: string;
  ledgerAccountId?: string; // e.g., 1030 Merchandise Inventory
  createdAt: string;
  updatedAt: string;
}

export type StockAdjustmentType = 'in' | 'out' | 'adjustment' | 'increase' | 'decrease' | 'set_exact' | 'initial';
export type StockAdjustmentReason =
  | 'purchase_bill'
  | 'sales_invoice'
  | 'damaged_or_expired'
  | 'returned_goods'
  | 'manual_count_reconciliation'
  | 'initial_stock'
  | 'internal_use'
  | string;

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  sku?: string;
  itemSku?: string;
  type: StockAdjustmentType;
  reason: StockAdjustmentReason;
  quantity?: number; // positive number
  quantityChange?: number; // relative change (+/-)
  resultingQuantity?: number; // balance after movement
  previousStock?: number;
  newStock?: number;
  unitCost: number;
  totalValue?: number;
  totalCost?: number;
  referenceNumber?: string; // e.g. INV-1001, BILL-5001, ADJ-901
  notes?: string;
  date: string; // YYYY-MM-DD
  timestamp?: string;
  performedBy?: string;
  createdAt?: string;
}

// ----------------------------------------------------
// BILL PAYMENTS & CLIENT PAYMENT RECEIPTS
// ----------------------------------------------------
export type PaymentVoucherType = 'client_receipt' | 'vendor_bill_payment' | 'receipt' | 'payment';

export interface PaymentVoucher {
  id: string;
  voucherNumber: string; // e.g., RCT-2026-1001 or PMT-2026-5001
  type: PaymentVoucherType;
  voucherType?: 'receipt' | 'payment' | 'client_receipt' | 'vendor_bill_payment';
  partyId?: string;
  partyName: string; // Client name (for receipts) or Vendor name (for bill payments)
  payerOrPayee?: string;
  partyEmail?: string;
  partyTaxId?: string;
  partyAddress?: string;
  date: string; // YYYY-MM-DD
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethod;
  referenceNumber?: string; // Cheque #, Wire ref, Stripe txn id
  bankAccountId?: string;
  bankAccountName: string; // e.g., 'Operating Checking Account (1010)'
  allocatedInvoiceId?: string; // Linked Sales Invoice or Purchase Invoice ID
  allocatedInvoiceNumber?: string;
  relatedInvoiceId?: string;
  relatedPurchaseInvoiceId?: string;
  relatedInvoiceNumber?: string;
  invoiceTotal?: number;
  invoiceRemainingBalance?: number;
  notes?: string;
  memo?: string;
  receivedOrPaidBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// DAYBOOK & COMPREHENSIVE REPORTS DATA
// ----------------------------------------------------
export type DaybookEntryType =
  | 'sale_invoice'
  | 'purchase_invoice'
  | 'client_receipt'
  | 'bill_payment'
  | 'expense'
  | 'bank_transaction';

export interface DaybookEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  type: DaybookEntryType;
  referenceNumber: string; // INV-1001, BILL-5001, RCT-101, PMT-201, EXP-301
  partyName: string;
  account: string; // Ledger / Category account
  description: string;
  debit: number; // Cash / Asset Inflow or Expense
  credit: number; // Cash / Asset Outflow or Liability
  netEffect: number; // positive = net cash inflow, negative = outflow
  sourceId: string;
  sourceType: 'invoice' | 'purchase_invoice' | 'payment_voucher' | 'expense' | 'bank_transaction';
  // Convenience & projection properties
  accountOrEntity?: string;
  status?: string;
}

export interface DaybookSummary {
  date: string;
  totalDebits: number;
  totalCredits: number;
  netDayBalance: number;
  entryCount: number;
  entries: DaybookEntry[];
  totalDebit?: number;
  totalCredit?: number;
}

export interface SalesReportSummary {
  period: string;
  totalSales: number;
  totalCollected: number;
  totalOutstandingAR: number;
  totalTaxCollected: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  overdueInvoiceCount: number;
  averageInvoiceValue: number;
  totalInvoices?: number;
  paidSales?: number;
  unpaidSales?: number;
  byClient: {
    clientName: string;
    invoiceCount: number;
    totalAmount: number;
    amountPaid: number;
    outstanding: number;
    percentage: number;
    totalInvoiced?: number;
    balanceDue?: number;
  }[];
  byMonth: {
    month: string;
    salesAmount: number;
    collectedAmount: number;
    taxAmount: number;
  }[];
  byItem: {
    itemName: string;
    quantitySold: number;
    totalRevenue: number;
    averagePrice: number;
  }[];
}

export interface PurchaseReportSummary {
  period: string;
  totalPurchases: number;
  totalPaid: number;
  totalOutstandingAP: number;
  totalInputTax: number;
  billCount: number;
  paidBillCount: number;
  overdueBillCount: number;
  averageBillValue: number;
  totalBills?: number;
  paidPurchases?: number;
  unpaidPurchases?: number;
  totalTaxPaid?: number;
  byVendor: {
    vendorName: string;
    billCount: number;
    totalAmount: number;
    amountPaid: number;
    balanceDue: number;
    percentage: number;
    totalBilled?: number;
  }[];
  byCategory: {
    category: ExpenseCategory;
    totalAmount: number;
    taxAmount: number;
    percentage: number;
  }[];
  byMonth: {
    month: string;
    purchaseAmount: number;
    paidAmount: number;
    taxAmount: number;
  }[];
}

export interface TaxReportSummary {
  taxYear: number;
  taxPeriod: string;
  salesTaxCollected: number; // Output VAT/GST
  taxableSalesBase: number;
  taxPaidOnPurchases: number; // Input Tax on Bills
  taxPaidOnExpenses: number; // Input Tax on Expenses
  totalInputTaxCredit: number; // Total ITC
  netTaxPayableOrRefund: number; // Output Tax - Input Tax (positive = payable, negative = refund)
  effectiveTaxRatePercentage: number;
  totalOutputTax?: number;
  totalInputTax?: number;
  netTaxLiability?: number;
  totalDeductibleExpenses?: number;
  estimatedTaxableIncome?: number;
  breakdownByRate: {
    ratePercent: number;
    salesBase: number;
    outputTax: number;
    purchaseBase: number;
    inputTax: number;
    netTax: number;
  }[];
  deductibleExpenseSchedule: {
    category: ExpenseCategory;
    grossAmount: number;
    deductiblePercentage: number;
    deductibleAmount: number;
  }[];
  deductionsByCategory?: {
    category: ExpenseCategory;
    amount: number;
    grossAmount: number;
    deductiblePercentage: number;
  }[];
}

export interface InventoryReportSummary {
  asOfDate: string;
  totalSkus: number;
  totalStockUnits: number;
  totalValuationCost: number; // stockOnHand * purchasePrice
  totalPotentialRetailValue: number; // stockOnHand * sellingPrice
  totalUnrealizedGrossProfit: number;
  overallAverageGrossMarginPercent: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  totalInventoryValue?: number;
  totalUnitsOnHand?: number;
  potentialRetailValue?: number;
  potentialGrossMargin?: number;
  lowStockItemCount?: number;
  categoryValuation: {
    category: InventoryCategory;
    itemCount: number;
    totalUnits: number;
    valuation: number;
    percentageOfTotal: number;
  }[];
  lowStockAlerts: InventoryItem[];
  itemsList: (InventoryItem & { totalValue: number; potentialRevenue: number; profitMarginPercent: number })[];
}

export interface AllInOneReportSummary {
  asOfDate: string;
  period: string;
  executiveKPIs: {
    totalRevenue: number;
    totalPurchasesAndCOGS: number;
    grossProfit: number;
    grossMarginPercent: number;
    totalOperatingExpenses: number;
    netIncome: number;
    netProfitMarginPercent: number;
    cashAndBank: number;
    accountsReceivable: number;
    accountsPayable: number;
    inventoryValuation: number;
    netTaxPayable: number;
    workingCapital: number;
    currentRatio: number;
    runwayMonths: number;
  };
  pnl: ProfitAndLossReport;
  balanceSheet: BalanceSheetReport;
  cashFlow: CashFlowReport;
  salesReport: SalesReportSummary;
  purchaseReport: PurchaseReportSummary;
  taxReport: TaxReportSummary;
  inventoryReport: InventoryReportSummary;
  daybookSnapshot: DaybookSummary;
  // Convenience aliases
  sales?: any;
  purchases?: any;
  tax?: any;
  inventory?: any;
  daybook?: any;
}

export type TabType =
  | 'dashboard'
  | 'invoices'
  | 'purchase_invoices'
  | 'vouchers'
  | 'inventory'
  | 'expenses'
  | 'ledger'
  | 'reports'
  | 'bank_feed'
  | 'clients'
  | 'vendors'
  | 'ai_insights'
  | 'settings';

