import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@lib/utils";

type JourneyState = "done" | "current" | "next";

export interface JourneyItem {
  label: string;
  detail: string;
  path?: string;
  state: JourneyState;
}

interface JourneyStripProps {
  items: JourneyItem[];
  className?: string;
}

const stateStyles: Record<JourneyState, string> = {
  done: "border-emerald-400/18 bg-emerald-500/10",
  current: "border-cyan-300/24 bg-cyan-500/10",
  next: "border-white/10 bg-white/5",
};

const stateLabels: Record<JourneyState, string> = {
  done: "Completed",
  current: "Current stop",
  next: "Up next",
};

const JourneyStrip = ({ items, className }: JourneyStripProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item, index) => {
        const canNavigate = Boolean(item.path);

        return (
          <motion.button
            key={`${item.label}-${index}`}
            type="button"
            whileHover={canNavigate ? { y: -2 } : undefined}
            whileTap={canNavigate ? { scale: 0.98 } : undefined}
            onClick={() => {
              if (item.path) {
                navigate(item.path);
              }
            }}
            className={cn(
              "app-surface-soft flex items-start gap-2.5 p-3.5 text-left transition-all duration-200",
              stateStyles[item.state],
              canNavigate ? "cursor-pointer hover:border-cyan-300/26" : "cursor-default",
            )}
          >
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-xs font-semibold text-slate-200">
              0{index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {stateLabels[item.state]}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{item.label}</p>
                </div>
                {canNavigate && item.state !== "current" ? (
                  <ArrowRight className="h-3.5 w-3.5 text-cyan-100/80" />
                ) : null}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300/72">{item.detail}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default JourneyStrip;
