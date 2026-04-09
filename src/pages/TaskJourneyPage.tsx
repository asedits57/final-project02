import { motion } from "framer-motion";
import { ArrowRight, Bot, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiveDailyChallenge from "@components/task/LiveDailyChallenge";
import LearningSection from "@components/task/LearningSection";
import StatsPanel from "@components/task/StatsPanel";
import JourneyStrip from "@components/shared/JourneyStrip";
import UnifiedPageShell from "@components/shared/UnifiedPageShell";
import { useAuthStore } from "@store/useAuthStore";

const TaskJourneyPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const highlights = [
    {
      title: "Daily challenge first",
      detail: "Pick up where the home page leaves off with a focused challenge that drives score and streak.",
    },
    {
      title: "Skill modules next",
      detail: "Reading, writing, listening, and speaking now feel like part of the same practice journey.",
    },
    {
      title: "Study comes after",
      detail: "Use the learning hub right after practice when you want revision or strategy refreshers.",
    },
  ];

  return (
    <UnifiedPageShell
      eyebrow="Step 2 / Practice"
      title="Task hub for guided practice"
      description={`{name}, this page now continues naturally from home. Finish a challenge, move into a skill module, then continue to learning or live ranking without a context break.`}
      headerAction={
        <button
          type="button"
          onClick={() => navigate("/learning")}
          className="hidden rounded-full border border-violet-300/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/18 md:inline-flex"
        >
          Next: Learn
        </button>
      }
    >
      <JourneyStrip
        items={[
          { label: "Home", detail: "Start from the main workspace.", path: "/", state: "done" },
          { label: "Task", detail: "Choose a challenge or skill module.", path: "/task", state: "current" },
          { label: "Learn", detail: "Review strategies after practice.", path: "/learning", state: "next" },
          { label: "Leaderboard", detail: "See your live rank after scoring.", path: "/leaderboard", state: "next" },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <motion.section
          className="app-surface app-grid px-6 py-7 sm:px-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="app-kicker">Connected Practice Flow</span>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Home, task, and learning now move page by page
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/78">
            Instead of feeling like a different project, this task page now sits in the same flow as your
            home page. Choose your challenge, complete a module, then continue into learning content or your
            live ranking.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/task/mock-test")}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(109,40,217,0.35)] transition hover:bg-violet-400"
            >
              Start mock test
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/learning")}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open learning hub
            </button>
          </div>
        </motion.section>

        <div className="grid gap-4">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              className="app-surface-soft p-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * (index + 1) }}
            >
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300/72">{item.detail}</p>
            </motion.div>
          ))}

          <motion.div
            className="app-surface-soft flex items-start gap-3 p-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.24 }}
          >
            <div className="rounded-2xl border border-violet-300/15 bg-violet-500/10 p-2.5">
              <Sparkles className="h-4 w-4 text-violet-200" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {typeof user?.score === "number" ? `${user.score} XP ready to grow` : "Keep building momentum"}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300/72">
                Use the task page as the central step before you move onward to study or leaderboard views.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div id="task-cards" className="mt-6 rounded-[2.5rem] border border-violet-400/12 bg-[rgba(11,10,26,0.55)] p-2 shadow-[0_16px_48px_rgba(10,10,30,0.35)] backdrop-blur-2xl">
        <LiveDailyChallenge />
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-violet-300/20 to-transparent" />
        <LearningSection />
      </div>

      <div id="progress" className="mt-2">
        <StatsPanel />
      </div>

      <motion.section
        className="app-surface mt-4 px-6 py-6 sm:px-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-violet-300/15 bg-violet-500/10 p-3">
              <Shield className="h-6 w-6 text-violet-200" />
            </div>
            <div>
              <span className="app-kicker">Final Step</span>
              <h3 className="mt-4 text-2xl font-bold text-white">Ready for your final test?</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/76">
                When you finish your practice path, continue into the proctored test experience from here without leaving the same app flow.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/exam-proctor")}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(109,40,217,0.35)] transition hover:bg-violet-400"
          >
            Open final test
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.section>

      <motion.button
        type="button"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() =>
          navigate("/ai-tutor", {
            state: {
              initialPrompt: "I am on the task page. Help me choose whether to practice grammar, reading, listening, speaking, or writing next.",
            },
          })
        }
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.45)] transition hover:scale-110"
        aria-label="Open AI tutor"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -right-1 top-0 h-3 w-3 rounded-full border-2 border-[#120a1f] bg-emerald-400" />
      </motion.button>
    </UnifiedPageShell>
  );
};

export default TaskJourneyPage;
