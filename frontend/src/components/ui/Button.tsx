import { cn } from "@/lib/cn";

type Variant = "primary" | "subtle" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const BASE =
  "inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-violet-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 " +
  "disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-violet-500 to-violet-600 text-white " +
    "shadow-[0_8px_24px_-10px_rgba(124,58,237,0.9)] hover:from-violet-400 hover:to-violet-500 " +
    "hover:shadow-[0_12px_32px_-8px_rgba(124,58,237,1)] active:translate-y-px",
  subtle:
    "border border-violet-500/15 bg-white/[0.02] text-ink-100/85 " +
    "hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-ink-50",
  ghost: "text-ink-100/80 hover:bg-violet-500/10 hover:text-ink-50",
  outline: "border border-violet-400/30 text-violet-200 hover:bg-violet-500/10",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
  icon: "h-10 w-10",
};

/** Shared class string so links (<a>) can match the button look. */
export function buttonVariants(opts: { variant?: Variant; size?: Size; className?: string } = {}): string {
  const { variant = "primary", size = "md", className } = opts;
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}

export default Button;
