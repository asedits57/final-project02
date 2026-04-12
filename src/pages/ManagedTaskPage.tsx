import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Loader2, Sparkles, Target } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ContextualAIAssistant from "@components/shared/ContextualAIAssistant";
import JourneyStrip from "@components/shared/JourneyStrip";
import UnifiedPageShell from "@components/shared/UnifiedPageShell";
import { apiService as api } from "@services/apiService";
import type { LearnerTaskDetailRecord } from "@services/learningContentService";
import { useAuthStore } from "@store/useAuthStore";

const ManagedTaskPage = () => {
  const navigate = useNavigate();
  const { taskId = "" } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [task, setTask] = useState<LearnerTaskDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const loadTask = useCallback(async (options?: { silent?: boolean }) => {
    if (!taskId) {
      setError("Task not found.");
      setLoading(false);
      return;
    }

    try {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      const response = await api.getLearnerTask(taskId);
      const nextTask = response.data;

      setTask(nextTask);
      setAnswers((current) => {
        return nextTask.assignedQuestions.reduce<Record<string, string>>((result, item) => {
          result[item.question._id] = current[item.question._id] || "";
          return result;
        }, {});
      });
    } catch (loadError) {
      setTask(null);
      setError(loadError instanceof Error ? loadError.message : "Could not load this task.");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [taskId]);

  useEffect(() => {
    void loadTask();
  }, [loadTask]);

  useEffect(() => {
    const handleTasksChanged = () => {
      void loadTask({ silent: true });
    };

    window.addEventListener("app:tasks-changed", handleTasksChanged);

    return () => {
      window.removeEventListener("app:tasks-changed", handleTasksChanged);
    };
  }, [loadTask]);

  const orderedQuestions = useMemo(
    () => [...(task?.assignedQuestions || [])].sort((left, right) => left.order - right.order),
    [task],
  );

  const allQuestionsAnswered = useMemo(
    () =>
      orderedQuestions.length > 0 &&
      orderedQuestions.every(({ question }) => {
        const value = answers[question._id];
        return typeof value === "string" && value.trim().length > 0;
      }),
    [answers, orderedQuestions],
  );

  const answeredCount = useMemo(
    () =>
      orderedQuestions.filter(({ question }) => {
        const value = answers[question._id];
        return typeof value === "string" && value.trim().length > 0;
      }).length,
    [answers, orderedQuestions],
  );

  const taskContext = useMemo(() => {
    if (!task) {
      return "";
    }

    return [
      `Task title: ${task.title}`,
      `Description: ${task.description}`,
      `Category: ${task.category}`,
      `Difficulty: ${task.difficulty}`,
      `Reward points: ${task.rewardPoints}`,
      orderedQuestions.map(({ question }, index) => {
        const selectedAnswer = answers[question._id];
        return [
          `Question ${index + 1}: ${question.questionText}`,
          question.options?.length ? `Options: ${question.options.join(" | ")}` : "Open response question.",
          selectedAnswer ? `Learner draft answer: ${selectedAnswer}` : "Learner has not answered yet.",
        ].join("\n");
      }).join("\n\n"),
    ].join("\n\n");
  }, [answers, orderedQuestions, task]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!task || task.submission || !allQuestionsAnswered || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await api.submitLearnerTask(
        task._id,
        orderedQuestions.map(({ question }) => ({
          questionId: question._id,
          answer: answers[question._id],
        })),
      );

      setTask((current) => current ? ({
        ...current,
        submission: {
          score: response.data.score,
          earnedPoints: response.data.earnedPoints,
          submittedAt: response.data.submission.submittedAt,
        },
      }) : current);

      if (currentUser && response.data.user) {
        setUser({
          ...currentUser,
          score: response.data.user.score,
          level: response.data.user.level,
          streak: response.data.user.streak,
        });
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit this task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UnifiedPageShell
      eyebrow="Step 2 / Practice"
      title={task?.title || "Live practice task"}
      description="This task is now loaded directly from the admin-managed practice queue, so newly published work appears here without needing a separate static page."
    >
      <JourneyStrip
        items={[
          { label: "Home", detail: "Return to the workspace.", path: "/home", state: "done" },
          { label: "Practice", detail: "Choose a live task or challenge.", path: "/task", state: "done" },
          { label: "Task", detail: "Complete the current practice task.", path: `/task/live/${taskId}`, state: "current" },
          { label: "Study", detail: "Review concepts after submission.", path: "/learning", state: "next" },
        ]}
      />

      <div className="mt-4 grid gap-3.5 xl:grid-cols-[minmax(0,1.15fr),20rem]">
        <motion.section
          className="app-surface px-4 py-4 sm:px-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {loading ? (
            <div className="flex min-h-[16rem] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
            </div>
          ) : error ? (
            <div className="rounded-[1.6rem] border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-100">
              {error}
            </div>
          ) : task ? (
            <>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className="app-kicker">Managed practice task</span>
                  <h2 className="mt-2.5 text-3xl font-semibold text-white sm:text-4xl">{task.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300/78">{task.description}</p>
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap lg:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/task")}
                    className="brand-button-secondary w-full sm:w-auto"
                  >
                    Back to practice
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/learning")}
                    className="brand-button-primary w-full sm:w-auto"
                  >
                    Open learning hub
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-2.5 md:grid-cols-4">
                <div className="app-surface-soft p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Category</p>
                  <p className="mt-2 text-base font-semibold text-white capitalize">{task.category}</p>
                </div>
                <div className="app-surface-soft p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Difficulty</p>
                  <p className="mt-2 text-base font-semibold text-white capitalize">{task.difficulty}</p>
                </div>
                <div className="app-surface-soft p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Questions</p>
                  <p className="mt-2 text-base font-semibold text-white">{orderedQuestions.length}</p>
                </div>
                <div className="app-surface-soft p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Reward</p>
                  <p className="mt-2 text-base font-semibold text-white">+{task.rewardPoints} XP</p>
                </div>
              </div>

              {task.submission ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="app-surface-soft p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Task score</p>
                    <p className="mt-2.5 text-3xl font-semibold text-white">
                      {task.submission.score ?? 0}
                    </p>
                  </div>
                  <div className="app-surface-soft p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Earned points</p>
                    <p className="mt-2.5 text-3xl font-semibold text-cyan-100">
                      +{task.submission.earnedPoints ?? task.rewardPoints}
                    </p>
                  </div>
                  <div className="app-surface-soft p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Submitted</p>
                    <p className="mt-2.5 text-base font-semibold text-white">
                      {task.submission.submittedAt ? new Date(task.submission.submittedAt).toLocaleString() : "Completed"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3.5">
                  {orderedQuestions.map(({ question }, index) => {
                    const answerValue = answers[question._id] || "";
                    const isChoiceQuestion = Array.isArray(question.options) && question.options.length > 0;

                    return (
                      <div key={question._id} className="app-surface-soft p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Question {index + 1}</p>
                            <h3 className="mt-2 text-lg font-semibold text-white">{question.questionText}</h3>
                          </div>
                          <span className="rounded-full border border-cyan-300/18 bg-cyan-500/10 px-3 py-1 text-[11px] text-cyan-100">
                            {question.points || 1} pts
                          </span>
                        </div>

                        {isChoiceQuestion ? (
                          <div className="mt-3 grid gap-2">
                            {question.options!.map((option) => {
                              const isSelected = answerValue === option;

                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => handleAnswerChange(question._id, option)}
                                  className={`rounded-2xl border px-3.5 py-2.5 text-left text-sm transition ${
                                    isSelected
                                      ? "border-cyan-300/40 bg-cyan-500/12 text-white"
                                      : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <Textarea
                            value={answerValue}
                            onChange={(event) => handleAnswerChange(question._id, event.target.value)}
                            rows={3}
                            placeholder="Write your answer here..."
                            className="glass-input mt-3"
                          />
                        )}

                        {question.explanation ? (
                          <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
                            Tip: {question.explanation}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={!allQuestionsAnswered || submitting}
                    className="brand-button-primary w-full disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Submit task
                  </button>
                </div>
              )}
            </>
          ) : null}
        </motion.section>

        <div className="space-y-3.5">
          <motion.section
            className="app-surface-soft p-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Task progress</p>
            <div className="mt-3 space-y-2.5">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Answered</p>
                <p className="mt-1.5 text-lg font-semibold text-white">
                  {task?.submission ? orderedQuestions.length : `${answeredCount} / ${orderedQuestions.length}`}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Due date</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                  {task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Open practice window"}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Status</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
                  {task?.submission ? "Completed and scored" : "Ready to submit once all questions are answered"}
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
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Focus guide</p>
            <div className="mt-3 space-y-2.5">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Target className="h-4 w-4 text-cyan-100" />
                  Work through the questions in order
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300/76">
                  This task uses the admin-managed question set, so the current order matters.
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Clock3 className="h-4 w-4 text-cyan-100" />
                  Keep answers concise and deliberate
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300/76">
                  You can use the AI coach for hints, but finish every answer before submitting.
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  {task?.submission ? <CheckCircle2 className="h-4 w-4 text-emerald-100" /> : <Sparkles className="h-4 w-4 text-cyan-100" />}
                  {task?.submission ? "This task is already completed" : "Submit once every response is filled"}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300/76">
                  Completed tasks update your XP and show up in the connected learning flow.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {task && !task.submission ? (
        <div className="mt-4">
          <ContextualAIAssistant
            title="Task coach"
            description="Ask for a hint, a quick explanation, or a better way to approach this task before you submit."
            placeholder="Ask the AI coach about this task..."
            responseLabel="AI task coach"
            suggestions={[
              { label: "Explain task", prompt: "Explain what this task is testing in simple English." },
              { label: "Give a hint", prompt: "Give me a short hint for the current task without revealing the full answer." },
              { label: "How to score", prompt: "What should I focus on to score well on this task?" },
            ]}
            onAsk={(question) => api.askLearningCoach("practice task", taskContext, question)}
          />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="mt-4 rounded-[1.6rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>If this task was just unpublished or moved to draft, it will disappear from the live learner list until it is published again.</span>
          </div>
        </div>
      ) : null}
    </UnifiedPageShell>
  );
};

export default ManagedTaskPage;
