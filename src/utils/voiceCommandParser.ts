import { TabType } from '../types';

export interface ParsedVoiceInvoiceParams {
  clientName: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  rate: number;
  hasDetailedParams: boolean;
}

export interface ParsedVoicePurchaseParams {
  vendorName: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  rate: number;
  category?: string;
  hasDetailedParams: boolean;
}

export type VoiceOpenTarget =
  | { type: 'modal'; modal: 'invoice' | 'purchase_invoice' | 'expense' | 'client' | 'vendor' | 'inventory' | 'stock_adjustment' | 'voucher' | 'receipt_scanner' | 'copilot' | 'voice_commander' }
  | { type: 'tab'; tab: TabType; subReport?: string }
  | { type: 'close_all' }
  | null;

const UNIT_REGEX_PART = '(?:pieces|piece|units|unit|boxes|box|hours|hour|meters|meter|items|item|pcs|pc|nos|kg|lbs)';

/**
 * Parses parameter-rich invoice voice commands like:
 * "create invoice in abc name with ttt item 1 pc at rate 5"
 * "make invoice for Acme Corp with 5 units of widgets at rate 20"
 * "create invoice in the name of Delta with consulting 2 hours at rate 150"
 */
export function parseInvoiceVoiceCommand(rawText: string): ParsedVoiceInvoiceParams {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Client extraction
  let clientName = '';
  // Pattern: "in [abc] name" (not matching "in the name of")
  const inNameMatch = text.match(/\bin\s+(?!the\s+name\b|name\s+of\b)([a-zA-Z0-9\s._&-]+?)\s+name\b/i);
  // Pattern: "in the name of [abc]" or "in name of [abc]"
  const nameOfMatch = text.match(/(?:in\s+the\s+name\s+of|in\s+name\s+of|name\s+of)\s+([a-zA-Z0-9\s._&-]+?)(?:\s+with|\s+for|\s+at|\s+item|\s+having|$)/i);
  // Pattern: "for client [abc]" or "to client [abc]"
  const forClientMatch = text.match(/(?:for\s+client|to\s+client|client)\s+([a-zA-Z0-9\s._&-]+?)(?:\s+with|\s+item|\s+at\s+rate|\s+having|$)/i);
  // Pattern: "for [abc]" / "to [abc]"
  const forDirectMatch = text.match(/(?:for|to)\s+([a-zA-Z0-9\s._&-]+?)(?:\s+with|\s+item|\s+at\s+rate|\s+having|$)/i);

  if (inNameMatch && inNameMatch[1].trim()) {
    clientName = inNameMatch[1].trim();
  } else if (nameOfMatch && nameOfMatch[1].trim()) {
    clientName = nameOfMatch[1].trim();
  } else if (forClientMatch && forClientMatch[1].trim()) {
    clientName = forClientMatch[1].trim();
  } else if (forDirectMatch && forDirectMatch[1].trim()) {
    const candidate = forDirectMatch[1].trim();
    // avoid false positive if candidate is purely numbers or units
    if (!/^\$?\d+(\.\d+)?\s*(dollars|usd)?$/i.test(candidate)) {
      clientName = candidate;
    }
  }

  // 2. Rate / Price extraction
  let rate = 0;
  let hasExplicitRate = false;
  const rateMatch =
    text.match(/(?:at\s+rate\s+(?:of\s+)?|at\s+the\s+rate\s+of\s+|rate\s+(?:of\s+)?|price\s+(?:of\s+)?|at\s+\$|\$?at\s+rate\s*)\$?(\d+(?:\.\d+)?)/i) ||
    text.match(/@\s*\$?(\d+(?:\.\d+)?)/i) ||
    text.match(/(?:at|for)\s+\$?(\d+(?:\.\d+)?)\s*(?:each|per\s+unit|per\s+pc|dollars|usd)\b/i);

  if (rateMatch) {
    rate = parseFloat(rateMatch[1]);
    hasExplicitRate = true;
  }

  // 3. Quantity & Item Description extraction
  let quantity = 1;
  let unit = 'pc';
  let itemDescription = '';
  let hasExplicitItem = false;
  let hasExplicitQty = false;

  const afterWith = text.match(/\bwith\s+(.+)$/i);
  if (afterWith) {
    const content = afterWith[1].trim();
    if (/^\d/.test(content)) {
      // Quantity comes first: "with 3 laptops at rate 1200" or "with 5 pcs of widgets at rate 10"
      const qtyFirstRegex = new RegExp(
        `with\\s+(\\d+(?:\\.\\d+)?)\\s*(${UNIT_REGEX_PART})?\\s*(?:of\\s+)?([a-zA-Z0-9\\s._&-]+?)(?:\\s+at|\\s+rate|\\s+price|$)`,
        'i'
      );
      const m = text.match(qtyFirstRegex);
      if (m) {
        quantity = parseFloat(m[1]);
        unit = m[2] || 'pc';
        itemDescription = m[3].trim();
        hasExplicitQty = true;
        hasExplicitItem = true;
      }
    } else {
      // Item comes first: "with ttt item 1 pc at rate 5" or "with ttt 1 pc at rate 5"
      const itemFirstRegex = new RegExp(
        `with\\s+([a-zA-Z0-9\\s._&-]+?)(?:\\s+item)?\\s+(\\d+(?:\\.\\d+)?)\\s*(${UNIT_REGEX_PART})?(?:\\s+at|\\s+rate|\\s+price|$)`,
        'i'
      );
      const m = text.match(itemFirstRegex);
      if (m) {
        itemDescription = m[1].trim();
        quantity = parseFloat(m[2]);
        unit = m[3] || 'pc';
        hasExplicitItem = true;
        hasExplicitQty = true;
      } else {
        const plain = text.match(/with\s+([a-zA-Z0-9\s._&-]+?)(?:\s+item)?(?:\s+at|\s+rate|$)/i);
        if (plain) {
          itemDescription = plain[1].trim();
          hasExplicitItem = true;
        }
      }
    }
  }

  // Standalone quantity match if not caught yet
  if (!hasExplicitQty) {
    const qtyStandaloneRegex = new RegExp(
      `(\\d+(?:\\.\\d+)?)\\s*(${UNIT_REGEX_PART})\\b`,
      'i'
    );
    const qtyMatch = text.match(qtyStandaloneRegex);
    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1]);
      unit = qtyMatch[2];
      hasExplicitQty = true;
    }
  }

  // Standalone item fallback
  if (!itemDescription) {
    const itemOnlyMatch = text.match(/(?:item|product|service)\s+([a-zA-Z0-9\s._&-]+?)(?:\s+\d+|\s+at|\s+qty|\s+quantity|$)/i);
    if (itemOnlyMatch) {
      itemDescription = itemOnlyMatch[1].trim();
      hasExplicitItem = true;
    }
  }

  const hasDetailedParams = !!(clientName || hasExplicitItem || hasExplicitRate || hasExplicitQty);

  // Defaults if missing
  if (!clientName) clientName = 'Valued Customer';
  if (!itemDescription) itemDescription = 'Merchandise / Standard Services';
  if (!rate) rate = 100;

  return {
    clientName,
    itemDescription,
    quantity,
    unit,
    rate,
    hasDetailedParams,
  };
}

