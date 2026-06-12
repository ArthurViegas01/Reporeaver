/**
 * Fixed, non-interactive background layer: a masked grid plus two drifting
 * violet "aurora" blobs. Purely decorative: hidden from the a11y tree and
 * frozen under prefers-reduced-motion (see index.css).
 */
export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute -top-48 left-1/2 h-[42rem] w-[60rem] -translate-x-1/2 animate-aurora rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="absolute right-[-12rem] top-1/3 h-[32rem] w-[32rem] animate-float rounded-full bg-violet-800/15 blur-[130px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
    </div>
  );
}
