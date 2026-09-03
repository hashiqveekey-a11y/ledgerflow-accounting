import { Express, Request, Response } from 'express';
import crypto from 'crypto';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'create_sales_invoice',
    description: 'Creates a customer sales invoice in the accounting system with line items, tax, and terms.',
    inputSchema: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Name of the client/customer' },
        clientEmail: { type: 'string', description: 'Client billing email' },
        dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
        notes: { type: 'string', description: 'Payment terms or remarks' },
        items: {
          type: 'array',
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
  },
  {
    name: 'record_purchase_bill',
    description: 'Records a vendor or supplier purchase bill/voucher with ledger allocation.',
    inputSchema: {
      type: 'object',
      properties: {
        vendorName: { type: 'string', description: 'Name of the supplier or vendor' },
        vendorEmail: { type: 'string', description: 'Vendor email' },
        billNumber: { type: 'string', description: 'Vendor bill number' },
        category: { type: 'string', description: 'Procurement category' },
        dueDate: { type: 'string', description: 'Payment due date in YYYY-MM-DD format' },
        items: {
          type: 'array',
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
      required: ['vendorName', 'items'],
    },
  },
  {
    name: 'get_financial_summary',
    description: 'Returns real-time balance sheet, revenue, expense, and cash flow summary metrics.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_invoices',
    description: 'Queries invoices with optional filters for status (paid, sent, overdue, draft).',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['all', 'paid', 'sent', 'overdue', 'draft'] },
        limit: { type: 'number', description: 'Max records to return' },
      },
    },
  },
  {
    name: 'list_purchase_bills',
    description: 'Queries accounts payable bills with optional filters.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['all', 'paid', 'pending', 'overdue'] },
        limit: { type: 'number', description: 'Max records to return' },
      },
    },
  },
  {
    name: 'get_chart_of_accounts',
    description: 'Retrieves general ledger accounts with current debit/credit balances.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['all', 'asset', 'liability', 'equity', 'revenue', 'expense'] },
      },
    },
  },
  {
    name: 'open_camera_scanner',
    description: 'Activates the live camera optical scanner in the web browser interface.',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['sales', 'purchase'] },
      },
      required: ['mode'],
    },
  },
  {
    name: 'trigger_bank_reconciliation',
    description: 'Executes rule matching for bank transactions against invoices and expenses.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export const MCP_RESOURCES = [
  {
    uri: 'accounting://financial-metrics',
    name: 'Live Financial Summary',
    description: 'Current snapshot of revenue, receivables, payables, and net profit',
    mimeType: 'application/json',
  },
  {
    uri: 'accounting://chart-of-accounts',
    name: 'Chart of Accounts Ledger',
    description: 'All ledger accounts with classification codes and current balances',
    mimeType: 'application/json',
  },
  {
    uri: 'accounting://company-profile',
    name: 'Business Profile & Tax Configuration',
    description: 'Company identification, tax ID, and default invoicing policies',
    mimeType: 'application/json',
  },
];

export const MCP_PROMPTS = [
  {
    name: 'audit-general-ledger',
    description: 'Audits general ledger trial balance and flags debit/credit discrepancies',
    arguments: [{ name: 'depth', description: 'Audit detail level (summary or deep)', required: false }],
  },
  {
    name: 'draft-overdue-reminder',
    description: 'Drafts professional payment reminder for overdue invoices',
    arguments: [{ name: 'clientName', description: 'Name of the client', required: true }],
  },
];

// Active SSE sessions map
interface SSESession {
  id: string;
  res: Response;
  createdAt: number;
}
const activeSessions = new Map<string, SSESession>();

/**
 * Handles incoming MCP JSON-RPC 2.0 requests
 */
