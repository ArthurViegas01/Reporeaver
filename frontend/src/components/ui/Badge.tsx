import { cn } from "@/lib/cn";

type Tone = "violet" | "emerald" | "amber" | "rose" | "neutral";

const TONES: Record<Tone, string> = {
  violet: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  neutral: "border-white/10 bg-white/5 text-ink-200/80",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

export default Badge;
