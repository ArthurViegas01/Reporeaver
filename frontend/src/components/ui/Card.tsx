import { cn } from "@/lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add a soft violet glow + ring for hero / featured surfaces. */
  glow?: boolean;
  /** Lift slightly on hover. */
  interactive?: boolean;
}

export function Card({ glow = false, interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-violet-500/10 bg-ink-900/70 shadow-card backdrop-blur-md",
        glow && "shadow-glow",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/25 hover:shadow-glow-sm",
        className,
      )}
      {...props}
    />
  );
}

export default Card;
