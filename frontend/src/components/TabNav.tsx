import { motion } from "framer-motion";
import { Briefcase, FileText, GitBranch, User } from "lucide-react";

import { cn } from "@/lib/cn";

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
    <nav
      aria-label="Tools"
      className="flex flex-wrap gap-1.5 rounded-2xl border border-violet-500/10 bg-ink-900/50 p-1.5 backdrop-blur-md"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(id)}
            className={cn(
              "relative inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm",
              "whitespace-nowrap transition-colors duration-200 focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-violet-400/70",
              isActive ? "text-violet-100" : "text-ink-300/70 hover:text-ink-100",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-xl border border-violet-400/30 bg-violet-500/15 shadow-glow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
