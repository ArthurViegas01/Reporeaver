import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

import JobMatcher from "@/components/JobMatcher";
import ProfileAnalyzer from "@/components/ProfileAnalyzer";
import RecruiterSummary from "@/components/RecruiterSummary";
import RepoEvaluator from "@/components/RepoEvaluator";
import TabNav, { type TabId } from "@/components/TabNav";
import type { ConnectionStatus } from "@/hooks/useMcpClient";

const TAB_COMPONENTS: Record<TabId, React.ComponentType> = {
  profile: ProfileAnalyzer,
  repo: RepoEvaluator,
  job: JobMatcher,
  summary: RecruiterSummary,
};

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
  status: ConnectionStatus;
  error: string | null;
}

export default function Workspace({ active, onChange, status, error }: Props) {
  const ActiveTab = TAB_COMPONENTS[active];

  return (
    <div>
      <TabNav active={active} onChange={onChange} />

      <div className="mt-6">
        {status === "ready" ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <ActiveTab />
            </motion.div>
          </AnimatePresence>
        ) : status === "connecting" ? (
          <div className="card flex items-center gap-3 p-8 text-ink-200/70">
            <Loader2 className="h-4 w-4 animate-spin text-violet-300" />
            Connecting to the MCP server…
          </div>
        ) : (
          <div className="card border-rose-400/20 bg-rose-500/5 p-6 text-rose-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <div>
                <div className="font-semibold">Cannot connect to the MCP server.</div>
                <div className="mt-1 text-sm opacity-80">{error ?? "Unknown error"}</div>
                <div className="mt-3 text-xs opacity-60">
                  Make sure the backend is running at the URL configured in{" "}
                  <code className="rounded bg-violet-500/10 px-1 py-0.5 font-mono">VITE_MCP_SERVER_URL</code>{" "}
                  (default <code className="font-mono">/mcp</code> via the Vite dev proxy).
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
