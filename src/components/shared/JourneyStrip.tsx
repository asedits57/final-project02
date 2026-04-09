import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, CircleDot } from "lucide-react";
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
  done: "border-emerald-400/20 bg-emerald-500/10",
  current: "border-violet-400/30 bg-violet-500/12",
  next: "border-white/10 bg-white/5",
};

const JourneyStrip = ({ items, className }: JourneyStripProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("grid gap-3 md:grid-cols-4", className)}>
      {items.map((item, index) => {
        const canNavigate = Boolean(item.path && item.state !== "current");
        const StatusIcon = item.state === "done" ? CheckCircle2 : CircleDot;

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
              "app-surface-soft flex items-start gap-3 p-4 text-left transition-all duration-200",
              stateStyles[item.state],
              canNavigate ? "cursor-pointer hover:border-violet-300/30" : "cursor-default",
            )}
          >
            <div className="mt-0.5 shrink-0 rounded-full border border-white/10 bg-black/20 p-1.5">
              <StatusIcon
                className="h-4 w-4"
                style={{
                  color:
                    item.state === "done"
                      ? "rgb(52 211 153)"
                      : item.state === "current"
                        ? "rgb(196 181 253)"
                        : "rgba(196, 181, 253, 0.6)",
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                {canNavigate && <ArrowRight className="h-3.5 w-3.5 text-violet-200/70" />}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300/75">{item.detail}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default JourneyStrip;
