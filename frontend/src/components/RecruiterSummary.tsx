import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useStreamingTool } from "@/hooks/useStreamingTool";

export default function RecruiterSummary() {
  const [username, setUsername] = useState("torvalds");
  const tool = useStreamingTool("generate_recruiter_summary");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    tool.run({ username: username.trim() }).catch(() => undefined);
  };

  const showStreaming = tool.loading && tool.partial.length > 0;
  const showFinal = !!tool.final;
  const showEmpty = !tool.loading && !tool.final && !tool.error && tool.partial === "";

  return (
    <section className="space-y-4">
      <form onSubmit={onSubmit} className="card p-4">
        <label className="label" htmlFor="rs-user">GitHub username</label>
        <div className="mt-1 flex gap-2">
          <input
            id="rs-user"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={tool.loading}>
            {tool.loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Generate
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-50/50">
          Tokens stream in via MCP progress notifications - rendered live.
        </p>
      </form>

      {tool.error && (
        <div className="card border-red-400/30 bg-red-500/5 p-6 text-sm text-red-200">
          {tool.error}
        </div>
      )}

      {showEmpty && (
        <div className="card p-6 text-sm text-ink-50/40">
          The recruiter summary will appear here as the LLM streams it.
        </div>
      )}

      {(showStreaming || showFinal) && (
        <article className="card markdown p-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {tool.partial || tool.final || ""}
          </ReactMarkdown>
          {showStreaming && (
            <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-accent-400 align-middle" />
          )}
        </article>
      )}
    </section>
  );
}
