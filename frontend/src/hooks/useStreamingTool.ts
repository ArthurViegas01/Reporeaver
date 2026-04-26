/**
 * Hook tailored for `generate_recruiter_summary` and similar tools that emit
 * incremental progress updates. Exposes the live partial markdown so the UI
 * can render token-by-token.
 */
import { useCallback, useState } from "react";

import { callTool } from "@/services/mcp-client";
import type { ToolName } from "@/types/mcp";

interface State {
  partial: string;
  final: string | null;
  loading: boolean;
  error: string | null;
}

const INITIAL: State = { partial: "", final: null, loading: false, error: null };

export function useStreamingTool(toolName: ToolName) {
  const [state, setState] = useState<State>(INITIAL);

  const run = useCallback(
    async (args: Record<string, unknown>) => {
      setState({ partial: "", final: null, loading: true, error: null });
      try {
        const final = await callTool<string>(toolName, args, {
          onProgress: (msg) =>
            setState((s) => ({ ...s, partial: msg })),
        });
        setState({ partial: final, final, loading: false, error: null });
        return final;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setState({ partial: "", final: null, loading: false, error: msg });
        throw err;
      }
    },
    [toolName],
  );

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, run, reset };
}
