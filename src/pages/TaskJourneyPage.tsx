import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

import JourneyStrip from "@components/shared/JourneyStrip";
import UnifiedPageShell from "@components/shared/UnifiedPageShell";
import LiveDailyChallenge from "@components/task/LiveDailyChallenge";
import LearningSection from "@components/task/LearningSection";
import StatsPanel from "@components/task/StatsPanel";
import { apiService as api } from "@services/apiService";
import type { LearningTaskRecord } from "@services/learningContentService";
import { useAuthStore } from "@store/useAuthStore";

const TaskJourneyPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [managedTasks, setManagedTasks] = useState<LearningTaskRecord[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);

  const loadManagedTasks = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoadingTasks(true);
      }
      setTaskError(null);
      const response = await api.listLearnerTasks();
      setManagedTasks(response.data);
    } catch (loadError) {
      setTaskError(loadError instanceof Error ? loadError.message : "Could not load live tasks.");
    } finally {
      if (!options?.silent) {
        setLoadingTasks(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadManagedTasks();
  }, [loadManagedTasks]);

  useEffect(() => {
    const handleTasksChanged = () => {
      void loadManagedTasks({ silent: true });
    };

    window.addEventListener("app:tasks-changed", handleTasksChanged);

    return () => {
      window.removeEventListener("app:tasks-changed", handleTasksChanged);
    };
  }, [loadManagedTasks]);

  const liveTasks = useMemo(
    () => [...managedTasks].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [managedTasks],
  );

  const highlights = [
    {
      title: "Start with the daily challenge",
      detail: "Use the live challenge as the first scored block of the session while focus is high.",
    },
    {
      title: "Continue with one skill module",
      detail: "Choose grammar, reading, listening, speaking, or writing based on the weakness you want to improve.",
    },
    {
      title: "Review before switching pages",
      detail: "Check the analytics panel after practice so the next study step is based on real results.",
    },
  ];

  return (
    <UnifiedPageShell
      eyebrow="Step 2 / Practice"
      title="Practice hub for guided work"
      description="{name}, this page now acts like a focused work area. Complete one clear block of practice, review your performance, and then continue into learning or live ranking without losing context."
    >
      <JourneyStrip
        items={[
          { label: "Home", detail: "Start from the main workspace.", path: "/home", state: "done" },
          { label: "Practice", detail: "Choose a challenge or skill module.", path: "/task", state: "current" },
          { label: "Learn", detail: "Review strategies after practice.", path: "/learning", state: "next" },
          { label: "Leaderboard", detail: "See your live rank after scoring.", path: "/leaderboard", state: "next" },
        ]}
      />

      <div className="mt-4 grid gap-3.5 xl:grid-cols-[minmax(0,1.2fr),20rem]">
        <motion.section
          className="app-surface px-4 py-4 sm:px-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="app-kicker">Practice session</span>
              <h2 className="mt-2.5 text-3xl font-semibold text-white sm:text-4xl">
                Keep the session simple and deliberate
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/78">
                This page is designed to support one clear sequence: complete the live challenge, move into
                a focused module, then review performance before you decide what to study next.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap lg:justify-end">
              <button
                type="button"
                onClick={() => navigate("/task/mock-test")}
                className="brand-button-primary w-full sm:w-auto"
              >
                Start mock test
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/learning")}
                className="brand-button-secondary w-full sm:w-auto"
              >
                Open learning hub
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-2.5 md:grid-cols-3">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                className="app-surface-soft p-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * (index + 1) }}
              >
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300/72">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="space-y-3.5">
          <motion.section
            className="app-surface-soft p-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Session snapshot</p>
            <div className="mt-3 space-y-2.5">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Current score</p>
                <p className="mt-1.5 text-lg font-semibold text-white">
                  {typeof user?.score === "number" ? `${user.score} XP` : "0 XP"}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Recommended order</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                  Daily challenge, one module, analytics check, then study review.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="app-surface-soft p-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Support</p>
            <div className="mt-3 space-y-2.5">
              <button
                type="button"
                onClick={() =>
                  navigate("/ai-tutor", {
                    state: {
                      initialPrompt: "I am on the practice page. Help me choose whether to focus on grammar, reading, listening, speaking, or writing next.",
                    },
                  })
                }
                className="brand-button-secondary w-full justify-start"
              >
                <Bot className="h-4 w-4 text-cyan-100" />
                Ask AI what to practice next
              </button>
            </div>
          </motion.section>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <motion.section
          className="app-surface px-5 py-4 sm:px-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="app-kicker">Live task queue</span>
              <h3 className="mt-3 text-2xl font-bold text-white">Admin-published practice tasks</h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300/76">
                These tasks now come directly from the backend, so anything published from admin appears here without a page refresh.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-300/70">
              {liveTasks.length} live tasks
            </div>
          </div>

          {taskError ? (
            <div className="mt-4 rounded-[1.6rem] border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-100">
              {taskError}
            </div>
          ) : null}

          {loadingTasks ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-44 rounded-[1.8rem] border border-white/10 bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : liveTasks.length ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {liveTasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 * index }}
                  className="app-surface-soft p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300/72">{task.description}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${
                      task.submission
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                        : "border-white/10 bg-white/5 text-slate-200"
                    }`}>
                      {task.submission ? "Completed" : "Ready"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 capitalize">{task.category}</span>
                    <span className="rounded-full border border-cyan-300/14 bg-cyan-500/10 px-3 py-1 text-cyan-100 capitalize">{task.difficulty}</span>
                    {typeof task.questionCount === "number" ? (
                      <span className="rounded-full border border-cyan-300/14 bg-cyan-500/10 px-3 py-1 text-cyan-100">
                        {task.questionCount} questions
                      </span>
                    ) : null}
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                      +{task.rewardPoints} XP
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/task/live/${task._id}`)}
                      className="brand-button-primary w-full sm:w-auto"
                    >
                      {task.submission ? "Review task" : "Open task"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-slate-400">
              No published practice tasks are live yet. New admin tasks will appear here as soon as they are published.
            </div>
          )}
        </motion.section>

        <LiveDailyChallenge />
        <LearningSection />
      </div>

      <div id="progress" className="mt-4">
        <StatsPanel />
      </div>

      <motion.section
        className="app-surface mt-4 px-5 py-4 sm:px-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-orange-300/15 bg-orange-500/10 p-2.5">
              <Shield className="h-5 w-5 text-orange-100" />
            </div>
            <div>
              <span className="app-kicker">Final step</span>
              <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">Ready for your final test?</h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300/76">
                When this practice block is complete, move directly into the proctored test flow from here.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/exam-proctor")}
            className="brand-button-primary w-full sm:w-auto"
          >
            Open final test
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.section>
    </UnifiedPageShell>
  );
};

export default TaskJourneyPage;
