/**
 * Generic hook for invoking a single MCP tool and tracking loading/error/data.
 * Returns a stable callback `run(args)` plus a `state` object.
 */
import { useCallback, useState } from "react";

import { callTool } from "@/services/mcp-client";
import type { ToolName, ToolState } from "@/types/mcp";

export function useToolCall<T>(toolName: ToolName) {
  const [state, setState] = useState<ToolState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const run = useCallback(
    async (args: Record<string, unknown>) => {
      setState({ data: null, loading: true, error: null });
      try {
        const data = await callTool<T>(toolName, args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setState({ data: null, loading: false, error: msg });
        throw err;
      }
    },
    [toolName],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, run, reset };
}
