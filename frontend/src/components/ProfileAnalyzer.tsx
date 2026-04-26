import { Search, Star, Users } from "lucide-react";
import { useState } from "react";

import ResultPanel from "@/components/ResultPanel";
import { useToolCall } from "@/hooks/useToolCall";
import type { ProfileAnalysis } from "@/types/mcp";

export default function ProfileAnalyzer() {
  const [username, setUsername] = useState("torvalds");
  const tool = useToolCall<ProfileAnalysis>("analyze_profile");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    tool.run({ username: username.trim() }).catch(() => undefined);
  };

  return (
    <section className="space-y-4">
      <form onSubmit={onSubmit} className="card p-4">
        <label className="label" htmlFor="username">
          GitHub username
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="username"
            className="input"
            placeholder="e.g. torvalds"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={tool.loading}>
            <Search className="h-4 w-4" />
            Analyze
          </button>
        </div>
      </form>

      <ResultPanel
        loading={tool.loading}
        error={tool.error}
        empty={!tool.data}
        emptyHint="Enter a GitHub username and hit Analyze."
      >
        {tool.data && <ProfileResult data={tool.data} />}
      </ResultPanel>
    </section>
  );
}

function ProfileResult({ data }: { data: ProfileAnalysis }) {
  return (
    <div className="card space-y-5 p-6">
      <header>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">
            @{data.username}
            {data.name && (
              <span className="ml-2 text-sm font-normal text-ink-50/60">{data.name}</span>
            )}
          </h2>
          {data.profile_url && (
            <a
              href={data.profile_url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs text-accent-400 hover:underline"
            >
              View on GitHub
            </a>
          )}
        </div>
        {data.bio && <p className="mt-1 text-sm text-ink-50/70">{data.bio}</p>}
      </header>

      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Metric icon={<Star className="h-4 w-4" />} label="Stars" value={data.total_stars} />
        <Metric label="Public repos" value={data.public_repos} />
        <Metric icon={<Users className="h-4 w-4" />} label="Followers" value={data.followers} />
        <Metric label="Following" value={data.following} />
      </div>

      <div>
        <h3 className="label">Top languages</h3>
        <ul className="mt-2 space-y-1.5">
          {data.top_languages.map((l) => (
            <li key={l.language}>
              <div className="flex items-center justify-between text-sm">
                <span>{l.language}</span>
                <span className="text-ink-50/60">
                  {l.repo_count} repos - {l.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-accent-500 to-accent-400"
                  style={{ width: `${l.percentage}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="label">Most starred</h3>
        <ul className="mt-2 space-y-2">
          {data.most_starred.map((r) => (
            <li key={r.name} className="rounded-lg border border-white/5 bg-white/5 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <a
                  href={r.url ?? "#"}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-accent-400 hover:underline"
                >
                  {r.name}
                </a>
                <span className="text-xs text-ink-50/60">
                  {r.language ?? "mixed"} - {r.stars ?? 0} stars
                </span>
              </div>
              {r.description && (
                <p className="mt-1 text-sm text-ink-50/70">{r.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Metric({
  icon, label, value,
}: { icon?: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/5 p-3">
      <div className="flex items-center gap-1.5 text-xs text-ink-50/60">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
