import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Brain, Flame, Sparkles, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AnimatedBackground from "@components/shared/AnimatedBackground";
import AppBottomNav from "@components/shared/AppBottomNav";
import { useAuthStore } from "@store/useAuthStore";
import { cn } from "@lib/utils";

interface UnifiedPageShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  className?: string;
  contentClassName?: string;
  showBottomNav?: boolean;
}

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/task": "Task",
  "/learning": "Learn",
  "/leaderboard": "Leaderboard",
  "/profile": "Profile",
  "/settings": "Settings",
  "/help": "Help",
  "/privacy": "Privacy",
};

const UnifiedPageShell = ({
  children,
  eyebrow,
  title,
  description,
  headerAction,
  className,
  contentClassName,
  showBottomNav = true,
}: UnifiedPageShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const displayName =
    user?.fullName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Learner";

  const currentRouteLabel = routeLabels[location.pathname] || "Workspace";

  return (
    <div className={cn("relative min-h-screen animated-bg overflow-hidden text-foreground", className)}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -left-24 top-[-7rem] h-[28rem] w-[28rem] rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/12 blur-3xl" />
      </div>

      <AnimatedBackground />

      <div className={cn("relative z-10", showBottomNav ? "pb-28" : "pb-8")}>
        <div className={cn("mx-auto max-w-6xl px-4 py-5 sm:px-6", contentClassName)}>
          <motion.div
            className="app-surface px-4 py-4 sm:px-6"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-3 text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-300/20">
                  <Brain className="h-5 w-5 text-violet-200" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-violet-200/70">MEC Learning</p>
                  <p className="text-sm font-semibold text-white">One connected English practice journey</p>
                </div>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <span className="app-metric-pill">
                  <Sparkles className="h-3.5 w-3.5 text-violet-200" />
                  {currentRouteLabel}
                </span>
                {typeof user?.score === "number" && (
                  <span className="app-metric-pill">
                    <Zap className="h-3.5 w-3.5 text-cyan-300" />
                    {user.score} XP
                  </span>
                )}
                {typeof user?.streak === "number" && (
                  <span className="app-metric-pill">
                    <Flame className="h-3.5 w-3.5 text-orange-300" />
                    {user.streak} day streak
                  </span>
                )}
                {headerAction}
              </div>
            </div>
          </motion.div>

          {(title || description || eyebrow) && (
            <motion.section
              className="app-surface app-grid mt-5 px-5 py-6 sm:px-8 sm:py-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
            >
              {eyebrow && <span className="app-kicker">{eyebrow}</span>}
              {title && (
                <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/78 sm:text-base">
                  {description.replace("{name}", displayName)}
                </p>
              )}
            </motion.section>
          )}

          <main className="mt-6">{children}</main>
        </div>
      </div>

      {showBottomNav && <AppBottomNav />}
    </div>
  );
};

export default UnifiedPageShell;
