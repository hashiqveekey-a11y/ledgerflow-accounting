/**
 * WebMCP (Web Model Context Protocol) Specifications & Interfaces
 * Compatible with W3C WebML document.modelContext / navigator.modelContext
 * and standard Model Context Protocol (MCP) JSON-RPC 2.0.
 */

export interface WebMCPToolSchema {
  type: 'object';
  properties: Record<
    string,
    {
      type: string;
      description?: string;
      enum?: string[];
      items?: any;
      default?: any;
    }
  >;
  required?: string[];
}

export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: WebMCPToolSchema;
  execute: (args: Record<string, any>) => Promise<any> | any;
  category?: 'sales' | 'purchases' | 'ledger' | 'reports' | 'system';
}

export interface WebMCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  read: () => Promise<string> | string;
}

export interface WebMCPPrompt {
  name: string;
  description: string;
  arguments?: {
    name: string;
    description: string;
    required?: boolean;
  }[];
  getMessages: (args: Record<string, any>) => Promise<any[]> | any[];
}

export interface WebMCPContainer {
  tools: Map<string, WebMCPTool>;
  resources: Map<string, WebMCPResource>;
  prompts: Map<string, WebMCPPrompt>;
  registerTool: (tool: WebMCPTool) => void;
  unregisterTool: (toolName: string) => boolean;
  getTools: () => WebMCPTool[];
  executeTool: (name: string, args?: Record<string, any>) => Promise<any>;
  registerResource: (resource: WebMCPResource) => void;
  getResources: () => WebMCPResource[];
  readResource: (uri: string) => Promise<string>;
  registerPrompt: (prompt: WebMCPPrompt) => void;
  getPrompts: () => WebMCPPrompt[];
  isNative: boolean;
  version: string;
}

export interface WebMCPExecutionLog {
  id: string;
  timestamp: string;
  toolName: string;
  source: 'browser_agent' | 'user_playground' | 'sse_client' | 'window_event';
  parameters: Record<string, any>;
  result: any;
  status: 'success' | 'error';
  durationMs: number;
}
