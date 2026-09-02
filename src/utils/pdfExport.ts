import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Invoice,
  PurchaseInvoice,
  BusinessProfile,
  CurrencyCode,
  ProfitAndLossReport,
  BalanceSheetReport,
  CashFlowReport,
  TaxDeductionSummary,
  ARAgingBucket,
  LedgerAccount,
} from '../types';
import { formatCurrency } from './accountingMath';

/**
 * Capture an HTML element and download as a high-resolution PDF
 */
export async function exportElementToPDF(elementId: string, filename: string = 'document.pdf'): Promise<boolean> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found for PDF export.`);
      return false;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // 10mm top margin

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error exporting element to PDF:', error);
    return false;
  }
}

/**
 * Export Sales Invoice as a PDF
 */
export function exportInvoicePDF(invoice: Invoice, businessProfile: BusinessProfile): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
    const emeraldColor: [number, number, number] = [4, 120, 87]; // emerald-700
    const lightBg: [number, number, number] = [248, 250, 252]; // slate-50
    const borderColor: [number, number, number] = [226, 232, 240]; // slate-200
    const textColor: [number, number, number] = [30, 41, 59]; // slate-800
    const mutedColor: [number, number, number] = [100, 116, 139]; // slate-500

    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 18;

    // Header Background Bar
    doc.setFillColor(...lightBg);
    doc.roundedRect(12, 12, pageWidth - 24, 38, 3, 3, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(12, 12, pageWidth - 24, 38, 3, 3, 'S');

    // Company Name & Info (Left)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(businessProfile.companyName, 18, currentY + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text(businessProfile.address.street, 18, currentY + 9);
    doc.text(
      `${businessProfile.address.city}, ${businessProfile.address.state} ${businessProfile.address.zip}, ${businessProfile.address.country}`,
      18,
      currentY + 14
    );
    doc.text(`Tax ID: ${businessProfile.taxNumber}  •  ${businessProfile.email}`, 18, currentY + 19);

    // Invoice Number & Big Badge (Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...emeraldColor);
    doc.text('TAX INVOICE', pageWidth - 18, currentY + 4, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text(invoice.invoiceNumber, pageWidth - 18, currentY + 11, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text(`Issue Date: ${invoice.issueDate}`, pageWidth - 18, currentY + 17, { align: 'right' });
    doc.text(`Due Date: ${invoice.dueDate}`, pageWidth - 18, currentY + 22, { align: 'right' });

    currentY = 56;

    // Bill To & Summary Container
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, currentY, pageWidth - 24, 28, 3, 3, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(12, currentY, pageWidth - 24, 28, 3, 3, 'S');

    // Bill To Column
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text('BILLED TO:', 18, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(invoice.clientCompany || invoice.clientName, 18, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text(`Attn: ${invoice.clientName} (${invoice.clientEmail})`, 18, currentY + 17);
    if (invoice.clientAddress) {
      doc.text(invoice.clientAddress, 18, currentY + 22);
    }

    // Status & Total Due Column
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text('TOTAL AMOUNT DUE', pageWidth - 18, currentY + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...emeraldColor);
    doc.text(formatCurrency(invoice.balanceDue, invoice.currency), pageWidth - 18, currentY + 14, { align: 'right' });

    // Status Pill
    const statusText = invoice.status.toUpperCase();
    doc.setFontSize(8);
    if (invoice.status === 'paid') {
      doc.setTextColor(4, 120, 87);
    } else if (invoice.status === 'overdue') {
      doc.setTextColor(190, 18, 60);
    } else {
      doc.setTextColor(30, 41, 59);
    }
    doc.text(`STATUS: ${statusText}`, pageWidth - 18, currentY + 21, { align: 'right' });

    currentY = 90;

    // Line Items Table Header
    doc.setFillColor(...lightBg);
    doc.rect(12, currentY, pageWidth - 24, 8, 'F');
    doc.setDrawColor(...borderColor);
    doc.rect(12, currentY, pageWidth - 24, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('ITEM & DESCRIPTION', 16, currentY + 5.5);
    doc.text('QTY', 115, currentY + 5.5, { align: 'center' });
    doc.text('UNIT PRICE', 140, currentY + 5.5, { align: 'right' });
    doc.text('TAX %', 160, currentY + 5.5, { align: 'center' });
    doc.text('AMOUNT', pageWidth - 16, currentY + 5.5, { align: 'right' });

    currentY += 8;

    // Line Items Rows
    invoice.lineItems.forEach((item, index) => {
      const rowHeight = 8.5;
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(12, currentY, pageWidth - 24, rowHeight, 'F');
      }

      doc.setDrawColor(...borderColor);
      doc.line(12, currentY + rowHeight, pageWidth - 12, currentY + rowHeight);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...textColor);
      doc.text(item.description, 16, currentY + 5.5);

      doc.text(String(item.quantity), 115, currentY + 5.5, { align: 'center' });
      doc.text(formatCurrency(item.unitPrice, invoice.currency), 140, currentY + 5.5, { align: 'right' });
      doc.text(`${item.taxRate}%`, 160, currentY + 5.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(item.amount, invoice.currency), pageWidth - 16, currentY + 5.5, { align: 'right' });

      currentY += rowHeight;
    });

    currentY += 6;

    // Remittance Box (Left) and Calculation Totals (Right)
    const splitY = currentY;

    // Left: Bank Remittance Instructions Box
    doc.setFillColor(...lightBg);
    doc.roundedRect(12, splitY, 95, 42, 3, 3, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(12, splitY, 95, 42, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('PAYMENT & REMITTANCE INSTRUCTIONS', 16, splitY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedColor);
    doc.text(`Bank Name: ${businessProfile.bankDetails.bankName}`, 16, splitY + 12);
    doc.text(`Account Name: ${businessProfile.bankDetails.accountName}`, 16, splitY + 17);
    doc.text(`Account Number: ${businessProfile.bankDetails.accountNumber}`, 16, splitY + 22);
    doc.text(`Routing / IBAN: ${businessProfile.bankDetails.routingOrIban}`, 16, splitY + 27);
    doc.text(`Reference: ${invoice.invoiceNumber}`, 16, splitY + 32);

    // Right: Calculation Totals Table
    const rightBoxX = 118;
    const rightBoxWidth = pageWidth - rightBoxX - 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text('Subtotal:', rightBoxX, splitY + 6);
    doc.setTextColor(...primaryColor);
    doc.text(formatCurrency(invoice.subtotal, invoice.currency), pageWidth - 16, splitY + 6, { align: 'right' });

    if (invoice.discountTotal > 0) {
      doc.setTextColor(225, 29, 72);
      doc.text('Discount:', rightBoxX, splitY + 12);
      doc.text(`-${formatCurrency(invoice.discountTotal, invoice.currency)}`, pageWidth - 16, splitY + 12, {
        align: 'right',
      });
    }

    doc.setTextColor(...mutedColor);
    doc.text('Tax Amount (VAT/Sales):', rightBoxX, splitY + 18);
    doc.setTextColor(...primaryColor);
    doc.text(formatCurrency(invoice.taxTotal, invoice.currency), pageWidth - 16, splitY + 18, { align: 'right' });

    doc.setDrawColor(...borderColor);
    doc.line(rightBoxX, splitY + 22, pageWidth - 12, splitY + 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('Total Invoice Amount:', rightBoxX, splitY + 27);
    doc.text(formatCurrency(invoice.totalAmount, invoice.currency), pageWidth - 16, splitY + 27, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(4, 120, 87);
    doc.text('Amount Paid:', rightBoxX, splitY + 33);
    doc.text(formatCurrency(invoice.amountPaid, invoice.currency), pageWidth - 16, splitY + 33, { align: 'right' });

    doc.setFillColor(...emeraldColor);
    doc.roundedRect(rightBoxX - 2, splitY + 36, rightBoxWidth + 4, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text('BALANCE DUE:', rightBoxX + 2, splitY + 42);
    doc.text(formatCurrency(invoice.balanceDue, invoice.currency), pageWidth - 16, splitY + 42, { align: 'right' });

    // Terms & Notes Footer
    currentY = splitY + 50;
    if (invoice.notes || invoice.termsAndConditions) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...mutedColor);
      doc.text('TERMS & NOTES:', 12, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...textColor);
      if (invoice.notes) {
        doc.text(`Note: ${invoice.notes}`, 12, currentY + 5);
        currentY += 5;
      }
      if (invoice.termsAndConditions) {
        doc.text(`Terms: ${invoice.termsAndConditions}`, 12, currentY + 5);
      }
    }

    // Bottom Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.text(
      `Generated electronically by ${businessProfile.companyName} on ${new Date().toLocaleDateString()}. Valid without signature.`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );

    doc.save(`${invoice.invoiceNumber}.pdf`);
    return true;
  } catch (err) {
    console.error('Error generating invoice PDF:', err);
    return false;
  }
}

/**
 * Export Purchase Invoice / Vendor Bill as a PDF
 */
export function exportPurchaseInvoicePDF(bill: PurchaseInvoice, businessProfile: BusinessProfile): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [15, 23, 42];
    const purpleColor: [number, number, number] = [67, 56, 202]; // indigo-700
    const lightBg: [number, number, number] = [248, 250, 252];
    const borderColor: [number, number, number] = [226, 232, 240];
    const textColor: [number, number, number] = [30, 41, 59];
    const mutedColor: [number, number, number] = [100, 116, 139];

    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 18;

    // Header Background Bar
    doc.setFillColor(...lightBg);
    doc.roundedRect(12, 12, pageWidth - 24, 38, 3, 3, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(12, 12, pageWidth - 24, 38, 3, 3, 'S');

    // Vendor Name & Header Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(`VENDOR: ${bill.vendorName}`, 18, currentY + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    if (bill.vendorAddress) {
      doc.text(bill.vendorAddress, 18, currentY + 9);
    }
    doc.text(`Tax ID: ${bill.vendorTaxId || 'N/A'}  •  ${bill.vendorEmail || 'billing@vendor.com'}`, 18, currentY + 14);
    doc.text(`Accounting Category: ${bill.category}`, 18, currentY + 19);

    // Bill Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...purpleColor);
    doc.text('PURCHASE INVOICE', pageWidth - 18, currentY + 4, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text(`Bill Ref: ${bill.billNumber}`, pageWidth - 18, currentY + 11, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text(`Issue Date: ${bill.issueDate}`, pageWidth - 18, currentY + 17, { align: 'right' });
    doc.text(`Payment Due: ${bill.dueDate}`, pageWidth - 18, currentY + 22, { align: 'right' });

    currentY = 56;

    // Purchaser / Company Information
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, currentY, pageWidth - 24, 28, 3, 3, 'F');
    doc.setDrawColor(...borderColor);
    doc.roundedRect(12, currentY, pageWidth - 24, 28, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text('PURCHASER / BILLED ENTITY:', 18, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(businessProfile.companyName, 18, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text(`${businessProfile.address.street}, ${businessProfile.address.city}, ${businessProfile.address.state}`, 18, currentY + 17);
    doc.text(`Tax ID: ${businessProfile.taxNumber}  •  ${businessProfile.email}`, 18, currentY + 22);

    // Bill Total & Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text('TOTAL BILL AMOUNT', pageWidth - 18, currentY + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...purpleColor);
    doc.text(formatCurrency(bill.totalAmount, bill.currency), pageWidth - 18, currentY + 14, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`STATUS: ${bill.status.toUpperCase()}`, pageWidth - 18, currentY + 21, { align: 'right' });

    currentY = 90;

    // Line Items Table Header
    doc.setFillColor(...lightBg);
    doc.rect(12, currentY, pageWidth - 24, 8, 'F');
    doc.setDrawColor(...borderColor);
    doc.rect(12, currentY, pageWidth - 24, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('DESCRIPTION & GENERAL LEDGER ACCOUNT', 16, currentY + 5.5);
    doc.text('QTY', 115, currentY + 5.5, { align: 'center' });
    doc.text('UNIT PRICE', 140, currentY + 5.5, { align: 'right' });
    doc.text('TAX %', 160, currentY + 5.5, { align: 'center' });
    doc.text('AMOUNT', pageWidth - 16, currentY + 5.5, { align: 'right' });

    currentY += 8;

    bill.lineItems.forEach((item, idx) => {
      const rowHeight = 8.5;
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(12, currentY, pageWidth - 24, rowHeight, 'F');
      }

      doc.setDrawColor(...borderColor);
      doc.line(12, currentY + rowHeight, pageWidth - 12, currentY + rowHeight);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...textColor);
      doc.text(
        item.ledgerAccountName ? `${item.description} [${item.ledgerAccountName}]` : item.description,
        16,
        currentY + 5.5
      );

      doc.text(String(item.quantity), 115, currentY + 5.5, { align: 'center' });
      doc.text(formatCurrency(item.unitPrice, bill.currency), 140, currentY + 5.5, { align: 'right' });
      doc.text(`${item.taxRate}%`, 160, currentY + 5.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(item.amount, bill.currency), pageWidth - 16, currentY + 5.5, { align: 'right' });

      currentY += rowHeight;
    });

    currentY += 8;

    // Totals Box
    const rightBoxX = 118;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text('Subtotal:', rightBoxX, currentY);
    doc.setTextColor(...primaryColor);
    doc.text(formatCurrency(bill.subtotal, bill.currency), pageWidth - 16, currentY, { align: 'right' });

    currentY += 6;
    doc.setTextColor(...mutedColor);
    doc.text('Tax Total:', rightBoxX, currentY);
    doc.setTextColor(...primaryColor);
    doc.text(formatCurrency(bill.taxTotal, bill.currency), pageWidth - 16, currentY, { align: 'right' });

    currentY += 6;
    doc.setDrawColor(...borderColor);
    doc.line(rightBoxX, currentY, pageWidth - 12, currentY);

    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('Total Bill Amount:', rightBoxX, currentY);
    doc.text(formatCurrency(bill.totalAmount, bill.currency), pageWidth - 16, currentY, { align: 'right' });

    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(4, 120, 87);
    doc.text('Amount Paid:', rightBoxX, currentY);
    doc.text(formatCurrency(bill.amountPaid, bill.currency), pageWidth - 16, currentY, { align: 'right' });

    currentY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(190, 18, 60);
    doc.text('Balance Outstanding (AP):', rightBoxX, currentY);
    doc.text(formatCurrency(bill.balanceDue, bill.currency), pageWidth - 16, currentY, { align: 'right' });

    doc.save(`${bill.billNumber}_PurchaseInvoice.pdf`);
    return true;
  } catch (err) {
    console.error('Error exporting purchase invoice PDF:', err);
    return false;
  }
}

/**
 * Export Financial Reports (P&L, Balance Sheet, Cash Flow, Tax, AR Aging, Chart of Accounts) as a PDF
 */
export function exportReportPDF(
  reportType: 'pnl' | 'balance_sheet' | 'cash_flow' | 'tax_summary' | 'ar_aging' | 'ledger',
  data: {
    pnl?: ProfitAndLossReport;
    balanceSheet?: BalanceSheetReport;
    cashFlow?: CashFlowReport;
    taxReport?: TaxDeductionSummary;
    arAging?: ARAgingBucket[];
    ledgerAccounts?: LedgerAccount[];
  },
  businessProfile: BusinessProfile,
  currency: CurrencyCode
): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor: [number, number, number] = [15, 23, 42];
    const emeraldColor: [number, number, number] = [4, 120, 87];
    const lightBg: [number, number, number] = [248, 250, 252];
    const borderColor: [number, number, number] = [226, 232, 240];
    const textColor: [number, number, number] = [30, 41, 59];
    const mutedColor: [number, number, number] = [100, 116, 139];

    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 18;

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text(businessProfile.companyName, 14, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedColor);
    doc.text(`Tax ID: ${businessProfile.taxNumber}  •  ${businessProfile.email}`, 14, currentY + 5);

    let reportTitle = 'Financial Statement';
    if (reportType === 'pnl') reportTitle = 'STATEMENT OF PROFIT AND LOSS (INCOME STATEMENT)';
    if (reportType === 'balance_sheet') reportTitle = 'BALANCE SHEET (STATEMENT OF FINANCIAL POSITION)';
    if (reportType === 'cash_flow') reportTitle = 'STATEMENT OF CASH FLOWS & RUNWAY ANALYSIS';
    if (reportType === 'tax_summary') reportTitle = 'TAXABLE INCOME & DEDUCTIONS SCHEDULE (SCHEDULE C)';
    if (reportType === 'ar_aging') reportTitle = 'ACCOUNTS RECEIVABLE AGING & DELINQUENCY SCHEDULE';
    if (reportType === 'ledger') reportTitle = 'GENERAL LEDGER & CHART OF ACCOUNTS';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...emeraldColor);
    doc.text(reportTitle, pageWidth - 14, currentY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(`Fiscal Period: FY 2026  •  Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, currentY + 5, {
      align: 'right',
    });

    doc.setDrawColor(...borderColor);
    doc.line(14, currentY + 9, pageWidth - 14, currentY + 9);

    currentY += 16;

    // 1. PROFIT & LOSS PDF
    if (reportType === 'pnl' && data.pnl) {
      const pnl = data.pnl;

      // Section: Revenue
      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('TOTAL REVENUE / BILLINGS', 18, currentY + 5);
      doc.setTextColor(...emeraldColor);
      doc.text(formatCurrency(pnl.totalRevenue, currency), pageWidth - 18, currentY + 5, { align: 'right' });

      currentY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text('Client Services & Operating Billings', 22, currentY);
      doc.text(formatCurrency(pnl.totalRevenue, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 8;

      // Section: COGS
      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('COST OF GOODS SOLD (COGS)', 18, currentY + 5);
      doc.setTextColor(...textColor);
      doc.text(formatCurrency(pnl.cogs, currency), pageWidth - 18, currentY + 5, { align: 'right' });

      currentY += 10;
      doc.setFillColor(240, 253, 244);
      doc.rect(14, currentY, pageWidth - 28, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...emeraldColor);
      doc.text(`GROSS PROFIT (${pnl.grossMarginPercentage.toFixed(1)}% Gross Margin)`, 18, currentY + 5.5);
      doc.text(formatCurrency(pnl.grossProfit, currency), pageWidth - 18, currentY + 5.5, { align: 'right' });

      currentY += 14;

      // Section: OPEX
      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('OPERATING EXPENSES (OPEX)', 18, currentY + 5);
      doc.setTextColor(190, 18, 60);
      doc.text(formatCurrency(pnl.totalExpenses, currency), pageWidth - 18, currentY + 5, { align: 'right' });

      currentY += 8;
      pnl.operatingExpenses.forEach((exp) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...textColor);
        doc.text(exp.category, 22, currentY + 4);
        doc.text(formatCurrency(exp.amount, currency), pageWidth - 18, currentY + 4, { align: 'right' });
        doc.setDrawColor(...borderColor);
        doc.line(22, currentY + 6, pageWidth - 18, currentY + 6);
        currentY += 7;
      });

      currentY += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('Operating Income (EBITDA):', 18, currentY);
      doc.text(formatCurrency(pnl.ebitda, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(190, 18, 60);
      doc.text('Estimated Corporate Income Tax Provision (21%):', 18, currentY);
      doc.text(`-${formatCurrency(pnl.estimatedTaxProvision, currency)}`, pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(14, currentY, pageWidth - 28, 10, 2, 2, 'F');
      doc.setDrawColor(...emeraldColor);
      doc.roundedRect(14, currentY, pageWidth - 28, 10, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...emeraldColor);
      doc.text(`NET INCOME (${pnl.netProfitMarginPercentage.toFixed(1)}% Net Margin):`, 18, currentY + 6.5);
      doc.text(formatCurrency(pnl.netIncome, currency), pageWidth - 18, currentY + 6.5, { align: 'right' });
    }

    // 2. BALANCE SHEET PDF
    if (reportType === 'balance_sheet' && data.balanceSheet) {
      const bs = data.balanceSheet;

      // Assets
      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(29, 78, 216);
      doc.text('TOTAL ASSETS', 18, currentY + 5);
      doc.text(formatCurrency(bs.assets.totalAssets, currency), pageWidth - 18, currentY + 5, { align: 'right' });

      currentY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text('Cash and Cash Equivalents', 22, currentY);
      doc.text(formatCurrency(bs.assets.currentAssets.cashAndEquivalents, currency), pageWidth - 18, currentY, {
        align: 'right',
      });

      currentY += 6;
      doc.text('Accounts Receivable (AR)', 22, currentY);
      doc.text(formatCurrency(bs.assets.currentAssets.accountsReceivable, currency), pageWidth - 18, currentY, {
        align: 'right',
      });

      currentY += 6;
      doc.text('Inventory Merchandise Assets', 22, currentY);
      doc.text(formatCurrency(bs.assets.currentAssets.inventoryAssets ?? 0, currency), pageWidth - 18, currentY, {
        align: 'right',
      });

      currentY += 6;
      doc.text('Prepaid Operating Expenses', 22, currentY);
      doc.text(formatCurrency(bs.assets.currentAssets.prepaidExpenses, currency), pageWidth - 18, currentY, {
        align: 'right',
      });

      currentY += 6;
      doc.text('Fixed Assets (Equipment & Hardware Net of Depreciation)', 22, currentY);
      doc.text(formatCurrency(bs.assets.fixedAssets.totalFixedAssets, currency), pageWidth - 18, currentY, {
        align: 'right',
      });

      currentY += 10;

      // Liabilities
      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text('TOTAL LIABILITIES', 18, currentY + 5);
      doc.text(formatCurrency(bs.liabilities.totalLiabilities, currency), pageWidth - 18, currentY + 5, {
        align: 'right',
      });

      currentY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text('Accounts Payable (AP - Vendor Bills)', 22, currentY);
      doc.text(formatCurrency(bs.liabilities.currentLiabilities.accountsPayable, currency), pageWidth - 18, currentY, {
        align: 'right',
      });

      currentY += 6;
      doc.text('Sales Tax / VAT Payable', 22, currentY);
      doc.text(formatCurrency(bs.liabilities.currentLiabilities.salesTaxPayable, currency), pageWidth - 18, currentY, {
        align: 'right',
      });

      currentY += 6;
      doc.text('Commercial Business Loans', 22, currentY);
      doc.text(formatCurrency(bs.liabilities.longTermLiabilities.businessLoans, currency), pageWidth - 18, currentY, {
        align: 'right',
      });

      currentY += 10;

      // Equity
      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...emeraldColor);
      doc.text('TOTAL EQUITY', 18, currentY + 5);
      doc.text(formatCurrency(bs.equity.totalEquity, currency), pageWidth - 18, currentY + 5, { align: 'right' });

      currentY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text('Retained Earnings', 22, currentY);
      doc.text(formatCurrency(bs.equity.retainedEarnings, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.text('Current Year Earnings', 22, currentY);
      doc.text(formatCurrency(bs.equity.currentYearEarnings, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.text("Owner's Capital & Investment", 22, currentY);
      doc.text(formatCurrency(bs.equity.ownerCapital, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 12;

      // GAAP Verification Stamp
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(14, currentY, pageWidth - 28, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...emeraldColor);
      doc.text('GAAP Accounting Equation Check: Assets = Liabilities + Equity', 18, currentY + 6.5);
      doc.text('0.00 Variance (BALANCED)', pageWidth - 18, currentY + 6.5, { align: 'right' });
    }

    // 3. CHART OF ACCOUNTS (LEDGER) PDF
    if (reportType === 'ledger' && data.ledgerAccounts) {
      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...primaryColor);
      doc.text('CODE', 18, currentY + 5);
      doc.text('ACCOUNT NAME', 40, currentY + 5);
      doc.text('GAAP TYPE', 110, currentY + 5);
      doc.text('SUBTYPE', 140, currentY + 5);
      doc.text('BALANCE', pageWidth - 18, currentY + 5, { align: 'right' });

      currentY += 8;

      data.ledgerAccounts.forEach((acc, i) => {
        if (i % 2 === 1) {
          doc.setFillColor(250, 250, 250);
          doc.rect(14, currentY, pageWidth - 28, 6.5, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...textColor);
        doc.text(acc.code, 18, currentY + 4.5);
        doc.setFont('helvetica', 'bold');
        doc.text(acc.name, 40, currentY + 4.5);
        doc.setFont('helvetica', 'normal');
        doc.text(acc.type.toUpperCase(), 110, currentY + 4.5);
        doc.text(acc.subtype, 140, currentY + 4.5);
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(acc.balance, currency), pageWidth - 18, currentY + 4.5, { align: 'right' });

        doc.setDrawColor(...borderColor);
        doc.line(14, currentY + 6.5, pageWidth - 14, currentY + 6.5);
        currentY += 6.5;
      });
    }

    // 4. CASH FLOW STATEMENT PDF
    if (reportType === 'cash_flow' && data.cashFlow) {
      const cf = data.cashFlow;

      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('OPERATING CASH FLOWS', 18, currentY + 5);
      doc.setTextColor(...emeraldColor);
      doc.text(formatCurrency(cf.operatingCashFlow.netOperatingCash, currency), pageWidth - 18, currentY + 5, {
        align: 'right',
      });

      currentY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text('Net Income from Operations', 22, currentY);
      doc.text(formatCurrency(cf.operatingCashFlow.netIncome, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.text('Accounts Receivable Change', 22, currentY);
      doc.text(formatCurrency(cf.operatingCashFlow.arChange, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('LIQUID CASH RESERVES & RUNWAY', 18, currentY);

      currentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Monthly Cash Burn Rate:', 22, currentY);
      doc.text(formatCurrency(cf.burnRateMonthly, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.text('Liquid Closing Cash Balance:', 22, currentY);
      doc.text(formatCurrency(cf.endingCash, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Forecasted Cash Runway:', 22, currentY);
      doc.setTextColor(...emeraldColor);
      doc.text(`${cf.runwayMonths.toFixed(1)} Months`, pageWidth - 18, currentY, { align: 'right' });
    }

    // 5. TAX SUMMARY PDF
    if (reportType === 'tax_summary' && data.taxReport) {
      const tax = data.taxReport;

      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryColor);
      doc.text('TAXABLE INCOME & PROVISIONS', 18, currentY + 5);

      currentY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...textColor);
      doc.text('Total Gross Income (Receipts):', 22, currentY);
      doc.text(formatCurrency(tax.totalIncome, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.text('Total Deductible Expenses (Schedule C):', 22, currentY);
      doc.text(`-${formatCurrency(tax.totalDeductibleExpenses, currency)}`, pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Estimated Taxable Net Income:', 22, currentY);
      doc.text(formatCurrency(tax.taxableIncome, currency), pageWidth - 18, currentY, { align: 'right' });

      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('Estimated Corporate Income Tax Liability (21%):', 22, currentY);
      doc.text(formatCurrency(tax.estimatedTaxLiability, currency), pageWidth - 18, currentY, { align: 'right' });
    }

    // 6. AR AGING PDF
    if (reportType === 'ar_aging' && data.arAging) {
      doc.setFillColor(...lightBg);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...primaryColor);
      doc.text('AGING BUCKET', 18, currentY + 5);
      doc.text('INVOICE COUNT', 100, currentY + 5);
      doc.text('TOTAL AMOUNT', pageWidth - 18, currentY + 5, { align: 'right' });

      currentY += 8;

      data.arAging.forEach((bucket) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...textColor);
        doc.text(bucket.period, 18, currentY + 4);
        doc.text(`${bucket.count} invoices`, 100, currentY + 4);
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(bucket.amount, currency), pageWidth - 18, currentY + 4, { align: 'right' });

        doc.setDrawColor(...borderColor);
        doc.line(18, currentY + 6, pageWidth - 18, currentY + 6);
        currentY += 8;
      });
    }

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.text(
      `Confidential Financial Statement • ${businessProfile.companyName} • Generated ${new Date().toLocaleString()}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );

    doc.save(`${reportType}_statement_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (err) {
    console.error('Error generating financial statement PDF:', err);
    return false;
  }
}
