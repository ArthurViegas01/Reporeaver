import { useRef, useState } from "react";

import BackgroundFX from "@/components/BackgroundFX";
import Footer from "@/components/Footer";
import HealthBadge from "@/components/HealthBadge";
import SiteHeader from "@/components/SiteHeader";
import type { TabId } from "@/components/TabNav";
import Workspace from "@/components/Workspace";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import StackRow from "@/components/landing/StackRow";
import { useMcpClient } from "@/hooks/useMcpClient";

export default function App() {
  const [active, setActive] = useState<TabId>("profile");
  const { status, error, health } = useMcpClient();
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Primary CTA: jump to the workspace and drop the cursor in the first input.
  const startAnalyzing = () => {
    setActive("profile");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    workspaceRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("username")?.focus(), reduce ? 0 : 420);
  };

  return (
    <div id="top">
      <BackgroundFX />
      <SiteHeader />

      <main>
        <div className="mx-auto max-w-6xl px-4">
          <Hero onStart={startAnalyzing} />
          <HowItWorks />
          <StackRow />
        </div>

        <section ref={workspaceRef} id="workspace" className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-24 pt-10">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-display-sm font-semibold text-ink-50">Workspace</h2>
              <p className="mt-2 text-sm text-ink-300/70">
                Four MCP tools, live against the production backend. Pick one and run it.
              </p>
            </div>
            <HealthBadge status={status} error={error} health={health} />
          </div>
          <Workspace active={active} onChange={setActive} status={status} error={error} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
