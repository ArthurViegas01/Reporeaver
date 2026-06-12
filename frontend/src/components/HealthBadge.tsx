import { Tooltip } from "@/components/ui/Tooltip";
import type { ConnectionStatus } from "@/hooks/useMcpClient";
import { cn } from "@/lib/cn";
import type { HealthResponse } from "@/types/mcp";

interface Props {
  status: ConnectionStatus;
  error: string | null;
  health: HealthResponse | null;
}

const DOT: Record<"ok" | "warn" | "error", string> = {
  ok: "bg-emerald-400",
  warn: "bg-amber-400",
  error: "bg-rose-500",
};

const RING: Record<"ok" | "warn" | "error", string> = {
  ok: "border-emerald-400/25 bg-emerald-500/5 text-emerald-200/90",
  warn: "border-amber-400/25 bg-amber-500/5 text-amber-200/90",
  error: "border-rose-500/30 bg-rose-500/5 text-rose-200/90",
};

export default function HealthBadge({ status, error, health }: Props) {
  // A "degraded" backend (e.g. Redis down) is expected and reported as a
  // warning, never an error — only a failed MCP connection is an error.
  let level: "ok" | "warn" | "error" = "warn";
  let label = "connecting";
  if (status === "ready") {
    if (health?.status === "degraded") {
      level = "warn";
      label = "degraded";
    } else {
      level = "ok";
      label = health?.region ? `online · ${health.region}` : "online";
    }
  } else if (status === "error") {
    level = "error";
    label = "offline";
  }

  const tip =
    status === "error"
      ? error ?? "Cannot reach the MCP server"
      : health
        ? `model: ${health.model} · redis: ${health.redis} · env: ${health.environment}`
        : "Checking backend health…";

  return (
    <Tooltip content={tip}>
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
          RING[level],
        )}
      >
        <span className="relative flex h-2 w-2">
          {level !== "error" && (
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", DOT[level])} />
          )}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", DOT[level])} />
        </span>
        {label}
      </span>
    </Tooltip>
  );
}
