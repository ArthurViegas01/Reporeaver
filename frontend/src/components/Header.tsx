import { Activity, Github } from "lucide-react";

import HealthBadge from "@/components/HealthBadge";
import type { HealthResponse } from "@/types/mcp";
import type { ConnectionStatus } from "@/hooks/useMcpClient";

interface Props {
  status: ConnectionStatus;
  error: string | null;
  health: HealthResponse | null;
}

export default function Header({ status, error, health }: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Activity className="h-6 w-6 text-accent-400" />
          GitHub Portfolio Intel
        </div>
        <div className="mt-1 text-sm text-ink-50/60">
          MCP client demo
        </div>
      </div>

      <div className="flex items-center gap-3">
        <HealthBadge status={status} error={error} health={health} />
        <a
          href="https://github.com/arthurpviegas/reporeaver"
          target="_blank"
          rel="noreferrer noopener"
          className="btn-ghost"
        >
          <Github className="h-4 w-4" />
          Source
        </a>
      </div>
    </header>
  );
}
