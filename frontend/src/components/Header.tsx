import { Github } from "lucide-react";

import HealthBadge from "@/components/HealthBadge";
import type { ConnectionStatus } from "@/hooks/useMcpClient";
import type { HealthResponse } from "@/types/mcp";

interface Props {
  status: ConnectionStatus;
  error: string | null;
  health: HealthResponse | null;
}

function DevScopeMark() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="30" height="30" rx="7" fill="#1C1838" />
      <text
        x="15"
        y="21"
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontWeight="700"
        fontSize="18"
        fill="#8B5CF6"
      >
        d
      </text>
    </svg>
  );
}

export default function Header({ status, error, health }: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <DevScopeMark />
          <span className="text-xl font-bold tracking-tight text-ink-50">devscope</span>
        </div>
        <p className="mt-1 text-sm text-ink-50/55">
          GitHub portfolio intelligence via MCP
        </p>
      </div>

      <div className="flex items-center gap-3">
        <HealthBadge status={status} error={error} health={health} />
        <a
          href="https://github.com/ArthurViegas01/devscope"
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
