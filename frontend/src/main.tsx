import { MotionConfig } from "framer-motion";
import React from "react";
import ReactDOM from "react-dom/client";

import "@fontsource-variable/figtree/wght.css";
import "@fontsource-variable/geist-mono/wght.css";

import { TooltipProvider } from "@/components/ui/Tooltip";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* reducedMotion="user" makes every framer-motion animation respect the OS setting. */}
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </MotionConfig>
  </React.StrictMode>,
);
