import { motion, type Variants } from "framer-motion";
import { ArrowRight, Github, Sparkles } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button, { buttonVariants } from "@/components/ui/Button";

const REPO_URL = "https://github.com/ArthurViegas01/devscope";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative pb-16 pt-20 text-center sm:pt-28">
      <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-3xl">
        <motion.div variants={item} className="mb-6 flex justify-center">
          <Badge tone="violet" className="px-3 py-1 text-[11px]">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered GitHub portfolio intelligence
          </Badge>
        </motion.div>

        <motion.h1 variants={item} className="text-display font-bold tracking-tight text-ink-50">
          See any developer <br className="hidden sm:block" />
          through <span className="text-gradient-violet">an expert lens</span>
        </motion.h1>

        <motion.p variants={item} className="mx-auto mt-6 max-w-xl text-base text-ink-200/70 sm:text-lg">
          Devscope is an MCP server that reads public GitHub data and turns it into recruiter-grade
          insight: profile analysis, repository evaluation, job-fit scoring, and live-streamed
          summaries.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={onStart} className="group w-full sm:w-auto">
            Analyze a profile
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonVariants({ variant: "subtle", size: "lg", className: "w-full sm:w-auto" })}
          >
            <Github className="h-4 w-4" />
            View the source
          </a>
        </motion.div>

        <motion.p variants={item} className="mt-5 text-xs text-ink-400/70">
          No sign-up · runs on public GitHub data · open source
        </motion.p>
      </motion.div>
    </section>
  );
}
