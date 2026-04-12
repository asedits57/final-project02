import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Flame, Sparkles, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import NotificationCenter from "@components/shared/NotificationCenter";
import { useAuthStore } from "@store/useAuthStore";
import AppBottomNav from "@components/shared/AppBottomNav";
import { brand, getWorkspaceRouteLabel, isWorkspaceRouteActive, workspaceNavItems } from "@lib/brand";
import { cn } from "@lib/utils";

interface UnifiedPageShellProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  className?: string;
  contentClassName?: string;
  heroClassName?: string;
}

const resolveWorkspaceMeta = (pathname: string) => {
  if (pathname === "/home" || pathname.startsWith("/complete-profile")) {
    return {
      label: "Home",
      focus: "Warm-up tools, quick launches, and a clear start point for the session",
      next: { label: "Move into guided practice", path: "/task" },
      note: "Start with a quick language warm-up, then move into guided work while your attention is still fresh.",
    };
  }

  if (pathname.startsWith("/task")) {
    return {
      label: "Practice",
      focus: "Scored modules, daily challenges, and deliberate skill-building work",
      next: { label: "Review in the learning hub", path: "/learning" },
      note: "Use practice as the engine room of the product: finish a challenge, deepen one skill, then carry forward a concrete next step.",
    };
  }

  if (pathname.startsWith("/learning")) {
    return {
      label: "Learn",
      focus: "Study guides, published videos, and revision support",
      next: { label: "Check live rank", path: "/leaderboard" },
      note: "Learning works best right after practice, when mistakes are recent and the next improvement is obvious.",
    };
  }

  if (pathname.startsWith("/leaderboard")) {
    return {
      label: "Leaderboard",
      focus: "Live performance tracking, rank movement, and shared momentum",
      next: { label: "Refine your profile", path: "/profile" },
      note: "Treat this as a live results wall: check your position, compare pace, and jump back into action without losing context.",
    };
  }

  if (pathname.startsWith("/profile")) {
    return {
      label: "Profile",
      focus: "Identity, settings, progress signals, and next actions",
      next: { label: "Return to guided practice", path: "/task" },
      note: "Your profile should feel operational, not static, with a fast route back into practice and review.",
    };
  }

  if (pathname.startsWith("/settings")) {
    return {
      label: "Settings",
      focus: "Preference controls, access routes, and quick operational adjustments",
      next: { label: "Return to profile", path: "/profile" },
      note: "Settings should be a short operational stop, not a dead end. Adjust the essentials and move on.",
    };
  }

  if (pathname.startsWith("/help")) {
    return {
      label: "Help",
      focus: "Troubleshooting, support routes, and guidance when something blocks progress",
      next: { label: "Back to settings", path: "/settings" },
      note: "Keep support close to the product flow so learners can recover quickly and continue working.",
    };
  }

  if (pathname.startsWith("/privacy")) {
    return {
      label: "Privacy",
      focus: "Account controls, security details, and platform trust information",
      next: { label: "Open settings", path: "/settings" },
      note: "Privacy content should feel like part of the same professional product experience, not a detached legal page.",
    };
  }

    return {
      label: "Workspace",
      focus: "Everything connected in one learning journey",
      next: { label: "Go to home", path: "/home" },
      note: "Keep moving through the product without breaking context: practice, study, track, and adjust from one shared space.",
    };
  };

const UnifiedPageShell = ({
  children,
  eyebrow,
  title,
  description,
  headerAction,
  className,
  contentClassName,
  heroClassName,
}: UnifiedPageShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const routeMeta = resolveWorkspaceMeta(location.pathname);

  const displayName =
    user?.fullName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Learner";

  const currentRouteLabel = getWorkspaceRouteLabel(location.pathname) || routeMeta.label;
  const levelLabel = user?.level ? `Level ${user.level}` : "Level 1";
  const scoreLabel = typeof user?.score === "number" ? `${user.score} XP` : "0 XP";
  const streakLabel = typeof user?.streak === "number" ? `${user.streak} day streak` : "Start a streak";

  return (
    <div className={cn("relative min-h-screen overflow-hidden text-foreground", className)}>
      <div className="relative z-10 pb-safe xl:pb-8">
        <div className={cn("mx-auto max-w-[86rem] px-4 py-3 sm:px-5 sm:py-4 lg:px-7", contentClassName)}>
          <motion.header
            className="app-surface px-4 py-3.5 sm:px-5 sm:py-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/home")}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-500/10">
                      <Brain className="h-5 w-5 text-cyan-100" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/70">{brand.name}</p>
                      <p className="truncate text-sm font-semibold text-white">{brand.workspaceLabel}</p>
                    </div>
                  </button>

                  <span className="app-metric-pill hidden md:inline-flex">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                    {currentRouteLabel}
                  </span>
                </div>

                <nav className="hidden xl:flex xl:flex-wrap xl:items-center xl:gap-2" aria-label="Workspace sections">
                  {workspaceNavItems.map(({ label, path, icon: Icon }) => {
                    const active = isWorkspaceRouteActive(location.pathname, path);

                    return (
                      <button
                        key={path}
                        type="button"
                        onClick={() => navigate(path)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                          active
                            ? "border-cyan-300/24 bg-cyan-500/12 text-white"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8",
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active ? "text-cyan-100" : "text-slate-300")} />
                        {label}
                      </button>
                    );
                  })}
                </nav>

                <div className="flex flex-wrap items-center gap-2 xl:justify-end xl:self-center">
                  <NotificationCenter />
                  {typeof user?.score === "number" && (
                    <span className="app-metric-pill">
                      <Zap className="h-3.5 w-3.5 text-cyan-200" />
                      {user.score} XP
                    </span>
                  )}
                  {typeof user?.streak === "number" && (
                    <span className="app-metric-pill">
                      <Flame className="h-3.5 w-3.5 text-orange-200" />
                      {user.streak} day streak
                    </span>
                  )}
                  {headerAction}
                </div>
              </div>
            </div>
          </motion.header>

          {(title || description || eyebrow) && (
            <motion.section
              className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr),18rem]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <div className={cn("app-surface app-grid px-4 py-4 sm:px-5 sm:py-5", heroClassName)}>
                {eyebrow && <span className="app-kicker">{eyebrow}</span>}
                {title && (
                  <h1 className="mt-2.5 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.8rem]">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/80 sm:text-base">
                    {description.replace("{name}", displayName)}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="app-surface-soft p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Session focus</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-white">{routeMeta.focus}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300/74">{routeMeta.note}</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(routeMeta.next.path)}
                  className="app-surface-soft group w-full p-3.5 text-left transition hover:border-cyan-300/18 hover:bg-white/8"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Recommended next</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{routeMeta.next.label}</p>
                    <ArrowRight className="h-4 w-4 text-cyan-100 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <div className="app-surface-soft p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Account status</p>
                  <div className="mt-2.5 space-y-2">
                    {[
                      { label: "Level", value: levelLabel, icon: Sparkles, tone: "text-cyan-100" },
                      { label: "Score", value: scoreLabel, icon: Zap, tone: "text-cyan-200" },
                      { label: "Streak", value: streakLabel, icon: Flame, tone: "text-orange-200" },
                    ].map(({ label, value, icon: Icon, tone }) => (
                      <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                          <Icon className={cn("h-4 w-4", tone)} />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                          <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          <main className="mt-4">{children}</main>
        </div>
        <AppBottomNav />
      </div>
    </div>
  );
};

export default UnifiedPageShell;
