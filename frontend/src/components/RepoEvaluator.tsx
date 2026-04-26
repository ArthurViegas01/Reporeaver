import { CheckCircle2, GitBranch, XCircle } from "lucide-react";
import { useState } from "react";

import ResultPanel from "@/components/ResultPanel";
import { useToolCall } from "@/hooks/useToolCall";
import type { RepositoryEvaluation } from "@/types/mcp";

export default function RepoEvaluator() {
  const [url, setUrl] = useState("https://github.com/anthropics/anthropic-cookbook");
  const tool = useToolCall<RepositoryEvaluation>("evaluate_repository");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    tool.run({ repo_url: url.trim() }).catch(() => undefined);
  };

  return (
    <section className="space-y-4">
      <form onSubmit={onSubmit} className="card p-4">
        <label className="label" htmlFor="repo">Repository URL</label>
        <div className="mt-1 flex gap-2">
          <input
            id="repo"
            className="input"
            placeholder="https://github.com/owner/name"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={tool.loading}>
            <GitBranch className="h-4 w-4" />
            Evaluate
          </button>
        </div>
      </form>

      <ResultPanel
        loading={tool.loading}
        error={tool.error}
        empty={!tool.data}
        emptyHint="Paste a github.com/owner/repo URL above."
      >
        {tool.data && <RepoResult data={tool.data} />}
      </ResultPanel>
    </section>
  );
}

function RepoResult({ data }: { data: RepositoryEvaluation }) {
  const total = Object.values(data.languages_breakdown).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="card space-y-5 p-6">
      <header>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">
            <a
              href={data.url ?? "#"}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent-400 hover:underline"
            >
              {data.full_name}
            </a>
          </h2>
          <span className="text-xs text-ink-50/60">
            {data.stars} stars - {data.forks} forks
          </span>
        </div>
        {data.description && (
          <p className="mt-1 text-sm text-ink-50/70">{data.description}</p>
        )}
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Signal label="README" yes={data.has_readme} />
        <Signal label="Tests" yes={data.has_tests} />
        <Signal label="CI" yes={data.has_ci} />
        <Signal label="Dockerfile" yes={data.has_dockerfile} />
        <Signal label="Issues open" yes={data.open_issues > 0} muted />
        <Signal label="Topics" yes={data.topics.length > 0} muted />
      </div>

      {data.architecture_signals.length > 0 && (
        <div>
          <h3 className="label">Architecture signals</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.architecture_signals.map((s) => (
              <span
                key={s}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="label">Languages</h3>
        <ul className="mt-2 space-y-1.5">
          {Object.entries(data.languages_breakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([lang, bytes]) => {
              const pct = (bytes / total) * 100;
              return (
                <li key={lang}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{lang}</span>
                    <span className="text-ink-50/60">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-accent-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
        </ul>
      </div>

      {data.readme_excerpt && (
        <div>
          <h3 className="label">README excerpt</h3>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-white/5 bg-ink-950/40 p-3 font-mono text-xs text-ink-50/80">
            {data.readme_excerpt}
          </pre>
        </div>
      )}
    </div>
  );
}

function Signal({ label, yes, muted = false }: { label: string; yes: boolean; muted?: boolean }) {
  const tone = muted ? "text-ink-50/60" : yes ? "text-emerald-400" : "text-ink-50/40";
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm">
      {yes ? (
        <CheckCircle2 className={`h-4 w-4 ${tone}`} />
      ) : (
        <XCircle className={`h-4 w-4 ${tone}`} />
      )}
      <span className={tone}>{label}</span>
    </div>
  );
}