export async function processMCPJsonRpc(
  request: any,
  baseUrl: string = 'http://localhost:3000'
): Promise<any> {
  const { jsonrpc, id, method, params } = request || {};

  if (jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      id: id || null,
      error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
    };
  }

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true },
            resources: { listChanged: false, subscribe: false },
            prompts: { listChanged: false },
            logging: {},
          },
          serverInfo: {
            name: 'LiveBooks WebMCP Server',
            version: '1.2.0',
            description: 'W3C WebML & Model Context Protocol Server for LedgerFlow Accounting',
          },
        },
      };

    case 'notifications/initialized':
      return null; // Notifications do not send a return response in JSON-RPC

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS,
        },
      };

    case 'tools/call': {
      const toolName = params?.name;
      const args = params?.arguments || {};

      const tool = MCP_TOOLS.find((t) => t.name === toolName);
      if (!tool) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool "${toolName}" not found` },
        };
      }

      // Execute simulated tool logic on server (the client-side WebMCP handles real in-memory updates)
      let executionData: any = {};
      if (toolName === 'create_sales_invoice') {
        const invNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
        const items = args.items || [{ description: 'Accounting Service', quantity: 1, unitPrice: 100 }];
        const subtotal = items.reduce(
          (sum: number, it: any) => sum + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
          0
        );
        const taxTotal = subtotal * 0.085;
        executionData = {
          success: true,
          invoiceNumber: invNum,
          clientName: args.clientName,
          subtotal,
          taxTotal,
          totalAmount: subtotal + taxTotal,
          status: 'sent',
          message: `Invoice ${invNum} created for ${args.clientName}`,
        };
      } else if (toolName === 'record_purchase_bill') {
        const billNum = args.billNumber || `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
        executionData = {
          success: true,
          billNumber: billNum,
          vendorName: args.vendorName,
          status: 'pending',
          message: `Purchase bill ${billNum} recorded for vendor ${args.vendorName}`,
        };
      } else if (toolName === 'get_financial_summary') {
        executionData = {
          currency: 'USD',
          totalRevenue: 24500.0,
          totalExpenses: 8230.5,
          netIncome: 16269.5,
          accountsReceivable: 4120.0,
          accountsPayable: 1850.0,
          operatingMarginPercent: 66.4,
          overdueInvoicesCount: 1,
        };
      } else if (toolName === 'list_invoices') {
        executionData = {
          count: 3,
          invoices: [
            { invoiceNumber: 'INV-1001', clientName: 'Apex Cloud Solutions', totalAmount: 1850.0, status: 'paid' },
            { invoiceNumber: 'INV-1002', clientName: 'Quantum Dynamics', totalAmount: 2270.0, status: 'sent' },
            { invoiceNumber: 'INV-1003', clientName: 'Blue Horizon Tech', totalAmount: 1400.0, status: 'overdue' },
          ],
        };
      } else if (toolName === 'list_purchase_bills') {
        executionData = {
          count: 2,
          bills: [
            { billNumber: 'BILL-901', vendorName: 'AWS & Cloud Services', totalAmount: 480.0, status: 'paid' },
            { billNumber: 'BILL-902', vendorName: 'Office Depot & Supplies', totalAmount: 135.5, status: 'pending' },
          ],
        };
      } else if (toolName === 'get_chart_of_accounts') {
        executionData = {
          accounts: [
            { accountNumber: '1010', name: 'Operating Cash & Bank', type: 'Asset', balance: 34250.0 },
            { accountNumber: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 4120.0 },
            { accountNumber: '2010', name: 'Accounts Payable', type: 'Liability', balance: 1850.0 },
            { accountNumber: '4010', name: 'Software Services Revenue', type: 'Revenue', balance: 24500.0 },
            { accountNumber: '5020', name: 'Cloud Infrastructure & Hosting', type: 'Expense', balance: 3200.0 },
          ],
        };
      } else if (toolName === 'open_camera_scanner') {
        executionData = {
          success: true,
          mode: args.mode || 'purchase',
          message: `Camera optical scanner triggered in "${args.mode || 'purchase'}" mode.`,
        };
      } else if (toolName === 'trigger_bank_reconciliation') {
        executionData = {
          success: true,
          matchedTransactions: 6,
          unmatchedRemaining: 0,
          status: 'Reconciliation pass verified. Books are in balance.',
        };
      } else {
        executionData = { success: true, message: `Tool ${toolName} executed.` };
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(executionData, null, 2),
            },
          ],
        },
      };
    }

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          resources: MCP_RESOURCES,
        },
      };

    case 'resources/read': {
      const uri = params?.uri;
      const res = MCP_RESOURCES.find((r) => r.uri === uri);
      if (!res) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: `Resource "${uri}" not found` },
        };
      }

      const sampleData = {
        uri,
        name: res.name,
        timestamp: new Date().toISOString(),
        data: 'Resource verified via WebMCP Protocol Stream',
      };

      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: res.mimeType,
              text: JSON.stringify(sampleData, null, 2),
            },
          ],
        },
      };
    }

    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          prompts: MCP_PROMPTS,
        },
      };

    case 'prompts/get': {
      const promptName = params?.name;
      const p = MCP_PROMPTS.find((item) => item.name === promptName);
      if (!p) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: `Prompt "${promptName}" not found` },
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          description: p.description,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Execute prompt: ${p.name}. Review accounting books and output recommendations.`,
              },
            },
          ],
        },
      };
    }

    case 'ping':
      return {
        jsonrpc: '2.0',
        id,
        result: {},
      };

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method "${method}" not found` },
      };
  }
}

