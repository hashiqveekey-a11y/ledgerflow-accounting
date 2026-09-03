import { useState, useEffect } from 'react';
import { webmcpEngine } from './webmcpEngine';
import { WebMCPTool, WebMCPResource, WebMCPExecutionLog } from './types';

export function useWebMCP() {
  const [tools, setTools] = useState<WebMCPTool[]>(() => webmcpEngine.getTools());
  const [resources, setResources] = useState<WebMCPResource[]>(() => webmcpEngine.getResources());
  const [logs, setLogs] = useState<WebMCPExecutionLog[]>(() => [...webmcpEngine.executionLogs]);
  const [isNative] = useState(() => webmcpEngine.isNative);

  useEffect(() => {
    const unsubscribe = webmcpEngine.subscribe(() => {
      setTools(webmcpEngine.getTools());
      setResources(webmcpEngine.getResources());
      setLogs([...webmcpEngine.executionLogs]);
    });
    return () => unsubscribe();
  }, []);

  const executeTool = async (name: string, args: Record<string, any>) => {
    return await webmcpEngine.executeTool(name, args, 'user_playground');
  };

  return {
    tools,
    resources,
    logs,
    isNative,
    version: webmcpEngine.version,
    executeTool,
  };
}
