import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Github } from "lucide-react";
import { useState } from "react";

import Logo from "@/components/Logo";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const REPO_URL = "https://github.com/ArthurViegas01/devscope";

export default function SiteHeader() {
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
    </motion.header>
  );
}
