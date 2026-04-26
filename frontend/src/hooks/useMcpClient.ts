/**
 * Connect-on-mount hook that exposes connection status + a re-fetched health
 * snapshot from the FastAPI sidecar. The MCP transport itself doesn't have a
 * native "health" notion, so we hit the regular /health endpoint to surface
 * whether Redis and the LLM are reachable.
 */
import { useEffect, useState } from "react";

import { getMcpClient } from "@/services/mcp-client";
import type { HealthResponse } from "@/types/mcp";

const HEALTH_URL = import.meta.env.VITE_HEALTH_URL || "/health";

export type ConnectionStatus = "connecting" | "ready" | "error";

export function useMcpClient() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await getMcpClient();
        if (cancelled) return;
        setStatus("ready");
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : String(err));
      }
    }
    init();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function poll() {
      try {
        const resp = await fetch(HEALTH_URL, { cache: "no-store" });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data: HealthResponse = await resp.json();
        if (!cancelled) setHealth(data);
      } catch {
        if (!cancelled) setHealth(null);
      }
      if (!cancelled) timer = window.setTimeout(poll, 30_000);
    }
    poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return { status, error, health };
}
