import * as RT from "@radix-ui/react-tooltip";

import { cn } from "@/lib/cn";

/** Mount once near the app root so every <Tooltip> shares timing. */
export function TooltipProvider(props: RT.TooltipProviderProps) {
  return <RT.Provider delayDuration={200} skipDelayDuration={300} {...props} />;
}

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: RT.TooltipContentProps["side"];
  className?: string;
}

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  return (
    <RT.Root>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 max-w-xs rounded-lg border border-violet-500/20 bg-ink-800/95 px-2.5 py-1.5 " +
              "text-xs text-ink-100 shadow-elevated backdrop-blur " +
              "data-[state=delayed-open]:animate-fade-in",
            className,
          )}
        >
          {content}
          <RT.Arrow className="fill-ink-800" />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}

export default Tooltip;
