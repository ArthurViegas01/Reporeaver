import { cn } from "@/lib/cn";

/** The devscope wordmark + glyph. The glyph is a violet aperture/lens "d". */
export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="ds-mark" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A78BFA" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect x="0.5" y="0.5" width="29" height="29" rx="8" fill="#15112C" stroke="url(#ds-mark)" strokeOpacity="0.5" />
        <circle cx="15" cy="15" r="6.5" stroke="url(#ds-mark)" strokeWidth="2.2" />
        <circle cx="15" cy="15" r="2" fill="url(#ds-mark)" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-ink-50">devscope</span>
    </div>
  );
}
