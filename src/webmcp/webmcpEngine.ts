import { WebMCPContainer, WebMCPTool, WebMCPResource, WebMCPPrompt, WebMCPExecutionLog } from './types';

class WebMCPEngine implements WebMCPContainer {
  tools = new Map<string, WebMCPTool>();
  resources = new Map<string, WebMCPResource>();
  prompts = new Map<string, WebMCPPrompt>();
  executionLogs: WebMCPExecutionLog[] = [];
  isNative = false;
  version = '2024-11-05/W3C-Draft';
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.initBrowserContext();
    this.setupEventListeners();
  }

  private initBrowserContext() {
    if (typeof window === 'undefined') return;

    // Check if browser has native navigator.modelContext
    const nativeNav = (navigator as any).modelContext;
    const nativeDoc = (document as any).modelContext;

    if (nativeNav || nativeDoc) {
      this.isNative = true;
    }

    // Polyfill or bind navigator.modelContext
    try {
      if (!(navigator as any).modelContext) {
        Object.defineProperty(navigator, 'modelContext', {
          value: {
            registerTool: (tool: any) => this.registerTool(tool),
            unregisterTool: (name: string) => this.unregisterTool(name),
            getTools: () => this.getTools(),
            executeTool: (name: string, args: any) => this.executeTool(name, args, 'browser_agent'),
          },
          configurable: true,
          writable: true,
        });
      }

      // Polyfill or bind document.modelContext
      if (!(document as any).modelContext) {
        Object.defineProperty(document, 'modelContext', {
          value: {
            registerTool: (tool: any) => this.registerTool(tool),
            unregisterTool: (name: string) => this.unregisterTool(name),
            getTools: () => this.getTools(),
            executeTool: (name: string, args: any) => this.executeTool(name, args, 'browser_agent'),
          },
          configurable: true,
          writable: true,
        });
      }

      // Provide global convenience handles
      (window as any).WebMCP = this;
      (window as any).__WebMCP__ = this;
      (window as any).modelContext = (document as any).modelContext;

      // Dispatch WebMCP ready event
      window.dispatchEvent(
        new CustomEvent('webmcp:ready', {
          detail: {
            version: this.version,
            isNative: this.isNative,
            tools: this.getTools().map((t) => t.name),
          },
        })
      );
    } catch (err) {
      console.warn('WebMCP context definition warning:', err);
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Allow browser extensions or agent scripts to invoke tools via CustomEvent
    window.addEventListener('webmcp:invoke', async (event: any) => {
      const detail = event.detail || {};
      const { tool, args, requestId } = detail;

      if (!tool) return;

      try {
        const result = await this.executeTool(tool, args || {}, 'window_event');
        window.dispatchEvent(
          new CustomEvent('webmcp:response', {
            detail: {
              requestId,
              tool,
              status: 'success',
              result,
            },
          })
        );
      } catch (err: any) {
        window.dispatchEvent(
          new CustomEvent('webmcp:response', {
            detail: {
              requestId,
              tool,
              status: 'error',
              error: err.message || 'Tool execution failed',
            },
          })
        );
      }
    });

    // Discovery ping
    window.addEventListener('webmcp:discover', () => {
      window.dispatchEvent(
        new CustomEvent('webmcp:discovery-response', {
          detail: {
            version: this.version,
            tools: this.getTools().map((t) => ({
              name: t.name,
              description: t.description,
              inputSchema: t.inputSchema,
            })),
            resources: this.getResources().map((r) => ({
              uri: r.uri,
              name: r.name,
              description: r.description,
            })),
          },
        })
      );
    });
  }

  registerTool(tool: WebMCPTool) {
    this.tools.set(tool.name, tool);
    this.notifySubscribers();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-registered', {
          detail: { name: tool.name, description: tool.description },
        })
      );
    }
  }

  unregisterTool(toolName: string): boolean {
    const existed = this.tools.delete(toolName);
    if (existed) {
      this.notifySubscribers();
    }
    return existed;
  }

  getTools(): WebMCPTool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(
    name: string,
    args: Record<string, any> = {},
    source: WebMCPExecutionLog['source'] = 'browser_agent'
  ): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`WebMCP Tool "${name}" is not registered on this web application.`);
    }

    const startTime = performance.now();
    let status: 'success' | 'error' = 'success';
    let result: any = null;

    try {
      result = await tool.execute(args);
      return result;
    } catch (err: any) {
      status = 'error';
      result = { error: err.message || 'Execution error' };
      throw err;
    } finally {
      const durationMs = Math.round(performance.now() - startTime);
      const logEntry: WebMCPExecutionLog = {
        id: `mcp-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString(),
        toolName: name,
        source,
        parameters: args,
        result,
        status,
        durationMs,
      };
      this.executionLogs.unshift(logEntry);
      if (this.executionLogs.length > 50) this.executionLogs.pop();
      this.notifySubscribers();
    }
  }

  registerResource(resource: WebMCPResource) {
    this.resources.set(resource.uri, resource);
    this.notifySubscribers();
  }

  getResources(): WebMCPResource[] {
    return Array.from(this.resources.values());
  }

  async readResource(uri: string): Promise<string> {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`WebMCP Resource "${uri}" not found.`);
    }
    return await resource.read();
  }

  registerPrompt(prompt: WebMCPPrompt) {
    this.prompts.set(prompt.name, prompt);
    this.notifySubscribers();
  }

  getPrompts(): WebMCPPrompt[] {
    return Array.from(this.prompts.values());
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('WebMCP subscriber callback error:', e);
      }
    });
  }
}

export const webmcpEngine = new WebMCPEngine();
