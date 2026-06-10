import { useState } from "react";

import Header from "@/components/Header";
import JobMatcher from "@/components/JobMatcher";
import ProfileAnalyzer from "@/components/ProfileAnalyzer";
import RecruiterSummary from "@/components/RecruiterSummary";
import RepoEvaluator from "@/components/RepoEvaluator";
import TabNav, { type TabId } from "@/components/TabNav";
import { useMcpClient } from "@/hooks/useMcpClient";

const TAB_COMPONENTS: Record<TabId, React.ComponentType> = {
  profile: ProfileAnalyzer,
  repo: RepoEvaluator,
  job: JobMatcher,
  summary: RecruiterSummary,
};

export default function App() {
  const [active, setActive] = useState<TabId>("profile");
  const { status, error, health } = useMcpClient();
  const ActiveTab = TAB_COMPONENTS[active];

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
      <Header status={status} error={error} health={health} />

      <main className="mt-6 flex-1">
        <TabNav active={active} onChange={setActive} />
        <div className="mt-6">
          {status === "ready" ? (
            <ActiveTab />
          ) : status === "connecting" ? (
            <div className="card p-8 text-center text-ink-50/55">
              Connecting to MCP server...
            </div>
          ) : (
            <div className="card border-red-400/20 bg-red-500/5 p-6 text-red-300">
              <div className="font-semibold">Cannot connect to MCP server.</div>
              <div className="mt-1 text-sm opacity-80">{error ?? "Unknown error"}</div>
              <div className="mt-3 text-xs opacity-60">
                Make sure the backend is running at the URL configured in{" "}
                <code className="rounded bg-violet-500/10 px-1 py-0.5 font-mono text-xs">
                  VITE_MCP_SERVER_URL
                </code>{" "}
                (default: <code className="font-mono">/mcp</code> via the Vite dev proxy).
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-10 border-t border-violet-500/10 pt-4 text-center text-xs text-ink-50/35">
        devscope - GitHub portfolio intelligence via MCP - source on{" "}
        <a
          href="https://github.com/ArthurViegas01/devscope"
          className="text-accent-400 underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
