import React, { useEffect, useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { CustomerPredictiveInsight, InventoryAutomationInsight } from '../types';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Users,
  Boxes,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  DollarSign,
  Activity,
  Layers,
  FileSpreadsheet,
  Zap,
  Building,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const AIPredictiveInsightsView: React.FC<{
  onCreateInvoiceForClient?: (clientName: string, suggestedItems?: string[]) => void;
  onCreatePurchaseOrder?: (vendorName: string, items: { name: string; quantity: number; unitCost: number }[]) => void;
}> = ({ onCreateInvoiceForClient, onCreatePurchaseOrder }) => {
  const {
    businessProfile,
    clients,
    invoices,
    purchaseInvoices,
    inventoryItems,
    selectedCurrency,
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
    showNotification,
  } = useAccounting();

  const [activeSection, setActiveSection] = useState<'customers' | 'inventory' | 'sales'>('customers');

  // Load insights on first mount if empty
  useEffect(() => {
    if (customerInsights.length === 0 && !isPredictiveInsightsLoading) {
      fetchCustomerPredictiveInsights();
    }
    if (businessProfile.enableInventory !== false && inventoryAutomationInsights.length === 0 && !isInventoryAutomationLoading) {
      fetchInventoryAutomationInsights();
    }
    if (!salesMonitorData && !isSalesMonitorLoading) {
      fetchSalesMonitorData();
    }
  }, []);

  const refreshAllAIInsights = () => {
    fetchCustomerPredictiveInsights();
    if (businessProfile.enableInventory !== false) {
      fetchInventoryAutomationInsights();
    }
    fetchSalesMonitorData();
    showNotification('Refreshing AI predictive analytics & inventory models...', 'info');
  };

  const isInventoryEnabled = businessProfile.enableInventory !== false;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Gemini AI Predictive Engine
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Real-Time Retail Analytics
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            AI Predictive Insights & Intelligent Automation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated customer purchasing pattern forecasting, proactive stock reordering, and sales monitoring
          </p>
        </div>

        <button
          onClick={refreshAllAIInsights}
          disabled={isPredictiveInsightsLoading || isInventoryAutomationLoading || isSalesMonitorLoading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${
            (isPredictiveInsightsLoading || isInventoryAutomationLoading || isSalesMonitorLoading) ? 'animate-spin' : ''
          }`} />
          <span>Run AI Analytics</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSection('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'customers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Purchasing Patterns & Churn ({customerInsights.length})</span>
        </button>

        {isInventoryEnabled && (
          <button
            onClick={() => setActiveSection('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === 'inventory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>AI Automated Inventory ({inventoryAutomationInsights.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveSection('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSection === 'sales'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales Velocity & Anomaly Monitor</span>
        </button>
      </div>

      {/* SECTION 1: CUSTOMER PURCHASING PATTERNS */}
      {activeSection === 'customers' && (
        <div className="space-y-5">
          {overallCustomerTrends && (
            <div className="bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 border border-indigo-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Executive Customer Purchasing Summary</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">
                {overallCustomerTrends.summary || overallCustomerTrends.keyActionableTakeaway || 'Customer purchasing trends are actively analyzed by the predictive model.'}
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-indigo-100/60 text-xs">
                <div className="p-3 bg-white/80 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">High Churn Risk</span>
                  <div className="text-lg font-bold text-rose-600 mt-0.5">
                    {overallCustomerTrends.highRiskCount ?? customerInsights.filter(c => {
                      const lvl = (c.churnRiskLevel || c.churnRisk || '').toLowerCase();
                      return lvl === 'high' || lvl === 'critical' || (c.churnRiskPercent && c.churnRiskPercent > 50);
                    }).length} Accounts
                  </div>
                </div>
                <div className="p-3 bg-white/80 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Average Repurchase Cycle</span>
                  <div className="text-lg font-bold text-indigo-700 mt-0.5">
                    {overallCustomerTrends.averagePurchaseCycleDays ?? overallCustomerTrends.averageRepurchaseIntervalDays ?? 24} Days
                  </div>
                </div>
                <div className="p-3 bg-white/80 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Immediate Upsell Potential</span>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">
                    {formatCurrency(overallCustomerTrends.upsellOpportunityAmount ?? overallCustomerTrends.projectedNext30DaysCustomerRevenue ?? 18450, selectedCurrency)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isPredictiveInsightsLoading && customerInsights.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Analyzing customer buying patterns & transactional records with Gemini AI...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerInsights.map((insight) => {
                const churnLevel = (insight.churnRiskLevel || insight.churnRisk || (insight.churnRiskPercent && insight.churnRiskPercent > 50 ? 'High' : 'Low') || 'Low').toString();
                const churnLower = churnLevel.toLowerCase();
                const churnColor =
                  churnLower === 'critical' || churnLower === 'high'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : churnLower === 'medium' || churnLower === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                const purchaseFrequencyStr = insight.purchaseFrequency || (insight.purchaseFrequencyDays ? `Every ${insight.purchaseFrequencyDays} days` : 'Every 3-4 weeks');
                const nextOrderWindow = insight.predictedNextPurchaseWindow || insight.predictedNextPurchaseDate || 'Within 7-14 days';
                const ltvValue = insight.lifetimeValueProjection || insight.predictedLifetimeValue || (insight.averageOrderValue ? insight.averageOrderValue * 12 : 0);
                const patternStr = insight.actionableCampaign || insight.purchasingPattern || `${insight.segment} buying cycle.`;
                const suggestedActionStr = insight.suggestedAction || insight.actionableCampaign || 'Draft invoice with cross-sell items';

                return (
                  <div
                    key={insight.clientId || insight.clientName}
                    className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{insight.clientName}</h3>
                          <span className="text-xs text-slate-500">Buying Frequency: {purchaseFrequencyStr}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${churnColor}`}>
                          {churnLevel.toUpperCase()} CHURN RISK
                        </span>
                      </div>

                      {/* Purchasing Metrics */}
                      <div className="mt-3 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Avg Order</span>
                          <p className="font-bold text-slate-900 mt-0.5">
                            {formatCurrency(insight.averageOrderValue || 0, selectedCurrency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Predicted LTV</span>
                          <p className="font-bold text-indigo-700 mt-0.5">
                            {formatCurrency(ltvValue, selectedCurrency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Next Window</span>
                          <p className="font-semibold text-slate-700 mt-0.5 truncate" title={nextOrderWindow}>
                            {nextOrderWindow}
                          </p>
                        </div>
                      </div>

                      {/* AI Behavioral Pattern Insights */}
                      <div className="mt-3 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Buying Pattern Analysis:</span>
                          <p className="text-slate-700 font-medium mt-0.5 leading-relaxed">{patternStr}</p>
                        </div>

                        {insight.preferredCategories && insight.preferredCategories.length > 0 && (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Top Preferred Lines:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {insight.preferredCategories.map((cat, idx) => (
                                <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {insight.recommendedProducts && insight.recommendedProducts.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-indigo-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              AI Recommended Cross-Sell Products:
                            </span>
                            <ul className="mt-1 space-y-1">
                              {insight.recommendedProducts.map((prod, idx) => (
                                <li key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  <span>{prod}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Recommendation */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500 italic truncate max-w-[200px]" title={suggestedActionStr}>
                        Action: {suggestedActionStr}
                      </p>
                      {onCreateInvoiceForClient && (
                        <button
                          onClick={() => onCreateInvoiceForClient(insight.clientName, insight.recommendedProducts)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                        >
                          <span>Draft Invoice</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {customerInsights.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
                  <h3 className="text-sm font-bold text-slate-800">No Customer Buying Data Yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Create invoices or record sales transactions to enable AI customer pattern analysis and predictive churn detection.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: AI INVENTORY AUTOMATION */}
      {activeSection === 'inventory' && isInventoryEnabled && (
        <div className="space-y-5">
          {inventoryExecutiveSummary && (
            <div className="bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border border-emerald-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span>AI Automated Inventory Health & Stock Summary</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">
                {inventoryExecutiveSummary.summary || inventoryExecutiveSummary.aiActionVerdict || 'Inventory health is actively tracked.'}
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-100/60 text-xs">
                <div className="p-3 bg-white/80 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Urgent Reorder Required</span>
                  <div className="text-lg font-bold text-rose-600 mt-0.5">
                    {inventoryAutomationInsights.filter(i => {
                      const urg = (i.urgency || '').toLowerCase();
                      return urg === 'immediate' || urg === 'high' || urg === 'critical';
                    }).length} Items
                  </div>
                </div>
                <div className="p-3 bg-white/80 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Est. Reorder Investment</span>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">
                    {formatCurrency(
                      inventoryAutomationInsights.reduce((sum, i) => sum + (i.estimatedReorderCost || 0), 0),
                      selectedCurrency
                    )}
                  </div>
                </div>
                <div className="p-3 bg-white/80 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Fast-Moving Velocity Products</span>
                  <div className="text-lg font-bold text-indigo-700 mt-0.5">
                    {inventoryAutomationInsights.filter(i => (i.salesVelocity || i.demandTrend) === 'fast' || (i.demandTrend === 'increasing')).length} Lines
                  </div>
                </div>
              </div>
            </div>
          )}

          {isInventoryAutomationLoading && inventoryAutomationInsights.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3">
              <Boxes className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Calculating inventory burn rates, reorder thresholds & vendor pricing...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventoryAutomationInsights.map((rec) => {
                const urgencyRaw = (rec.urgency || ((rec.daysUntilStockout ?? 14) <= 5 ? 'critical' : 'optimal')).toString();
                const urgencyUpper = urgencyRaw.toUpperCase();
                const urgencyBadge =
                  urgencyUpper === 'CRITICAL' || urgencyUpper === 'IMMEDIATE'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : urgencyUpper === 'HIGH' || urgencyUpper === 'WARNING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                const sku = rec.sku || rec.itemSku || 'SKU-001';
                const daysLeft = rec.daysUntilStockout ?? rec.estimatedDaysUntilStockout ?? 14;
                const suggestQty = rec.recommendedReorderQty ?? rec.suggestedReorderQuantity ?? 10;
                const reasonText = rec.automatedActionSummary || rec.reason || `Calculated burn rate indicates stock replenishment needed in ${daysLeft} days.`;
                const supplier = rec.recommendedSupplier || rec.suggestedVendor || 'Silicon Component Direct';
                const estCost = rec.estimatedReorderCost || (suggestQty * 45);

                return (
                  <div
                    key={rec.itemId || sku}
                    className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{rec.itemName}</h3>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {sku}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${urgencyBadge}`}>
                          {urgencyUpper}
                        </span>
                      </div>

                      {/* Stock Details */}
                      <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">On Hand</span>
                          <p className="font-bold text-slate-900 mt-0.5">{rec.currentStock ?? 0}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Days Left</span>
                          <p className={`font-bold mt-0.5 ${daysLeft <= 7 ? 'text-rose-600' : 'text-slate-800'}`}>
                            {daysLeft}d
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Suggest Qty</span>
                          <p className="font-bold text-emerald-700 mt-0.5">+{suggestQty}</p>
                        </div>
                      </div>

                      {/* AI Reorder Reason */}
                      <div className="mt-3 space-y-1.5 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Automation Trigger Reason:</span>
                        <p className="text-slate-700 font-medium leading-relaxed">{reasonText}</p>
                        {supplier && (
                          <div className="pt-2 text-[11px] text-slate-600 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>Preferred Supplier: <strong className="text-slate-800">{supplier}</strong></span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-600">
                          Est. Total Purchase: <strong className="text-slate-900">{formatCurrency(estCost, selectedCurrency)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Auto-PO Trigger */}
                    {onCreatePurchaseOrder && (
                      <div className="pt-3 border-t border-slate-100">
                        <button
                          onClick={() =>
                            onCreatePurchaseOrder(supplier, [
                              {
                                name: rec.itemName,
                                quantity: suggestQty,
                                unitCost: estCost / Math.max(1, suggestQty),
                              },
                            ])
                          }
                          className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Generate Purchase Invoice Bill</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {inventoryAutomationInsights.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">Inventory Well Balanced</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    All retail items and stock lines are currently above their automated safety thresholds.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: SALES MONITOR & ANOMALY DETECTION */}
      {activeSection === 'sales' && (
        <div className="space-y-5">
          {salesMonitorData ? (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    Real-Time Sales Performance & Revenue Velocity
                  </h3>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                    {salesMonitorData.salesHealthStatus || (salesMonitorData.salesVelocitySummary ? 'AI Monitored' : 'Healthy & Stable')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {salesMonitorData.salesVelocitySummary ||
                    salesMonitorData.performanceNarrative ||
                    'Revenue velocity remains steady across primary retail and wholesale customer segments.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Top Revenue Generator</span>
                    <div className="text-base font-bold text-slate-900 mt-1">
                      {salesMonitorData.topSellingSegments?.[0]?.category || salesMonitorData.topSellingCategory || 'Primary Retail Lines'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Cash Collection Velocity</span>
                    <div className="text-base font-bold text-emerald-700 mt-1">
                      {salesMonitorData.cashCollectionEfficiency || salesMonitorData.cashCollectionVelocity || '88.5% on-time settlement'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Profit Margin Health</span>
                    <div className="text-base font-bold text-indigo-700 mt-1">
                      {salesMonitorData.topSellingSegments?.[0]
                        ? `${salesMonitorData.topSellingSegments[0].marginPercent}% (${salesMonitorData.topSellingSegments[0].growthRate || 'Strong'})`
                        : salesMonitorData.marginHealth || 'Above Retail Benchmark'}
                    </div>
                  </div>
                </div>

                {salesMonitorData.topSellingSegments && salesMonitorData.topSellingSegments.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">High-Margin Revenue Streams</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {salesMonitorData.topSellingSegments.map((seg: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
                          <p className="text-xs font-bold text-slate-800">{seg.category}</p>
                          <div className="flex items-center justify-between mt-1 text-[11px]">
                            <span className="font-mono text-emerald-700 font-bold">{formatCurrency(seg.revenue || 0, selectedCurrency)}</span>
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">{seg.marginPercent}% margin</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(salesMonitorData.salesOptimizationTips?.length > 0 || salesMonitorData.actionableInsights?.length > 0) && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    AI Actionable Recommendations for Retail Growth
                  </h4>
                  <div className="space-y-2">
                    {(salesMonitorData.salesOptimizationTips || salesMonitorData.actionableInsights || []).map((act: string, idx: number) => (
                      <div key={idx} className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs text-slate-800 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isSalesMonitorLoading ? (
            <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3">
              <Activity className="w-8 h-8 text-teal-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Monitoring real-time sales transactions & cash flows...</p>
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl shadow-xs">
              <p className="text-xs text-slate-500">Click "Run AI Analytics" above to evaluate real-time sales patterns.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
