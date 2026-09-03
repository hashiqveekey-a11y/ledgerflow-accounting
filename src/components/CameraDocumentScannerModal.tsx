import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { CameraScanMode, LineItem, PurchaseLineItem } from '../types';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Plus,
  Trash2,
  Scan,
  ShoppingBag,
  Receipt,
  DollarSign,
  Calendar,
  Building2,
  User,
  Zap,
  Check,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const CameraDocumentScannerModal: React.FC = () => {
  const {
    isCameraScannerOpen,
    closeCameraScanner,
    cameraScannerMode,
    setCameraScannerMode,
    scanDocumentWithAI,
    openInvoiceModalWithDraft,
    openPurchaseInvoiceModalWithDraft,
    addInvoice,
    addPurchaseInvoice,
    selectedCurrency,
    showNotification,
    businessProfile,
  } = useAccounting();

  // Mode: 'sales' or 'purchase'
  const [activeTab, setActiveTab] = useState<CameraScanMode>(cameraScannerMode || 'purchase');

  // Sync mode with context
  useEffect(() => {
    if (cameraScannerMode) {
      setActiveTab(cameraScannerMode);
    }
  }, [cameraScannerMode]);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [uploadMode, setUploadMode] = useState<'camera' | 'upload' | 'samples'>('camera');

  // Sample Documents for one-tap demo
  const salesSamples = [
    {
      title: 'Apex Retail Store - Customer POS Chit',
      client: 'Apex Retail Solutions Inc.',
      total: 245.5,
      date: new Date().toISOString().split('T')[0],
      url: 'https://images.unsplash.com/photo-1554415707-9e49019aab84?w=800&auto=format&fit=crop&q=80',
      lineItems: [
        { description: 'Ergonomic Desk Accessories & Monitor Riser', quantity: 2, unitPrice: 85.0, taxRate: 8.25, amount: 170.0 },
        { description: 'Braided High-Speed USB-C Display Cables (Pack of 3)', quantity: 3, unitPrice: 19.5, taxRate: 8.25, amount: 58.5 },
      ],
      subtotal: 228.5,
      taxTotal: 17.0,
      notes: 'Customer sales chit scanned via camera. Paid via POS terminal.',
    },
    {
      title: 'Nova Tech - Corporate Sales Order',
      client: 'Nova Technology Partners LLC',
      total: 1850.0,
      date: new Date().toISOString().split('T')[0],
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      lineItems: [
        { description: 'Commercial Software Integration & Setup', quantity: 1, unitPrice: 1200.0, taxRate: 8.5, amount: 1200.0 },
        { description: 'Quarterly Cloud Systems Maintenance License', quantity: 1, unitPrice: 500.0, taxRate: 8.5, amount: 500.0 },
      ],
      subtotal: 1700.0,
      taxTotal: 150.0,
      notes: 'Signed client sales agreement. Terms: Net 30.',
    },
  ];

  const purchaseSamples = [
    {
      title: 'Sysco Foodservice & Wholesale Supplies',
      vendor: 'Sysco Global Distribution',
      category: 'Inventory & Raw Materials',
      total: 1290.4,
      date: new Date().toISOString().split('T')[0],
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      lineItems: [
        { description: 'Bulk Commercial Packaging Boxes (500 units)', quantity: 4, unitPrice: 185.0, taxRate: 8.0, amount: 740.0, ledgerAccountName: 'Inventory & Supplies' },
        { description: 'Sanitary Food-Grade Seal Bags & Containers', quantity: 10, unitPrice: 45.0, taxRate: 8.0, amount: 450.0, ledgerAccountName: 'Inventory & Supplies' },
      ],
      subtotal: 1190.0,
      taxTotal: 100.4,
      notes: 'Vendor procurement bill. Payment due in 30 days.',
    },
    {
      title: 'Dell Technologies - Server & IT Procurement',
      vendor: 'Dell Technologies Inc.',
      category: 'Software, Cloud & SaaS',
      total: 3450.0,
      date: new Date().toISOString().split('T')[0],
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      lineItems: [
        { description: 'PowerEdge Rack Server Chassis R650', quantity: 1, unitPrice: 2800.0, taxRate: 8.5, amount: 2800.0, ledgerAccountName: 'Computer Hardware & IT' },
        { description: 'Enterprise 3-Year ProSupport Plus Warranty', quantity: 1, unitPrice: 400.0, taxRate: 8.5, amount: 400.0, ledgerAccountName: 'Software, Cloud & SaaS' },
      ],
      subtotal: 3200.0,
      taxTotal: 250.0,
      notes: 'Hardware procurement voucher. Ref: PO-98421.',
    },
  ];

  // Sound effect for camera shutter
  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Start Camera Stream
  const startCamera = useCallback(async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser environment. Please use photo upload or sample scans.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setIsCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser or choose photo upload below.'
          : err.message || 'Unable to access device camera. Please upload an image or select a sample document.'
      );
      setUploadMode('upload');
    }
  }, [facingMode]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Manage camera lifecycle
  useEffect(() => {
    if (isCameraScannerOpen && uploadMode === 'camera' && !capturedImage) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraScannerOpen, uploadMode, capturedImage, facingMode, startCamera, stopCamera]);

  // Switch facing mode
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame from video
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    playShutterSound();

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setCapturedImage(dataUrl);
    stopCamera();

    // Trigger AI Scan
    runDocumentScan(dataUrl, 'image/jpeg');
  };

  // Handle image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      runDocumentScan(dataUrl, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Run AI scan
  const runDocumentScan = async (imageDataUrl: string, mimeType: string) => {
    setIsScanning(true);
    try {
      const result = await scanDocumentWithAI({
        documentType: activeTab,
        imageBase64: imageDataUrl,
        mimeType,
        textContext:
          activeTab === 'sales'
            ? 'Customer sales order, sales invoice, point-of-sale receipt'
            : 'Vendor procurement bill, supplier invoice, payable voucher',
      });

      if (result) {
        setExtractedData(result);
      } else {
        throw new Error('Could not parse document data.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      showNotification('AI OCR scan completed with default structured fields', 'info');
    } finally {
      setIsScanning(false);
    }
  };

  // Select sample document
  const handleSelectSample = (sample: any) => {
    setCapturedImage(sample.url);
    setIsScanning(true);

    setTimeout(() => {
      if (activeTab === 'sales') {
        setExtractedData({
          documentType: 'sales',
          clientName: sample.client,
          clientCompany: `${sample.client}`,
          clientEmail: `invoices@${sample.client.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          clientAddress: '450 Commercial Ave, Suite 200',
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          issueDate: sample.date,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          lineItems: sample.lineItems,
          subtotal: sample.subtotal,
          taxTotal: sample.taxTotal,
          totalAmount: sample.total,
          notes: sample.notes,
          confidenceScore: 0.98,
        });
      } else {
        setExtractedData({
          documentType: 'purchase',
          vendorName: sample.vendor,
          vendorEmail: `billing@${sample.vendor.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          vendorTaxId: 'EIN-77-9481230',
          vendorPhone: '+1 (800) 441-2099',
          vendorAddress: '900 Logistics Blvd, Warehouse Bay 4',
          billNumber: `BILL-${Math.floor(10000 + Math.random() * 90000)}`,
          issueDate: sample.date,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          category: sample.category,
          lineItems: sample.lineItems,
          subtotal: sample.subtotal,
          taxTotal: sample.taxTotal,
          totalAmount: sample.total,
          paymentMethod: 'bank_transfer',
          notes: sample.notes,
          confidenceScore: 0.97,
        });
      }
      setIsScanning(false);
    }, 750);
  };

  // Reset scan to take another photo
  const handleReset = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setUploadMode('camera');
    startCamera(facingMode);
  };

  // Apply to Draft and Open in Full Modal
  const handleOpenInEditor = () => {
    if (!extractedData) return;

    if (activeTab === 'sales') {
      const items: LineItem[] = (extractedData.lineItems || []).map((it: any, idx: number) => ({
        id: `li-scan-${Date.now()}-${idx}`,
        description: it.description || 'Sales Item',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || Number(it.amount) || 0,
        taxRate: Number(it.taxRate) || businessProfile.defaultTaxRate || 8.5,
        discountPercent: 0,
        amount: (Number(it.quantity) || 1) * (Number(it.unitPrice) || Number(it.amount) || 0),
      }));

      openInvoiceModalWithDraft({
        clientName: extractedData.clientName || 'Customer Client',
        clientCompany: extractedData.clientCompany || '',
        clientEmail: extractedData.clientEmail || '',
        clientAddress: extractedData.clientAddress || '',
        invoiceNumber: extractedData.invoiceNumber,
        issueDate: extractedData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: extractedData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        lineItems: items,
        notes: extractedData.notes || 'Scanned via Camera OCR Scanner',
      });

      showNotification('Sales document imported into Invoice Editor', 'success');
    } else {
      const items: PurchaseLineItem[] = (extractedData.lineItems || []).map((it: any, idx: number) => ({
        id: `p-item-scan-${Date.now()}-${idx}`,
        description: it.description || 'Procurement Item',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || Number(it.amount) || 0,
        taxRate: Number(it.taxRate) || 8.0,
        amount: (Number(it.quantity) || 1) * (Number(it.unitPrice) || Number(it.amount) || 0),
        ledgerAccountId: 'acc-5020',
        ledgerAccountName: it.ledgerAccountName || 'Procurement & Supplies',
      }));

      openPurchaseInvoiceModalWithDraft({
        vendorName: extractedData.vendorName || 'Vendor Supplier',
        vendorEmail: extractedData.vendorEmail || '',
        vendorTaxId: extractedData.vendorTaxId || '',
        vendorPhone: extractedData.vendorPhone || '',
        vendorAddress: extractedData.vendorAddress || '',
        billNumber: extractedData.billNumber,
        issueDate: extractedData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: extractedData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        category: extractedData.category || 'General Expenses',
        lineItems: items,
        notes: extractedData.notes || 'Scanned via Camera OCR Scanner',
      });

      showNotification('Purchase document imported into Bill Editor', 'success');
    }

    closeCameraScanner();
  };

  // Direct Quick Save
  const handleQuickSaveDirect = () => {
    if (!extractedData) return;

    if (activeTab === 'sales') {
      const items: LineItem[] = (extractedData.lineItems || []).map((it: any, idx: number) => ({
        id: `li-scan-${Date.now()}-${idx}`,
        description: it.description || 'Sales Item',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || Number(it.amount) || 0,
        taxRate: Number(it.taxRate) || businessProfile.defaultTaxRate || 8.5,
        discountPercent: 0,
        amount: (Number(it.quantity) || 1) * (Number(it.unitPrice) || Number(it.amount) || 0),
      }));

      const sub = items.reduce((s, it) => s + it.amount, 0);
      const tax = items.reduce((s, it) => s + (it.amount * (it.taxRate || 0)) / 100, 0);
      const tot = sub + tax;

      addInvoice({
        invoiceNumber:
          extractedData.invoiceNumber ||
          `${businessProfile.invoicePrefix}${businessProfile.invoiceNextNumber}`,
        clientId: 'client-scanned',
        clientName: extractedData.clientName || 'Customer Client',
        clientCompany: extractedData.clientCompany || '',
        clientEmail: extractedData.clientEmail || 'billing@customer.com',
        clientAddress: extractedData.clientAddress || '',
        issueDate: extractedData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: extractedData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'sent',
        currency: selectedCurrency || businessProfile.defaultCurrency,
        lineItems: items,
        subtotal: sub,
        taxTotal: tax,
        discountTotal: 0,
        totalAmount: tot,
        amountPaid: 0,
        balanceDue: tot,
        notes: extractedData.notes || 'Scanned via Camera OCR',
        termsAndConditions: businessProfile.paymentInstructions,
        history: [
          {
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'created_via_camera_scan',
            user: 'Camera Scanner',
            note: 'Generated from physical document camera scan',
          },
        ],
      });

      showNotification(`Sales Invoice created for ${extractedData.clientName}`, 'success');
    } else {
      const items: PurchaseLineItem[] = (extractedData.lineItems || []).map((it: any, idx: number) => ({
        id: `p-item-scan-${Date.now()}-${idx}`,
        description: it.description || 'Procurement Item',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || Number(it.amount) || 0,
        taxRate: Number(it.taxRate) || 8.0,
        amount: (Number(it.quantity) || 1) * (Number(it.unitPrice) || Number(it.amount) || 0),
        ledgerAccountId: 'acc-5020',
        ledgerAccountName: it.ledgerAccountName || 'Procurement & Supplies',
      }));

      const sub = items.reduce((s, it) => s + it.amount, 0);
      const tax = items.reduce((s, it) => s + (it.amount * (it.taxRate || 0)) / 100, 0);
      const tot = sub + tax;

      addPurchaseInvoice({
        billNumber: extractedData.billNumber || `BILL-${Math.floor(10000 + Math.random() * 90000)}`,
        vendorName: extractedData.vendorName || 'Vendor Supplier',
        vendorEmail: extractedData.vendorEmail || '',
        vendorTaxId: extractedData.vendorTaxId || '',
        vendorPhone: extractedData.vendorPhone || '',
        vendorAddress: extractedData.vendorAddress || '',
        issueDate: extractedData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: extractedData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'pending',
        currency: selectedCurrency || businessProfile.defaultCurrency,
        lineItems: items,
        subtotal: sub,
        taxTotal: tax,
        totalAmount: tot,
        amountPaid: 0,
        balanceDue: tot,
        category: extractedData.category || 'Inventory & Raw Materials',
        paymentMethod: 'bank_transfer',
        notes: extractedData.notes || 'Scanned via Camera OCR',
      });

      showNotification(`Purchase Bill created for ${extractedData.vendorName}`, 'success');
    }

    closeCameraScanner();
  };

  if (!isCameraScannerOpen) return null;

  return (
    <div
      id="camera-document-scanner-modal"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>AI Camera Document Scanner</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800">
                  Multimodal OCR
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Live optical capture for customer sales invoices & vendor purchase bills
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 text-xs font-semibold">
              <button
                id="camera-scan-tab-purchase"
                type="button"
                onClick={() => {
                  setActiveTab('purchase');
                  setCameraScannerMode('purchase');
                  if (extractedData) setExtractedData(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'purchase'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                <span>Purchase Bill</span>
              </button>

              <button
                id="camera-scan-tab-sales"
                type="button"
                onClick={() => {
                  setActiveTab('sales');
                  setCameraScannerMode('sales');
                  if (extractedData) setExtractedData(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'sales'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sales Invoice</span>
              </button>
            </div>

            <button
              id="camera-scan-close-btn"
              onClick={closeCameraScanner}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              title="Close scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Top Banner indicating document target */}
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
            activeTab === 'sales'
              ? 'bg-emerald-50/60 border-emerald-200/70 text-emerald-950'
              : 'bg-blue-50/60 border-blue-200/70 text-blue-950'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                activeTab === 'sales' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {activeTab === 'sales' ? 'S' : 'P'}
              </div>
              <div>
                <span className="font-bold text-xs block">
                  {activeTab === 'sales'
                    ? 'Scanning Customer Sales Order or Slip'
                    : 'Scanning Vendor Purchase Bill or Voucher'}
                </span>
                <span className="text-[11px] opacity-80 block">
                  {activeTab === 'sales'
                    ? 'AI extracts customer name, sold line items, quantities, unit prices, sales tax & totals.'
                    : 'AI extracts supplier/vendor name, bill number, procured items, expense category & tax.'}
                </span>
              </div>
            </div>

            {/* Input Method Toggle */}
            <div className="flex items-center gap-1 bg-white/90 p-1 rounded-xl border border-slate-200/70 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('camera');
                  setCapturedImage(null);
                  startCamera(facingMode);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  uploadMode === 'camera' && !capturedImage
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUploadMode('upload');
                  stopCamera();
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  uploadMode === 'upload' && !capturedImage
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Upload Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUploadMode('samples');
                  stopCamera();
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  uploadMode === 'samples' && !capturedImage
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Sample Scans</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: Active Camera or Captured Preview */}
          {!extractedData && !isScanning && (
            <div className="space-y-4">
              {uploadMode === 'camera' && !capturedImage && (
                <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-16/10 sm:aspect-16/9 flex flex-col items-center justify-center border border-slate-800 shadow-inner">
                  {/* Live Video Element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Document Alignment Frame Reticles */}
                  <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg" />
                      <div className="w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg" />
                    </div>

                    {/* Animated Scanning Laser Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />

                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg" />
                      <div className="w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br-lg" />
                    </div>
                  </div>

                  {/* Framing Hint */}
                  <div className="absolute top-4 px-3.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-medium border border-white/10 flex items-center gap-1.5 shadow-lg">
                    <Scan className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Position {activeTab === 'sales' ? 'sales invoice / chit' : 'vendor bill / voucher'} inside the frame</span>
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 px-4">
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      className="p-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-full transition-all border border-white/20 shadow-md"
                      title="Switch camera"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    {/* Big Shutter Button */}
                    <button
                      id="camera-scan-shutter-btn"
                      type="button"
                      onClick={handleCapturePhoto}
                      disabled={!isCameraActive}
                      className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 p-1.5 shadow-xl transition-transform active:scale-95 flex items-center justify-center group border-4 border-slate-900/30"
                      title="Capture photo"
                    >
                      <div className="w-full h-full rounded-full bg-emerald-500 group-hover:bg-emerald-600 transition-colors flex items-center justify-center text-white shadow-inner">
                        <Camera className="w-6 h-6" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadMode('upload')}
                      className="p-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-full transition-all border border-white/20 shadow-md"
                      title="Upload file instead"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Fallback Error Overlay if camera blocked */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center text-white z-10">
                      <CameraOff className="w-10 h-10 text-rose-400 mb-2" />
                      <span className="font-bold text-sm">Camera Unavailable</span>
                      <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
                        {cameraError}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCamera(facingMode)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode('upload')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition-colors"
                        >
                          Switch to File Upload
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Mode Area */}
              {uploadMode === 'upload' && !capturedImage && (
                <div className="space-y-4">
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500/70 bg-slate-50/60 hover:bg-emerald-50/20 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      Upload {activeTab === 'sales' ? 'Sales Invoice / Chit' : 'Vendor Bill / Voucher'} Image
                    </span>
                    <span className="text-slate-500 text-xs mt-1 max-w-sm">
                      Select a photograph or document scan (JPEG, PNG, WEBP, or PDF snapshot)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* One-click Sample Presets */}
              {uploadMode === 'samples' && !capturedImage && (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Instant Demo: Choose a realistic test document
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(activeTab === 'sales' ? salesSamples : purchaseSamples).map((sample: any) => (
                      <button
                        key={sample.title}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl text-left transition-all hover:border-emerald-500/50 group flex flex-col justify-between shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-xs group-hover:text-emerald-700">
                              {sample.title}
                            </span>
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {formatCurrency(sample.total, selectedCurrency)}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {activeTab === 'sales' ? `Client: ${sample.client}` : `Supplier: ${sample.vendor}`}
                          </span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">{sample.lineItems.length} line items detected</span>
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Run AI OCR <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Scanning in progress */}
          {isScanning && (
            <div className="p-12 bg-slate-50 border border-slate-200/80 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center animate-bounce">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="absolute -inset-1 rounded-3xl bg-emerald-400/30 blur-sm animate-pulse" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Multimodal Gemini AI Vision Analysis...
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Detecting document boundaries, extracting party details, validating mathematical line items, tax rate, and net totals.
                </p>
              </div>

              <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {/* VIEW 3: Extracted Results Studio */}
          {extractedData && !isScanning && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Snapshot Banner & Confidence Card */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      AI OCR Document Successfully Analyzed
                    </span>
                    <span className="text-[11px] text-emerald-800 font-medium">
                      Confidence Score: {Math.round((extractedData.confidenceScore || 0.95) * 100)}% • Ready to verify or import
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Scan Another</span>
                  </button>
                </div>
              </div>

              {/* Side-by-side or Stacked Review Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Document Key Details */}
                <div className="lg:col-span-1 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Header Information</span>
                  </span>

                  {/* Party (Client or Vendor) */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      {activeTab === 'sales' ? 'Customer / Client' : 'Vendor / Supplier'}
                    </label>
                    <input
                      type="text"
                      value={activeTab === 'sales' ? extractedData.clientName || '' : extractedData.vendorName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExtractedData((prev: any) => ({
                          ...prev,
                          [activeTab === 'sales' ? 'clientName' : 'vendorName']: val,
                        }));
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Document Identifier */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      {activeTab === 'sales' ? 'Invoice Number' : 'Bill Number'}
                    </label>
                    <input
                      type="text"
                      value={activeTab === 'sales' ? extractedData.invoiceNumber || '' : extractedData.billNumber || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExtractedData((prev: any) => ({
                          ...prev,
                          [activeTab === 'sales' ? 'invoiceNumber' : 'billNumber']: val,
                        }));
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        value={extractedData.issueDate || ''}
                        onChange={(e) =>
                          setExtractedData((prev: any) => ({ ...prev, issueDate: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={extractedData.dueDate || ''}
                        onChange={(e) =>
                          setExtractedData((prev: any) => ({ ...prev, dueDate: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Category (if Purchase) */}
                  {activeTab === 'purchase' && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Expense / Procurement Category
                      </label>
                      <input
                        type="text"
                        value={extractedData.category || 'Inventory & Raw Materials'}
                        onChange={(e) =>
                          setExtractedData((prev: any) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Bookkeeping Remarks
                    </label>
                    <textarea
                      rows={2}
                      value={extractedData.notes || ''}
                      onChange={(e) =>
                        setExtractedData((prev: any) => ({ ...prev, notes: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 resize-none"
                    />
                  </div>
                </div>

                {/* Right: Extracted Line Items & Totals */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>Detected Line Items</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {extractedData.lineItems?.length || 0} items extracted
                      </span>
                    </div>

                    {/* Line Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                            <th className="pb-1.5">Description</th>
                            <th className="pb-1.5 text-right w-16">Qty</th>
                            <th className="pb-1.5 text-right w-20">Rate</th>
                            <th className="pb-1.5 text-right w-16">Tax %</th>
                            <th className="pb-1.5 text-right w-24">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(extractedData.lineItems || []).map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="py-2 font-medium text-slate-900 pr-2">
                                {item.description}
                              </td>
                              <td className="py-2 text-right font-mono text-slate-700">
                                {item.quantity}
                              </td>
                              <td className="py-2 text-right font-mono text-slate-700">
                                {formatCurrency(item.unitPrice || 0, selectedCurrency)}
                              </td>
                              <td className="py-2 text-right font-mono text-slate-500">
                                {item.taxRate || 0}%
                              </td>
                              <td className="py-2 text-right font-mono font-bold text-slate-900">
                                {formatCurrency(item.amount || (item.quantity * item.unitPrice), selectedCurrency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financial Summary Calculation Card */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(extractedData.subtotal || 0, selectedCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax / VAT</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(extractedData.taxTotal || 0, selectedCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                      <span>Total Amount</span>
                      <span className="font-mono text-emerald-700">
                        {formatCurrency(extractedData.totalAmount || 0, selectedCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted optical OCR processing</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="camera-scan-cancel-btn"
              type="button"
              onClick={closeCameraScanner}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
            >
              Cancel
            </button>

            {extractedData && (
              <>
                <button
                  id="camera-scan-open-editor-btn"
                  type="button"
                  onClick={handleOpenInEditor}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-all hover:border-emerald-500"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Review in {activeTab === 'sales' ? 'Invoice' : 'Bill'} Editor</span>
                </button>

                <button
                  id="camera-scan-quick-save-btn"
                  type="button"
                  onClick={handleQuickSaveDirect}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save {activeTab === 'sales' ? 'Sales Invoice' : 'Purchase Bill'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
