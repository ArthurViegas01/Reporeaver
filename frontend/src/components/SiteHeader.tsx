import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Github } from "lucide-react";
import { useState } from "react";

import HealthBadge from "@/components/HealthBadge";
import Logo from "@/components/Logo";
import { buttonVariants } from "@/components/ui/Button";
import type { ConnectionStatus } from "@/hooks/useMcpClient";
import { cn } from "@/lib/cn";
import type { HealthResponse } from "@/types/mcp";

const REPO_URL = "https://github.com/ArthurViegas01/devscope";

interface Props {
  status: ConnectionStatus;
  error: string | null;
  health: HealthResponse | null;
}

export default function SiteHeader({ status, error, health }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled ? "border-b border-violet-500/10 bg-ink-950/70 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#top" className="rounded-lg" aria-label="devscope home">
          <Logo />
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <HealthBadge status={status} error={error} health={health} />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonVariants({ variant: "subtle", size: "sm" })}
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </div>
    </motion.header>
  );
}
