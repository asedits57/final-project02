import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Flame,
  Languages,
  Sparkles,
  SpellCheck,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import JourneyStrip from "@components/shared/JourneyStrip";
import ErrorBoundary from "@components/shared/ErrorBoundary";
import UnifiedPageShell from "@components/shared/UnifiedPageShell";
import { Skeleton } from "@components/ui/skeleton";
import useDeferredMount from "@hooks/useDeferredMount";
import { useAuthStore } from "@store/useAuthStore";

const HomeToolDeck = lazy(() => import("@components/home/HomeToolDeck"));

const quickActions = [
  {
    label: "Open learning hub",
    detail: "Review concepts, strategy notes, and published study material.",
    path: "/learning",
    icon: BookOpen,
  },
  {
    label: "See live leaderboard",
    detail: "Check how learners are performing right now and where you stand.",
    path: "/leaderboard",
    icon: Trophy,
  },
  {
    label: "Review profile studio",
    detail: "Update your account, progress details, and learning identity in one place.",
    path: "/profile",
    icon: UserRound,
  },
];

const homeTools = [
  {
    label: "Translate",
    detail: "Move between Tamil and English without leaving home.",
    icon: Languages,
  },
  {
    label: "Grammar Check",
    detail: "Catch issues before you submit your next answer.",
    icon: BrainCircuit,
  },
  {
    label: "Sentence Improvement",
    detail: "Polish rough ideas into stronger English.",
    icon: Sparkles,
  },
  {
    label: "Spelling",
    detail: "Tighten word choice and remove simple mistakes.",
    icon: SpellCheck,
  },
];

const HomeToolDeckFallback = () => (
  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={`home-tool-skeleton-${index}`}
        className="app-surface-soft flex min-h-[16rem] flex-col gap-3 p-5"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
          <Skeleton className="h-5 w-40 bg-white/10" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl bg-white/10" />
        <Skeleton className="h-10 w-full rounded-2xl bg-white/10" />
        <Skeleton className="h-16 w-full rounded-2xl bg-white/10" />
      </div>
    ))}
  </div>
);

const HomeWorkspacePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const showHomeToolDeck = useDeferredMount({ delayMs: 160, timeoutMs: 1000 });

  const displayName =
    user?.fullName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Learner";

  const statCards = [
    {
      label: "Current level",
      value: user?.level ? `Level ${user.level}` : "Level 1",
      icon: Sparkles,
      accent: "text-cyan-100",
    },
    {
      label: "Streak",
      value: typeof user?.streak === "number" ? `${user.streak} days` : "0 days",
      icon: Flame,
      accent: "text-orange-200",
    },
    {
      label: "Score",
      value: typeof user?.score === "number" ? `${user.score} XP` : "0 XP",
      icon: Zap,
      accent: "text-cyan-200",
    },
  ];

  return (
    <UnifiedPageShell
      eyebrow="Session Launchpad"
      title={`Welcome back, ${displayName}`}
      description="Your translation, grammar, sentence improvement, and spelling tools stay here as the first layer of practice. Warm up in this studio, then move into guided work, learning, and live results without breaking flow."
      heroClassName="px-3.5 py-3.5 sm:px-4 sm:py-4"
    >
      <JourneyStrip
        items={[
          { label: "Home", detail: "Open your language studio.", path: "/home", state: "current" },
          { label: "Practice", detail: "Move into scored practice modules.", path: "/task", state: "next" },
          { label: "Learn", detail: "Review study guides after practice.", path: "/learning", state: "next" },
          { label: "Leaderboard", detail: "Track live performance and rank.", path: "/leaderboard", state: "next" },
        ]}
      />

      <div className="mt-4 grid gap-3.5 xl:grid-cols-[minmax(0,1.2fr),20rem]">
        <motion.section
          className="app-surface px-3 py-3 sm:px-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="app-kicker">Workspace overview</span>
              <h2 className="mt-1.5 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Start from one clean workspace, then move through the full learning flow
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300/78">
                Keep the first screen focused. Warm up with the AI tools below, continue into guided
                practice when you are ready, and review in the learning hub after your work session.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap lg:justify-end">
              <button
                type="button"
                onClick={() => navigate("/task")}
                className="brand-button-primary w-full sm:w-auto"
              >
                Start practice flow
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
            {statCards.map(({ label, value, icon: Icon, accent }, index) => (
              <motion.div
                key={label}
                className="app-surface-soft p-2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (index + 1), duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                    <Icon className={`h-4 w-4 ${accent}`} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
                    <p className="mt-0.5 text-lg font-semibold text-white">{value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="brand-divider mt-2.5" />

          <div className="mt-2.5 grid gap-2 md:grid-cols-3">
            {quickActions.map(({ label, detail, path, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                className="app-surface-soft group p-2 text-left transition hover:border-cyan-300/20 hover:bg-white/8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-500/10 p-2.5">
                    <Icon className="h-4 w-4 text-cyan-100" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-1.5 text-sm font-semibold text-white">{label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-300/72">{detail}</p>
              </button>
            ))}
          </div>
        </motion.section>

        <div className="space-y-3.5">
          <motion.section
            className="app-surface-soft p-3.5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Home tools</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Your warm-up utilities</h3>
            <div className="mt-2.5 grid gap-2">
              {homeTools.map(({ label, detail, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-cyan-300/15 bg-cyan-500/10 p-2.5">
                      <Icon className="h-4 w-4 text-cyan-100" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-300/72">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            className="app-surface-soft p-3.5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Session checklist</p>
            <div className="mt-2.5 space-y-2">
              {[
                "Use one AI tool to warm up before entering scored practice.",
                "Complete a focused practice block instead of switching between pages too early.",
                "Finish with learning review or leaderboard tracking when the session ends.",
              ].map((item) => (
                <div key={item} className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3 py-2.5">
                  <p className="text-sm leading-relaxed text-slate-200">{item}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="brand-button-secondary mt-3 w-full"
            >
              <UserRound className="h-4 w-4 text-cyan-100" />
              Review account setup
            </button>
          </motion.section>
        </div>
      </div>

      <motion.section
        className="app-surface mt-4 px-4 py-4 sm:px-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <div className="flex flex-col gap-2.5">
          <div>
            <span className="app-kicker">Essential Home Tools</span>
            <h2 className="mt-2.5 text-2xl font-bold text-white sm:text-3xl">
              Translate, refine, and polish language in one place
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/78">
              These cards stay on the home page as your first practice layer. Use them before modules,
              during revision, or anytime you want a quick language tune-up.
            </p>
          </div>
        </div>

        <ErrorBoundary
          fallback={(
            <div className="mt-6 rounded-[2rem] border border-amber-300/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
              Home AI tools are temporarily unavailable, but the rest of the workspace is ready. You can continue to tasks, learning, or profile without losing progress.
            </div>
          )}
        >
          {showHomeToolDeck ? (
            <Suspense fallback={<HomeToolDeckFallback />}>
              <HomeToolDeck />
            </Suspense>
          ) : (
            <HomeToolDeckFallback />
          )}
        </ErrorBoundary>
      </motion.section>
    </UnifiedPageShell>
  );
};

export default HomeWorkspacePage;