/**
 * Registers all MCP and WebMCP endpoints on the Express application
 */
export function setupMCPEndpoints(app: Express) {
  // 1. WebMCP Discovery Manifest & Status
  app.get(['/api/mcp', '/api/mcp/manifest'], (req: Request, res: Response) => {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    res.json({
      name: 'LiveBooks WebMCP Server',
      protocol: 'mcp/2024-11-05',
      w3cSpec: 'W3C Web Machine Learning Model Context Protocol (WebMCP)',
      version: '1.2.0',
      description: 'WebMCP endpoints enabling AI agents to inspect, audit, and operate LedgerFlow Accounting books.',
      capabilities: {
        tools: { count: MCP_TOOLS.length },
        resources: { count: MCP_RESOURCES.length },
        prompts: { count: MCP_PROMPTS.length },
      },
      endpoints: {
        jsonRpcPost: `${baseUrl}/api/mcp`,
        sseStream: `${baseUrl}/api/mcp/sse`,
        sseMessages: `${baseUrl}/api/mcp/messages`,
      },
      tools: MCP_TOOLS,
      resources: MCP_RESOURCES,
      prompts: MCP_PROMPTS,
    });
  });

  // 2. Standard MCP JSON-RPC 2.0 HTTP POST Endpoint
  app.post('/api/mcp', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;

      if (Array.isArray(body)) {
        // Batch request
        const responses = await Promise.all(
          body.map((singleReq) => processMCPJsonRpc(singleReq, baseUrl))
        );
        return res.json(responses.filter((r) => r !== null));
      }

      const response = await processMCPJsonRpc(body, baseUrl);
      if (response === null) {
        return res.status(204).end();
      }
      return res.json(response);
    } catch (err: any) {
      console.error('[WebMCP Error]', err);
      return res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id || null,
        error: { code: -32603, message: 'Internal WebMCP Server Error', data: err?.message },
      });
    }
  });

  // 3. MCP SSE (Server-Sent Events) Stream Transport
  app.get('/api/mcp/sse', (req: Request, res: Response) => {
    const sessionId = crypto.randomUUID();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    });

    // Store active session
    activeSessions.set(sessionId, {
      id: sessionId,
      res,
      createdAt: Date.now(),
    });

    // Send the required MCP endpoint notification
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const messageEndpoint = `${protocol}://${host}/api/mcp/messages?sessionId=${sessionId}`;

    res.write(`event: endpoint\ndata: ${messageEndpoint}\n\n`);

    // Keep-alive heartbeat every 15 seconds
    const interval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(interval);
      activeSessions.delete(sessionId);
    });
  });

  // 4. MCP Messages Endpoint for SSE Sessions
  app.post('/api/mcp/messages', async (req: Request, res: Response) => {
    const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);
    const session = sessionId ? activeSessions.get(sessionId) : null;

    try {
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;

      const response = await processMCPJsonRpc(req.body, baseUrl);

      if (session && response) {
        // Stream result through SSE
        session.res.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);
        return res.status(202).json({ status: 'queued_to_sse', sessionId });
      }

      // If no active SSE session found, reply directly with HTTP response
      return res.json(response);
    } catch (err: any) {
      return res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id || null,
        error: { code: -32603, message: err?.message || 'Error processing message' },
      });
    }
  });

  console.log('[WebMCP] Registered /api/mcp, /api/mcp/sse, and /api/mcp/manifest');
}
