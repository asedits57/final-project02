import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckSquare,
  Flame,
  Languages,
  PenTool,
  Sparkles,
  SpellCheck,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TranslateCard from "@components/learning/TranslateCard";
import GrammarCard from "@components/learning/GrammarCard";
import SentenceCard from "@components/learning/SentenceCard";
import SpellingCard from "@components/learning/SpellingCard";
import JourneyStrip from "@components/shared/JourneyStrip";
import UnifiedPageShell from "@components/shared/UnifiedPageShell";
import { useAuthStore } from "@store/useAuthStore";

const quickActions = [
  {
    label: "Continue to Tasks",
    detail: "Jump straight into guided practice and score-building work.",
    path: "/task",
    icon: CheckSquare,
  },
  {
    label: "Open Learning Hub",
    detail: "Review concepts, reading support, and study material.",
    path: "/learning",
    icon: BookOpen,
  },
  {
    label: "See Live Leaderboard",
    detail: "Check how learners are performing right now.",
    path: "/leaderboard",
    icon: Trophy,
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

const HomeWorkspacePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

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
      accent: "text-violet-200",
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
      eyebrow="Creative Practice Studio"
      title={`Welcome back, ${displayName}`}
      description="Your translate, grammar, sentence improvement, and spelling tools stay on the home page. Use this studio to warm up, then move into tasks, learning, and live progress without breaking the flow."
      headerAction={
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          <UserRound className="h-3.5 w-3.5 text-violet-200" />
          Open Profile
        </button>
      }
    >
      <JourneyStrip
        items={[
          { label: "Home", detail: "Open your language studio.", path: "/", state: "current" },
          { label: "Task", detail: "Move into scored practice modules.", path: "/task", state: "next" },
          { label: "Learn", detail: "Review study guides after practice.", path: "/learning", state: "next" },
          { label: "Leaderboard", detail: "Track live performance and rank.", path: "/leaderboard", state: "next" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <motion.section
          className="app-surface app-grid px-6 py-7 sm:px-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="app-kicker">Studio Overview</span>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start your English session from one creative home deck
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/78">
            This page is now your launch space. Warm up with the AI cards below, jump into guided tasks,
            or move straight to learning and live performance without feeling like you changed products.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {statCards.map(({ label, value, icon: Icon, accent }, index) => (
              <motion.div
                key={label}
                className="app-surface-soft p-4"
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
                    <p className="mt-1 text-lg font-semibold text-white">{value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/task")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(109,40,217,0.35)] transition hover:bg-violet-400"
            >
              Start task flow
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/learning")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open learning hub
            </button>
          </div>
        </motion.section>

        <div className="grid gap-4">
          <motion.section
            className="app-surface-soft p-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Tool deck</p>
            <div className="mt-4 grid gap-3">
              {homeTools.map(({ label, detail, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-violet-300/15 bg-violet-500/10 p-2.5">
                      <Icon className="h-4 w-4 text-violet-200" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300/72">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            className="app-surface-soft p-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Next moves</p>
            <div className="mt-4 space-y-3">
              {quickActions.map(({ label, detail, path, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className="group flex w-full items-start justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/8"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                      <Icon className="h-4 w-4 text-cyan-200" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300/72">{detail}</p>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </motion.section>
        </div>
      </div>

      <motion.section
        className="app-surface mt-6 px-6 py-7 sm:px-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="app-kicker">Essential Home Tools</span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Translate, check grammar, improve sentences, and fix spelling here
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/78">
              These cards stay on the home page as your first practice layer. Use them before tasks,
              during revision, or anytime you want a quick language boost.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/task")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Move to task page
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <motion.div
          className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.14,
              },
            },
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <TranslateCard />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <GrammarCard />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <SentenceCard />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            <SpellingCard />
          </motion.div>
        </motion.div>
      </motion.section>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {quickActions.map(({ label, detail, path, icon: Icon }, index) => (
          <motion.button
            key={label}
            type="button"
            onClick={() => navigate(path)}
            className="app-surface-soft p-5 text-left transition hover:border-violet-300/20 hover:bg-white/8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + index * 0.05 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl border border-violet-300/15 bg-violet-500/10 p-3">
                <Icon className="h-5 w-5 text-violet-200" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-semibold text-white">{label}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-300/72">{detail}</p>
          </motion.button>
        ))}
      </div>
    </UnifiedPageShell>
  );
};

export default HomeWorkspacePage;