/**
 * Parses purchase bill commands:
 * "create bill in xyz name with widgets 10 pc at rate 20"
 */
export function parsePurchaseVoiceCommand(rawText: string): ParsedVoicePurchaseParams {
  const invParsed = parseInvoiceVoiceCommand(rawText);
  return {
    vendorName: invParsed.clientName === 'Valued Customer' ? 'Supplier / Vendor' : invParsed.clientName,
    itemDescription: invParsed.itemDescription,
    quantity: invParsed.quantity,
    unit: invParsed.unit,
    rate: invParsed.rate,
    category: 'Office Supplies & Equipment',
    hasDetailedParams: invParsed.hasDetailedParams,
  };
}

/**
 * Universal voice intent detector to open EVERYTHING in the application:
 * tabs, modals, dialogs, or closing them.
 */
export function parseVoiceOpenIntent(rawText: string): VoiceOpenTarget {
  const lower = rawText.toLowerCase().trim();

  // Close command
  if (
    lower.includes('close modal') ||
    lower.includes('close dialog') ||
    lower.includes('close window') ||
    lower.includes('dismiss modal') ||
    lower.includes('close everything') ||
    lower.includes('close all') ||
    lower === 'close'
  ) {
    return { type: 'close_all' };
  }

  // Explicit Modal Openers
  if (
    lower.includes('open invoice modal') ||
    lower.includes('open invoice creator') ||
    lower.includes('new invoice modal') ||
    lower.includes('open new invoice') ||
    lower.includes('open sale modal')
  ) {
    return { type: 'modal', modal: 'invoice' };
  }

  if (
    lower.includes('open purchase modal') ||
    lower.includes('open purchase invoice modal') ||
    lower.includes('open bill modal') ||
    lower.includes('new bill modal') ||
    lower.includes('open new bill')
  ) {
    return { type: 'modal', modal: 'purchase_invoice' };
  }

  if (
    lower.includes('open expense modal') ||
    lower.includes('open expense logger') ||
    lower.includes('new expense modal') ||
    lower.includes('record expense') ||
    lower.includes('log expense') ||
    lower.includes('add expense')
  ) {
    return { type: 'modal', modal: 'expense' };
  }

  if (
    lower.includes('open client modal') ||
    lower.includes('open customer modal') ||
    lower.includes('add client') ||
    lower.includes('new client') ||
    lower.includes('create client') ||
    lower.includes('add customer')
  ) {
    return { type: 'modal', modal: 'client' };
  }

  if (
    lower.includes('open vendor modal') ||
    lower.includes('open supplier modal') ||
    lower.includes('add vendor') ||
    lower.includes('new vendor') ||
    lower.includes('create vendor') ||
    lower.includes('add supplier')
  ) {
    return { type: 'modal', modal: 'vendor' };
  }

  if (
    lower.includes('open inventory modal') ||
    lower.includes('open stock modal') ||
    lower.includes('add inventory') ||
    lower.includes('new inventory item') ||
    lower.includes('create inventory item') ||
    lower.includes('add item') ||
    lower.includes('add product')
  ) {
    return { type: 'modal', modal: 'inventory' };
  }

  if (
    lower.includes('open stock adjustment') ||
    lower.includes('adjust stock') ||
    lower.includes('stock adjustment modal')
  ) {
    return { type: 'modal', modal: 'stock_adjustment' };
  }

  if (
    lower.includes('open voucher modal') ||
    lower.includes('open payment voucher') ||
    lower.includes('record payment voucher') ||
    lower.includes('new voucher') ||
    lower.includes('create voucher')
  ) {
    return { type: 'modal', modal: 'voucher' };
  }

  if (
    lower.includes('open receipt scanner') ||
    lower.includes('open scanner') ||
    lower.includes('scan receipt') ||
    lower.includes('ocr scanner') ||
    lower.includes('upload receipt')
  ) {
    return { type: 'modal', modal: 'receipt_scanner' };
  }

  if (
    lower.includes('open copilot') ||
    lower.includes('open ai copilot') ||
    lower.includes('open ai assistant') ||
    lower.includes('ask ai') ||
    lower.includes('open assistant') ||
    lower.includes('open ai chat')
  ) {
    return { type: 'modal', modal: 'copilot' };
  }

  if (
    lower.includes('open voice commander') ||
    lower.includes('open voice modal') ||
    lower.includes('open voice assistant') ||
    lower.includes('open voice widget')
  ) {
    return { type: 'modal', modal: 'voice_commander' };
  }

  // Screen / Tab Openers
  const isNav =
    lower.includes('open') ||
    lower.includes('go to') ||
    lower.includes('show') ||
    lower.includes('navigate') ||
    lower.includes('switch to') ||
    lower.includes('view') ||
    lower.includes('display');

  if (isNav && (lower.includes('dashboard') || lower.includes('overview') || lower.includes('home'))) {
    return { type: 'tab', tab: 'dashboard' };
  }

  if (isNav && (lower.includes('invoice') || lower.includes('invoices') || lower.includes('sales'))) {
    return { type: 'tab', tab: 'invoices' };
  }

  if (isNav && (lower.includes('purchase') || lower.includes('bills') || lower.includes('supplier invoice') || lower.includes('purchases'))) {
    return { type: 'tab', tab: 'purchase_invoices' };
  }

  if (isNav && (lower.includes('expense') || lower.includes('expenses') || lower.includes('spending'))) {
    return { type: 'tab', tab: 'expenses' };
  }

  if (isNav && (lower.includes('inventory') || lower.includes('stock') || lower.includes('products') || lower.includes('items'))) {
    return { type: 'tab', tab: 'inventory' };
  }

  if (isNav && (lower.includes('ledger') || lower.includes('chart of accounts') || lower.includes('accounts'))) {
    return { type: 'tab', tab: 'ledger' };
  }

  if (isNav && (lower.includes('report') || lower.includes('reports') || lower.includes('profit and loss') || lower.includes('p&l') || lower.includes('balance sheet') || lower.includes('cash flow') || lower.includes('statement') || lower.includes('financial'))) {
    return { type: 'tab', tab: 'reports' };
  }

  if (isNav && (lower.includes('bank') || lower.includes('feed') || lower.includes('reconciliation') || lower.includes('banking'))) {
    return { type: 'tab', tab: 'bank_feed' };
  }

  if (isNav && (lower.includes('client') || lower.includes('clients') || lower.includes('customer') || lower.includes('customers'))) {
    return { type: 'tab', tab: 'clients' };
  }

  if (isNav && (lower.includes('vendor') || lower.includes('vendors') || lower.includes('supplier') || lower.includes('suppliers'))) {
    return { type: 'tab', tab: 'vendors' };
  }

  if (isNav && (lower.includes('voucher') || lower.includes('vouchers') || lower.includes('receipt voucher') || lower.includes('payment voucher'))) {
    return { type: 'tab', tab: 'vouchers' };
  }

  if (isNav && (lower.includes('insight') || lower.includes('predict') || lower.includes('analytics') || lower.includes('intelligence'))) {
    return { type: 'tab', tab: 'ai_insights' };
  }

  if (isNav && (lower.includes('setting') || lower.includes('settings') || lower.includes('preference') || lower.includes('profile') || lower.includes('configuration'))) {
    return { type: 'tab', tab: 'settings' };
  }

  return null;

  return null;
}
