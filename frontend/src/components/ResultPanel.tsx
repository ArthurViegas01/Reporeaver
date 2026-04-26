import { AlertCircle, Loader2 } from "lucide-react";

interface Props {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyHint?: string;
  children: React.ReactNode;
}

export default function ResultPanel({ loading, error, empty, emptyHint, children }: Props) {
  if (loading) {
    return (
      <div className="card flex items-center gap-3 p-6 text-ink-50/70">
        <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
        Working...
      </div>
    );
  }
  if (error) {
    return (
      <div className="card border-red-400/30 bg-red-500/5 p-6 text-red-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="card p-6 text-sm text-ink-50/40">
        {emptyHint ?? "Run a query to see results here."}
      </div>
    );
  }
  return <>{children}</>;
}
