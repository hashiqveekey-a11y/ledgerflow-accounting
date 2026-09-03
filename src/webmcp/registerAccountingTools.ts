import { webmcpEngine } from './webmcpEngine';
import { WebMCPTool, WebMCPResource, WebMCPPrompt } from './types';
import { LineItem, PurchaseLineItem } from '../types';

/**
 * Registers application-specific accounting tools, resources, and prompts
 * into the WebMCP engine, binding directly to the React context methods and state.
 */
export function registerAccountingWebMCP(context: {
  businessProfile: any;
  invoices: any[];
  purchaseInvoices: any[];
  expenses: any[];
  clients: any[];
  vendors: any[];
  ledgerAccounts: any[];
  bankTransactions: any[];
  customerInsights: any[];
  addInvoice: (inv: any) => void;
  addPurchaseInvoice: (bill: any) => void;
  openCameraScanner: (mode: 'sales' | 'purchase') => void;
  runAutomatedRecurringEngine: () => void;
  showNotification: (text: string, type?: 'success' | 'info' | 'warning') => void;
  selectedCurrency: string;
}) {
  const {
    businessProfile,
    invoices,
    purchaseInvoices,
    expenses,
    clients,
    vendors,
    ledgerAccounts,
    bankTransactions,
    customerInsights,
    addInvoice,
    addPurchaseInvoice,
    openCameraScanner,
    runAutomatedRecurringEngine,
    showNotification,
    selectedCurrency,
  } = context;

  // 1. Tool: create_sales_invoice
  const createSalesInvoiceTool: WebMCPTool = {
    name: 'create_sales_invoice',
    description:
      'Creates a new customer sales invoice in the accounting system with line items, tax, and terms.',
    category: 'sales',
    inputSchema: {
      type: 'object',
      properties: {
        clientName: {
          type: 'string',
          description: 'The name of the customer or business client',
        },
        clientEmail: {
          type: 'string',
          description: 'Client billing email address',
        },
        dueDate: {
          type: 'string',
          description: 'Invoice due date in YYYY-MM-DD format',
        },
        notes: {
          type: 'string',
          description: 'Payment terms or remarks',
        },
        items: {
          type: 'array',
          description: 'List of invoice line items',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
              taxRate: { type: 'number' },
            },
            required: ['description', 'quantity', 'unitPrice'],
          },
        },
      },
      required: ['clientName', 'items'],
    },
    execute: async (args: any) => {
      const itemsList: LineItem[] = (args.items || []).map((it: any, idx: number) => {
        const qty = Number(it.quantity) || 1;
        const rate = Number(it.unitPrice) || 0;
        const taxRate = it.taxRate !== undefined ? Number(it.taxRate) : businessProfile.defaultTaxRate || 8.5;
        return {
          id: `li-mcp-${Date.now()}-${idx}`,
          description: it.description || 'Service/Product',
          quantity: qty,
          unitPrice: rate,
          taxRate,
          discountPercent: 0,
          amount: qty * rate,
        };
      });

      const subtotal = itemsList.reduce((s, it) => s + it.amount, 0);
      const taxTotal = itemsList.reduce((s, it) => s + (it.amount * (it.taxRate || 0)) / 100, 0);
      const totalAmount = subtotal + taxTotal;

      const issueDate = new Date().toISOString().split('T')[0];
      const dueDate =
        args.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

      const invNum = `${businessProfile.invoicePrefix}${businessProfile.invoiceNextNumber}`;

      const newInv = {
        invoiceNumber: invNum,
        clientId: 'client-mcp',
        clientName: args.clientName,
        clientCompany: args.clientName,
        clientEmail: args.clientEmail || `billing@${args.clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        clientAddress: 'Client Headquarters',
        issueDate,
        dueDate,
        status: 'sent',
        currency: selectedCurrency || businessProfile.defaultCurrency,
        lineItems: itemsList,
        subtotal,
        taxTotal,
        discountTotal: 0,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        notes: args.notes || 'Created via WebMCP Agent invocation',
        termsAndConditions: businessProfile.paymentInstructions,
        history: [
          {
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'created_via_webmcp',
            user: 'WebMCP Agent',
            note: 'Generated through W3C WebMCP tool call',
          },
        ],
      };

      addInvoice(newInv);
      showNotification(`WebMCP: Created invoice ${invNum} for ${args.clientName}`, 'success');

      return {
        success: true,
        invoiceNumber: invNum,
        clientName: args.clientName,
        totalAmount,
        subtotal,
        taxTotal,
        dueDate,
        lineItemCount: itemsList.length,
      };
    },
  };

  // 2. Tool: record_purchase_bill
  const recordPurchaseBillTool: WebMCPTool = {
    name: 'record_purchase_bill',
    description:
      'Records a vendor or supplier purchase bill/voucher into accounts payable with ledger allocation.',
    category: 'purchases',
    inputSchema: {
      type: 'object',
      properties: {
        vendorName: {
          type: 'string',
          description: 'Name of the supplier or vendor',
        },
        vendorEmail: {
          type: 'string',
          description: 'Vendor contact or accounts email',
        },
        billNumber: {
          type: 'string',
          description: 'Vendor bill or invoice reference number',
        },
        category: {
          type: 'string',
          description: 'Procurement category (e.g. Inventory, IT, Office Supplies)',
        },
        dueDate: {
          type: 'string',
          description: 'Payment due date in YYYY-MM-DD format',
        },
        notes: {
          type: 'string',
          description: 'Internal notes or PO reference',
        },
        items: {
          type: 'array',
          description: 'Purchased goods or services items',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
              taxRate: { type: 'number' },
              ledgerAccountName: { type: 'string' },
            },
            required: ['description', 'quantity', 'unitPrice'],
          },
        },
      },
      required: ['vendorName', 'items'],
    },
    execute: async (args: any) => {
      const itemsList: PurchaseLineItem[] = (args.items || []).map((it: any, idx: number) => {
        const qty = Number(it.quantity) || 1;
        const rate = Number(it.unitPrice) || 0;
        const taxRate = it.taxRate !== undefined ? Number(it.taxRate) : 8.0;
        return {
          id: `p-item-mcp-${Date.now()}-${idx}`,
          description: it.description || 'Supplies',
          quantity: qty,
          unitPrice: rate,
          taxRate,
          amount: qty * rate,
          ledgerAccountId: 'acc-5020',
          ledgerAccountName: it.ledgerAccountName || 'Procurement & Supplies',
        };
      });

      const subtotal = itemsList.reduce((s, it) => s + it.amount, 0);
      const taxTotal = itemsList.reduce((s, it) => s + (it.amount * (it.taxRate || 0)) / 100, 0);
      const totalAmount = subtotal + taxTotal;

      const issueDate = new Date().toISOString().split('T')[0];
      const dueDate =
        args.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const billNumber =
        args.billNumber || `BILL-${Math.floor(10000 + Math.random() * 90000)}`;

      const newBill = {
        billNumber,
        vendorName: args.vendorName,
        vendorEmail: args.vendorEmail || '',
        vendorTaxId: 'EIN-PENDING',
        vendorPhone: '',
        vendorAddress: 'Vendor Supplier Office',
        issueDate,
        dueDate,
        status: 'pending',
        currency: selectedCurrency || businessProfile.defaultCurrency,
        lineItems: itemsList,
        subtotal,
        taxTotal,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        category: args.category || 'Inventory & Raw Materials',
        paymentMethod: 'bank_transfer',
        notes: args.notes || 'Recorded via WebMCP Agent invocation',
      };

      addPurchaseInvoice(newBill);
      showNotification(`WebMCP: Recorded bill ${billNumber} for ${args.vendorName}`, 'success');

      return {
        success: true,
        billNumber,
        vendorName: args.vendorName,
        totalAmount,
        subtotal,
        taxTotal,
        dueDate,
      };
    },
  };

  // 3. Tool: get_financial_summary
  const getFinancialSummaryTool: WebMCPTool = {
    name: 'get_financial_summary',
    description:
      'Fetches high-level executive financial metrics including total revenue, expenses, net profit, accounts receivable, accounts payable, and overdue alerts.',
    category: 'reports',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      const totalRevenue = invoices
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

      const totalReceivables = invoices
        .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
        .reduce((sum, i) => sum + (i.balanceDue || 0), 0);

      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      const totalPayables = purchaseInvoices
        .filter((p) => p.status !== 'paid')
        .reduce((sum, p) => sum + (p.balanceDue || 0), 0);

      const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
      const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

      return {
        currency: selectedCurrency,
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        accountsReceivable: totalReceivables,
        accountsPayable: totalPayables,
        overdueCount: overdueInvoices.length,
        overdueAmount,
        invoicesCount: invoices.length,
        billsCount: purchaseInvoices.length,
        clientsCount: clients.length,
        vendorsCount: vendors.length,
      };
    },
  };

  // 4. Tool: list_invoices
  const listInvoicesTool: WebMCPTool = {
    name: 'list_invoices',
    description: 'Queries customer invoices with optional filters for payment status and search terms.',
    category: 'sales',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['all', 'paid', 'sent', 'overdue', 'draft'],
          description: 'Filter invoices by payment status',
        },
        search: {
          type: 'string',
          description: 'Search string for client name or invoice number',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return (default 20)',
        },
      },
    },
    execute: async (args: any) => {
      const statusFilter = args.status || 'all';
      const search = (args.search || '').toLowerCase().trim();
      const limit = Number(args.limit) || 20;

      const filtered = invoices.filter((inv) => {
        if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
        if (search) {
          const matchClient = (inv.clientName || '').toLowerCase().includes(search);
          const matchNum = (inv.invoiceNumber || '').toLowerCase().includes(search);
          if (!matchClient && !matchNum) return false;
        }
        return true;
      });

      return {
        totalCount: filtered.length,
        invoices: filtered.slice(0, limit).map((i) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          clientName: i.clientName,
          issueDate: i.issueDate,
          dueDate: i.dueDate,
          status: i.status,
          totalAmount: i.totalAmount,
          balanceDue: i.balanceDue,
          lineItemCount: i.lineItems?.length || 0,
        })),
      };
    },
  };

  // 5. Tool: list_purchase_bills
  const listPurchaseBillsTool: WebMCPTool = {
    name: 'list_purchase_bills',
    description: 'Queries vendor bills and procurement expenses from accounts payable.',
    category: 'purchases',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['all', 'paid', 'pending', 'overdue'],
          description: 'Filter bills by status',
        },
        search: {
          type: 'string',
          description: 'Search string for vendor name or bill number',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return',
        },
      },
    },
    execute: async (args: any) => {
      const statusFilter = args.status || 'all';
      const search = (args.search || '').toLowerCase().trim();
      const limit = Number(args.limit) || 20;

      const filtered = purchaseInvoices.filter((bill) => {
        if (statusFilter !== 'all' && bill.status !== statusFilter) return false;
        if (search) {
          const matchVendor = (bill.vendorName || '').toLowerCase().includes(search);
          const matchNum = (bill.billNumber || '').toLowerCase().includes(search);
          if (!matchVendor && !matchNum) return false;
        }
        return true;
      });

      return {
        totalCount: filtered.length,
        bills: filtered.slice(0, limit).map((b) => ({
          id: b.id,
          billNumber: b.billNumber,
          vendorName: b.vendorName,
          issueDate: b.issueDate,
          dueDate: b.dueDate,
          status: b.status,
          category: b.category,
          totalAmount: b.totalAmount,
          balanceDue: b.balanceDue,
        })),
      };
    },
  };

  // 6. Tool: get_chart_of_accounts
  const getChartOfAccountsTool: WebMCPTool = {
    name: 'get_chart_of_accounts',
    description:
      'Retrieves general ledger accounts with their current debit and credit balances, categorized by Asset, Liability, Equity, Revenue, and Expense.',
    category: 'ledger',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['all', 'asset', 'liability', 'equity', 'revenue', 'expense'],
          description: 'Filter accounts by classification',
        },
      },
    },
    execute: async (args: any) => {
      const typeFilter = args.type || 'all';
      const accounts = ledgerAccounts.filter(
        (a) => typeFilter === 'all' || a.type.toLowerCase() === typeFilter.toLowerCase()
      );

      return {
        count: accounts.length,
        accounts: accounts.map((a) => ({
          accountNumber: a.accountNumber,
          name: a.name,
          type: a.type,
          debit: a.debit || 0,
          credit: a.credit || 0,
          balance: (a.debit || 0) - (a.credit || 0),
        })),
      };
    },
  };

  // 7. Tool: open_camera_scanner
  const openCameraScannerTool: WebMCPTool = {
    name: 'open_camera_scanner',
    description:
      'Activates the live camera optical scanner modal on the user interface for customer sales receipts or vendor procurement bills.',
    category: 'system',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['sales', 'purchase'],
          description: 'Target document type to scan',
          default: 'purchase',
        },
      },
      required: ['mode'],
    },
    execute: async (args: any) => {
      const mode = args.mode === 'sales' ? 'sales' : 'purchase';
      openCameraScanner(mode);
      return {
        success: true,
        message: `Camera scanner activated in "${mode}" document OCR mode on the screen.`,
      };
    },
  };

  // 8. Tool: trigger_bank_reconciliation
  const triggerReconciliationTool: WebMCPTool = {
    name: 'trigger_bank_reconciliation',
    description:
      'Runs the automated bank transaction reconciliation engine to match bank feeds with corresponding invoices and expense vouchers.',
    category: 'reports',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      runAutomatedRecurringEngine();
      const unmatched = bankTransactions.filter((t) => t.status === 'unmatched');
      const matched = bankTransactions.filter((t) => t.status === 'matched');

      return {
        success: true,
        unmatchedCount: unmatched.length,
        matchedCount: matched.length,
        message: 'Automated bank reconciliation pass evaluated.',
      };
    },
  };

  // 9. Tool: get_customer_predictive_insights
  const getCustomerInsightsTool: WebMCPTool = {
    name: 'get_customer_predictive_insights',
    description:
      'Returns AI-driven predictive insights on customer purchasing behavior, payment delays, and churn risks.',
    category: 'reports',
    inputSchema: {
      type: 'object',
      properties: {
        minRiskScore: {
          type: 'number',
          description: 'Filter clients with risk score greater than or equal to this value (0-100)',
        },
      },
    },
    execute: async (args: any) => {
      const minRisk = Number(args.minRiskScore) || 0;
      const insights = (customerInsights || []).filter((c) => (c.riskScore || 0) >= minRisk);
      return {
        count: insights.length,
        insights,
      };
    },
  };

  // Register all tools
  webmcpEngine.registerTool(createSalesInvoiceTool);
  webmcpEngine.registerTool(recordPurchaseBillTool);
  webmcpEngine.registerTool(getFinancialSummaryTool);
  webmcpEngine.registerTool(listInvoicesTool);
  webmcpEngine.registerTool(listPurchaseBillsTool);
  webmcpEngine.registerTool(getChartOfAccountsTool);
  webmcpEngine.registerTool(openCameraScannerTool);
  webmcpEngine.registerTool(triggerReconciliationTool);
  webmcpEngine.registerTool(getCustomerInsightsTool);

  // Register WebMCP Resources
  const overviewResource: WebMCPResource = {
    uri: 'accounting://financial-metrics',
    name: 'Live Financial Summary',
    description: 'Current snapshot of revenue, receivables, payables, and net income',
    mimeType: 'application/json',
    read: () => {
      const rev = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + (i.totalAmount || 0), 0);
      const exp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
      return JSON.stringify({
        company: businessProfile.companyName,
        currency: selectedCurrency,
        revenue: rev,
        expenses: exp,
        netIncome: rev - exp,
        activeInvoices: invoices.length,
        timestamp: new Date().toISOString(),
      });
    },
  };

  const chartResource: WebMCPResource = {
    uri: 'accounting://chart-of-accounts',
    name: 'Chart of Accounts Ledger',
    description: 'All ledger accounts with classification codes and current balances',
    mimeType: 'application/json',
    read: () => JSON.stringify(ledgerAccounts),
  };

  webmcpEngine.registerResource(overviewResource);
  webmcpEngine.registerResource(chartResource);

  // Register WebMCP Prompts
  const auditPrompt: WebMCPPrompt = {
    name: 'audit-general-ledger',
    description: 'Audits general ledger trial balance and flags debit/credit discrepancies',
    arguments: [
      { name: 'depth', description: 'Audit detail level (summary or deep)', required: false },
    ],
    getMessages: (args: any) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please analyze the current chart of accounts for ${businessProfile.companyName} at depth "${args.depth || 'summary'}". Verify that total debits equal total credits and check for unusual expense spikes.`,
        },
      },
    ],
  };

  webmcpEngine.registerPrompt(auditPrompt);
}
