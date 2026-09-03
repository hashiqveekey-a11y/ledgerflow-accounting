import React, { useState } from 'react';
import { useWebMCP } from '../webmcp/useWebMCP';
import {
  Cpu,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  RefreshCw,
  Check,
  Zap,
} from 'lucide-react';

interface WebMCPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebMCPModal: React.FC<WebMCPModalProps> = ({ isOpen, onClose }) => {
  const { tools, resources, logs, isNative, version, executeTool } = useWebMCP();

  const [activeTab, setActiveTab] = useState<'tools' | 'playground' | 'logs' | 'connect'>('tools');
  const [selectedToolName, setSelectedToolName] = useState<string>(tools[0]?.name || 'create_sales_invoice');
  const [inputJson, setInputJson] = useState<string>('{\n  "clientName": "Apex Technologies",\n  "items": [\n    {\n      "description": "Cloud Architecture Consulting",\n      "quantity": 10,\n      "unitPrice": 150,\n      "taxRate": 8.5\n    }\n  ]\n}');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTool = tools.find((t) => t.name === selectedToolName) || tools[0];

  const handleSelectTool = (toolName: string) => {
    setSelectedToolName(toolName);
    const tool = tools.find((t) => t.name === toolName);
    if (tool) {
      // Provide clean default sample parameters based on schema
      let sampleParams: Record<string, any> = {};
      if (toolName === 'create_sales_invoice') {
        sampleParams = {
          clientName: 'Acme Global Ventures',
          clientEmail: 'billing@acmeglobal.com',
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          notes: 'Standard Net-15 invoicing terms',
          items: [
            {
              description: 'Enterprise ERP Implementation',
              quantity: 1,
              unitPrice: 2400,
              taxRate: 8.5,
            },
            {
              description: 'Dedicated Support Hours',
              quantity: 8,
              unitPrice: 120,
              taxRate: 8.5,
            },
          ],
        };
      } else if (toolName === 'record_purchase_bill') {
        sampleParams = {
          vendorName: 'Datacenter Cloud Hub',
          vendorEmail: 'accounts@cloudhub.io',
          billNumber: 'INV-CH-9921',
          category: 'Software, Cloud & SaaS',
          notes: 'Monthly high-throughput database cluster',
          items: [
            {
              description: 'Managed PostgreSQL & Redis Nodes',
              quantity: 1,
              unitPrice: 480,
              taxRate: 0,
              ledgerAccountName: 'IT & Cloud Infrastructure',
            },
          ],
        };
      } else if (toolName === 'get_financial_summary') {
        sampleParams = {};
      } else if (toolName === 'list_invoices') {
        sampleParams = {
          status: 'all',
          limit: 10,
        };
      } else if (toolName === 'list_purchase_bills') {
        sampleParams = {
          status: 'all',
          limit: 10,
        };
      } else if (toolName === 'get_chart_of_accounts') {
        sampleParams = {
          type: 'all',
        };
      } else if (toolName === 'open_camera_scanner') {
        sampleParams = {
          mode: 'sales',
        };
      } else if (toolName === 'trigger_bank_reconciliation') {
        sampleParams = {};
      } else if (toolName === 'get_customer_predictive_insights') {
        sampleParams = {
          minRiskScore: 20,
        };
      }
      setInputJson(JSON.stringify(sampleParams, null, 2));
      setExecutionResult(null);
      setExecutionError(null);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);

    try {
      let parsedArgs: Record<string, any> = {};
      if (inputJson.trim()) {
        try {
          parsedArgs = JSON.parse(inputJson);
        } catch (jsonErr: any) {
          throw new Error(`Invalid JSON parameters: ${jsonErr.message}`);
        }
      }

      const res = await executeTool(selectedToolName, parsedArgs);
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionError(err.message || 'Tool execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hostUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const claudeConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        livebooks_accounting: {
          url: `${hostUrl}/api/mcp/sse`,
        },
      },
    },
    null,
    2
  );

  const jsBrowserSnippet = `// W3C WebMCP Standard browser invocation
// Chrome Canary (with #enable-web-mcp flag) or standard browsers via WebMCP bridge
const result = await document.modelContext.executeTool('${selectedToolName || 'get_financial_summary'}', ${inputJson || '{}'});
console.log('WebMCP Output:', result);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">WebMCP Agent Hub & Protocol Inspector</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  W3C Active
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Model Context Protocol standard for AI agents to discover, inspect, and invoke accounting books directly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Browser Binding:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                document.modelContext
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Protocol Spec:</span>
              <span className="font-mono font-medium text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {version}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Registered Tools:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {tools.length} Tools
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Transport:</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] border border-blue-200">
              DOM Events + SSE Stream
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-2">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'tools'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tools Directory ({tools.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'playground'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Playground</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Agent Audit Logs ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'connect'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Agent Connection & Endpoints</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto bg-slate-50/50">
          {/* TAB 1: Tools Directory */}
          {activeTab === 'tools' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Exposed WebMCP Tools</h3>
                  <p className="text-xs text-slate-500">
                    AI agents connect to these callable functions with strong schema validation.
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleSelectTool(tools[0]?.name || 'create_sales_invoice');
                    setActiveTab('playground');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>Launch Playground</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {tool.name}
                        </span>
                        {tool.category && (
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {tool.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">{tool.description}</p>
                      
                      <div className="text-[11px] text-slate-400 font-mono">
                        Parameters: {Object.keys(tool.inputSchema.properties || {}).join(', ') || 'none'}
                      </div>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => {
                          handleSelectTool(tool.name);
                          setActiveTab('playground');
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Test Tool</span>
                        <Play className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resources section */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Exposed WebMCP Resources
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resources.map((res) => (
                    <div key={res.uri} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <div className="font-mono font-medium text-slate-800">{res.uri}</div>
                        <div className="text-[11px] text-slate-500">{res.name}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                        {res.mimeType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Interactive Playground */}
          {activeTab === 'playground' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Select Tool:</label>
                  <select
                    value={selectedToolName}
                    onChange={(e) => handleSelectTool(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500"
                  >
                    {tools.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Tool...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Execute Tool via WebMCP</span>
                    </>
                  )}
                </button>
              </div>

              {currentTool && (
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                  <p className="text-slate-700 font-medium mb-1">{currentTool.description}</p>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Schema: {JSON.stringify(currentTool.inputSchema.required || [])} required properties
                  </span>
                </div>
              )}

              {/* Grid: Editor & Output */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Input Parameters (JSON):</span>
                    <button
                      type="button"
                      onClick={() => handleSelectTool(selectedToolName)}
                      className="text-[11px] text-emerald-700 hover:underline font-normal"
                    >
                      Reset to sample
                    </button>
                  </label>
                  <textarea
                    rows={12}
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 resize-none shadow-inner"
                    placeholder="Enter JSON input arguments..."
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-700 mb-1.5">
                    Execution Result / WebMCP Output:
                  </label>
                  <div className="w-full h-full min-h-[220px] p-3 font-mono text-xs bg-slate-900 rounded-xl border border-slate-700 overflow-auto shadow-inner">
                    {executionError ? (
                      <div className="text-rose-400 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Execution Error:</div>
                          <pre className="whitespace-pre-wrap mt-1">{executionError}</pre>
                        </div>
                      </div>
                    ) : executionResult ? (
                      <div className="text-emerald-300">
                        <div className="text-xs text-slate-400 mb-1 border-b border-slate-800 pb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Status: Success (JSON-RPC 2.0 Response)
                          </span>
                        </div>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(executionResult, null, 2)}</pre>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-10">
                        <Terminal className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                        <p>Click "Execute Tool via WebMCP" above to test.</p>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Changes directly update your real accounting records.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Agent Audit Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">WebMCP Execution History</h3>
                  <p className="text-xs text-slate-500">
                    Real-time trace of tool invocations performed by AI agents, browser extensions, or playground.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">{logs.length} logged calls</span>
              </div>

              {logs.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
                  <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-slate-700">No WebMCP invocations recorded yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Execute a tool from the playground or via an external agent to see live telemetry.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-mono font-bold text-slate-900">{log.toolName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {log.source}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                          <span>{log.durationMs}ms</span>
                          <span>•</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Parameters:</span>
                          <pre className="text-slate-700 overflow-x-auto max-h-24">
                            {JSON.stringify(log.parameters, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Output:</span>
                          <pre className="text-slate-700 overflow-x-auto max-h-24">
                            {JSON.stringify(log.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Connect Agent */}
          {activeTab === 'connect' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Connect External AI Agents to LiveBooks</h3>
                <p className="text-slate-600 mt-0.5">
                  LiveBooks exposes standard Model Context Protocol (MCP) transports for Claude Desktop, Cursor,
                  CLI agents, Chrome extensions, and browser scripts.
                </p>
              </div>

              {/* Endpoint URLs */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Live MCP Endpoints
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">SSE Stream Transport</div>
                      <div className="font-mono text-slate-800">{`${hostUrl}/api/mcp/sse`}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${hostUrl}/api/mcp/sse`, 'sse')}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                      title="Copy URL"
                    >
                      {copiedKey === 'sse' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">JSON-RPC 2.0 POST Endpoint</div>
                      <div className="font-mono text-slate-800">{`${hostUrl}/api/mcp`}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`${hostUrl}/api/mcp`, 'post')}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                      title="Copy URL"
                    >
                      {copiedKey === 'post' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Claude Desktop Config */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Claude Desktop Config (claude_desktop_config.json):</span>
                  <button
                    onClick={() => copyToClipboard(claudeConfigSnippet, 'claude')}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    {copiedKey === 'claude' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Config</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {claudeConfigSnippet}
                </pre>
              </div>

              {/* Browser JavaScript Snippet */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    Browser / Extension In-Page Agent (document.modelContext):
                  </span>
                  <button
                    onClick={() => copyToClipboard(jsBrowserSnippet, 'js')}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    {copiedKey === 'js' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy JS</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {jsBrowserSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>WebMCP W3C Web Machine Learning Spec Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
