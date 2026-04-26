import { Briefcase, FileText, GitBranch, User } from "lucide-react";

export type TabId = "profile" | "repo" | "job" | "summary";

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "profile", label: "Analyze profile", icon: User },
  { id: "repo", label: "Evaluate repo", icon: GitBranch },
  { id: "job", label: "Map to job", icon: Briefcase },
  { id: "summary", label: "Recruiter summary", icon: FileText },
];

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

export default function TabNav({ active, onChange }: Props) {
  return (
    <nav className="flex flex-wrap gap-2">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition " +
              (isActive
                ? "border-accent-500 bg-accent-500/10 text-accent-400"
                : "border-white/10 bg-white/5 text-ink-50/70 hover:bg-white/10")
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
