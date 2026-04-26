import { Briefcase, ChevronRight } from "lucide-react";
import { useState } from "react";

import ResultPanel from "@/components/ResultPanel";
import { useToolCall } from "@/hooks/useToolCall";
import type { JobMatchResult } from "@/types/mcp";

const SAMPLE_JOB = `Senior Python Engineer to build distributed data pipelines.
Required: Python 3.11+, FastAPI, async, PostgreSQL, Redis, Docker, AWS, CI/CD with GitHub Actions, observability (OpenTelemetry / Prometheus). Nice-to-have: TypeScript, Terraform, LLM tooling experience.`;

export default function JobMatcher() {
  const [username, setUsername] = useState("torvalds");
  const [job, setJob] = useState(SAMPLE_JOB);
  const tool = useToolCall<JobMatchResult>("map_to_job");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || job.trim().length < 30) return;
    tool.run({ username: username.trim(), job_description: job.trim() }).catch(() => undefined);
  };

  return (
    <section className="space-y-4">
      <form onSubmit={onSubmit} className="card space-y-3 p-4">
        <div>
          <label className="label" htmlFor="m-user">GitHub username</label>
          <input
            id="m-user"
            className="input mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="job">Job description</label>
          <textarea
            id="job"
            className="input mt-1 min-h-[140px] font-mono text-sm"
            value={job}
            onChange={(e) => setJob(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={tool.loading}>
          <Briefcase className="h-4 w-4" />
          Match
        </button>
      </form>

      <ResultPanel
        loading={tool.loading}
        error={tool.error}
        empty={!tool.data}
        emptyHint="Paste a job description; the LLM will cross-check it against the user's public skills."
      >
        {tool.data && <JobResult data={tool.data} />}
      </ResultPanel>
    </section>
  );
}

function JobResult({ data }: { data: JobMatchResult }) {
  return (
    <div className="card space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">@{data.username}</h2>
        <ScoreBadge score={data.overall_match_score} />
      </div>
      <p className="text-sm leading-relaxed text-ink-50/80">{data.summary}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Bullets title="Matched skills" tone="emerald" items={data.matched_skills} />
        <Bullets title="Missing skills" tone="rose" items={data.missing_skills} />
        <Bullets title="Strengths" tone="accent" items={data.strengths} />
        <Bullets title="Gaps to probe" tone="amber" items={data.gaps} />
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 75 ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
    : score >= 50 ? "bg-amber-500/15 text-amber-200 border-amber-400/30"
    : "bg-rose-500/15 text-rose-200 border-rose-400/30";
  return (
    <div className={`rounded-lg border px-3 py-1.5 ${tone}`}>
      <span className="text-xs uppercase tracking-wider opacity-80">Match</span>
      <span className="ml-2 text-lg font-bold">{score}</span>
      <span className="ml-0.5 text-sm opacity-70">/100</span>
    </div>
  );
}

const TONES: Record<string, string> = {
  emerald: "text-emerald-300",
  rose: "text-rose-300",
  accent: "text-accent-400",
  amber: "text-amber-300",
};

function Bullets({ title, tone, items }: { title: string; tone: keyof typeof TONES; items: string[] }) {
  return (
    <div>
      <h3 className={`text-xs font-semibold uppercase tracking-wider ${TONES[tone]}`}>{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.length === 0 ? (
          <li className="text-sm text-ink-50/40">(none)</li>
        ) : (
          items.map((s, i) => (
            <li key={i} className="flex items-start gap-1.5 text-sm text-ink-50/85">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-none opacity-50" />
              <span>{s}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
