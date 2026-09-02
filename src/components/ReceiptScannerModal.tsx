import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { ExpenseCategory } from '../types';
import {
  X,
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const ReceiptScannerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { scanReceiptWithAI, addExpense, selectedCurrency } = useAccounting();

  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  // Sample Receipt Presets for one-click testing
  const sampleReceipts = [
    {
      title: 'AWS Cloud Hosting',
      category: 'Software & SaaS',
      url: 'https://images.unsplash.com/photo-1554415707-9e49019aab84?w=800&auto=format&fit=crop&q=80',
      sampleBase64: 'SAMPLE_AWS',
      textNote: 'Amazon Web Services - Monthly EC2 & S3 Infrastructure compute bill - Total $2,419.50',
    },
    {
      title: 'Client Strategy Dinner',
      category: 'Travel & Meals',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      sampleBase64: 'SAMPLE_DINNER',
      textNote: 'The Capital Grille - Business dinner with enterprise client partners - Total $384.20',
    },
    {
      title: 'Google Workspace',
      category: 'Software & SaaS',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      sampleBase64: 'SAMPLE_GSUITE',
      textNote: 'Google LLC - Google Workspace Enterprise 25 seats subscription - Total $450.00',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setPreviewImage(base64Data);
      runScan(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  const runScan = async (dataUri: string, mimeType: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    try {
      // Extract pure base64 without prefix if present
      const cleanBase64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
      const result = await scanReceiptWithAI(cleanBase64, mimeType || 'image/jpeg');

      if (result) {
        setExtractedData(result);
      } else {
        throw new Error('Could not parse receipt data.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'Error processing receipt with AI.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectSample = (sample: (typeof sampleReceipts)[0]) => {
    setPreviewImage(sample.url);
    setIsScanning(true);
    setErrorMsg(null);

    // Provide robust simulated or parsed OCR output for the preset
    setTimeout(() => {
      if (sample.title.includes('AWS')) {
        setExtractedData({
          merchantName: 'Amazon Web Services, Inc.',
          totalAmount: 2419.5,
          taxAmount: 180.25,
          date: new Date().toISOString().split('T')[0],
          category: 'Software & SaaS',
          confidenceScore: 0.98,
          taxDeductible: true,
          taxDeductiblePercentage: 100,
          currency: 'USD',
          lineItems: [
            { description: 'Amazon Elastic Compute Cloud (EC2)', amount: 1450.0 },
            { description: 'Amazon Simple Storage Service (S3)', amount: 569.25 },
            { description: 'CloudFront CDN egress traffic', amount: 220.0 },
          ],
          notes: 'Auto-scanned via Gemini 3.7 Flash OCR: AWS Cloud infrastructure bill for production servers.',
        });
      } else if (sample.title.includes('Dinner')) {
        setExtractedData({
          merchantName: 'The Capital Grille',
          totalAmount: 384.2,
          taxAmount: 32.5,
          date: new Date().toISOString().split('T')[0],
          category: 'Travel & Meals',
          confidenceScore: 0.95,
          taxDeductible: true,
          taxDeductiblePercentage: 50,
          currency: 'USD',
          lineItems: [
            { description: 'Executive Dinner Prix Fixe (x3)', amount: 310.0 },
            { description: 'Beverages & Coffee', amount: 41.7 },
          ],
          notes: 'Auto-scanned via Gemini 3.7 Flash OCR: 50% IRS Schedule C deductible business meal.',
        });
      } else {
        setExtractedData({
          merchantName: 'Google LLC',
          totalAmount: 450.0,
          taxAmount: 0.0,
          date: new Date().toISOString().split('T')[0],
          category: 'Software & SaaS',
          confidenceScore: 0.99,
          taxDeductible: true,
          taxDeductiblePercentage: 100,
          currency: 'USD',
          lineItems: [{ description: 'Google Workspace Enterprise (25 users)', amount: 450.0 }],
          notes: 'Auto-scanned via Gemini 3.7 Flash OCR: Google Workspace monthly seats.',
        });
      }
      setIsScanning(false);
    }, 900);
  };

  const handleImportToExpenses = () => {
    if (!extractedData) return;

    addExpense({
      expenseNumber: `EXP-${Date.now().toString().slice(-4)}`,
      payee: extractedData.merchantName || 'Unknown Vendor',
      amount: Number(extractedData.totalAmount) || 0,
      taxAmount: Number(extractedData.taxAmount) || 0,
      category: (extractedData.category as ExpenseCategory) || 'Software & SaaS',
      date: extractedData.date || new Date().toISOString().split('T')[0],
      paymentMethod: 'credit_card',
      taxDeductible: extractedData.taxDeductible ?? true,
      taxDeductiblePercentage: extractedData.taxDeductiblePercentage ?? 100,
      status: 'posted',
      referenceNumber: `REC-${Date.now().toString().slice(-4)}`,
      notes: extractedData.notes || `Scanned from receipt: ${extractedData.merchantName}`,
      receiptFileName: `${(extractedData.merchantName || 'receipt').toLowerCase().replace(/\s+/g, '_')}_scan.pdf`,
      receiptUrl: previewImage || undefined,
    });

    onClose();
    setExtractedData(null);
    setPreviewImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Smart Receipt & Invoice Scanner</span>
            </h3>
            <p className="text-xs text-slate-500">
              Powered by server-side Gemini 3.7 Flash Multimodal OCR
            </p>
          </div>

          <button
            onClick={() => {
              onClose();
              setExtractedData(null);
              setPreviewImage(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Upload Area / Sample selector */}
          {!extractedData && !isScanning && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500/60 bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                <UploadCloud className="w-10 h-10 text-emerald-600 mb-2" />
                <span className="font-bold text-slate-900 text-sm">Upload Receipt Image / PDF</span>
                <span className="text-slate-500 text-xs mt-1">
                  Drag & drop or click to browse (PNG, JPG, WEBP)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Or test with sample vendor receipts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {sampleReceipts.map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => handleSelectSample(s)}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl text-left transition-all hover:border-emerald-500/40 group shadow-xs"
                    >
                      <span className="font-bold text-slate-900 block text-xs group-hover:text-emerald-700">
                        {s.title}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 block">{s.category}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold mt-2 inline-flex items-center gap-1">
                        Scan Receipt <ArrowRight className="w-2.5 h-2.5 text-emerald-600" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scanning Progress Animation */}
          {isScanning && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 animate-spin">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Analyzing Receipt with Gemini 3.7 Flash...</h4>
                <p className="text-slate-500 text-xs mt-1">
                  Extracting vendor details, tax amounts, line items, and deductible classifications
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Extracted Data Card & Verification */}
          {extractedData && !isScanning && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Extraction Complete</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {Math.round((extractedData.confidenceScore || 0.95) * 100)}% Confidence
                  </span>
                </div>
                <button
                  onClick={() => {
                    setExtractedData(null);
                    setPreviewImage(null);
                  }}
                  className="text-slate-500 hover:text-slate-900 text-xs font-semibold"
                >
                  Scan Another
                </button>
              </div>

              {/* Extracted Fields Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Merchant / Payee</span>
                  <span className="font-bold text-slate-900 text-sm">{extractedData.merchantName}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Total Amount</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">
                    {formatCurrency(extractedData.totalAmount, selectedCurrency)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Tax / VAT</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {formatCurrency(extractedData.taxAmount || 0, selectedCurrency)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Date</span>
                  <span className="font-semibold text-slate-800 font-mono">{extractedData.date}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Category</span>
                  <span className="font-semibold text-slate-800">{extractedData.category}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Tax Deductible</span>
                  <span className="font-semibold text-emerald-700">
                    {extractedData.taxDeductiblePercentage || 100}% Rate
                  </span>
                </div>
              </div>

              {/* Line Items Extracted */}
              {Array.isArray(extractedData.lineItems) && extractedData.lineItems.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider block">
                    Extracted Line Items:
                  </span>
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {extractedData.lineItems.map((li: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 text-slate-700">{li.description}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(li.amount, selectedCurrency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {extractedData.notes && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-700 text-xs">
                  <strong className="text-slate-500 text-[10px] uppercase block mb-0.5 font-semibold">AI Analysis:</strong>
                  {extractedData.notes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              setExtractedData(null);
              setPreviewImage(null);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>

          {extractedData && (
            <button
              type="button"
              onClick={handleImportToExpenses}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
              <span>Import to Expenses</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
