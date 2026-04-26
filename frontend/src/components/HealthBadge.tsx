import type { HealthResponse } from "@/types/mcp";
import type { ConnectionStatus } from "@/hooks/useMcpClient";

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

export default function HealthBadge({ status, health }: Props) {
  let level: "ok" | "warn" | "error" = "warn";
  let label = "connecting...";
  if (status === "ready") {
    if (health?.status === "ok") {
      level = "ok";
      label = `online - ${health.region}`;
    } else if (health?.status === "degraded") {
      level = "warn";
      label = "degraded";
    } else {
      level = "ok";
      label = "online";
    }
  } else if (status === "error") {
    level = "error";
    label = "offline";
  }

  return (
    <span
      title={health ? `model: ${health.model} - redis: ${health.redis}` : undefined}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs"
    >
      <span className={`h-2 w-2 rounded-full ${DOT[level]} animate-pulse`} />
      {label}
    </span>
  );
}
