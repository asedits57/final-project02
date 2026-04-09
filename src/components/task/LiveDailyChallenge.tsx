import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, Flame, Loader2, Sparkles, Target, Trophy } from "lucide-react";

import ContextualAIAssistant from "@components/shared/ContextualAIAssistant";
import { apiService as api } from "@services/apiService";
import type { ActiveDailyTaskRecord } from "@services/learningContentService";
import { useAuthStore } from "@store/useAuthStore";

const LiveDailyChallenge = () => {
    const [dailyTask, setDailyTask] = useState<ActiveDailyTaskRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const currentUser = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    useEffect(() => {
        let active = true;

        const loadDailyTask = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.getActiveDailyTask();

                if (!active) {
                    return;
                }

                setDailyTask(response.data);
                if (response.data?.submission) {
                    setExpanded(true);
                }
            } catch (loadError) {
                if (!active) {
                    return;
                }

                setError(loadError instanceof Error ? loadError.message : "Could not load the daily task.");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadDailyTask();

        return () => {
            active = false;
        };
    }, []);

    const orderedQuestions = useMemo(
        () => [...(dailyTask?.assignedQuestions || [])].sort((left, right) => left.order - right.order),
        [dailyTask],
    );

    const allQuestionsAnswered = orderedQuestions.every(({ question }) => {
        const value = answers[question._id];
        return typeof value === "string" && value.trim().length > 0;
    });

    const dailyTaskContext = dailyTask
        ? [
            `Daily task: ${dailyTask.title}`,
            `Description: ${dailyTask.description}`,
            `Reward points: ${dailyTask.rewardPoints}`,
            orderedQuestions
                .map(({ question }, index) => {
                    const selectedAnswer = answers[question._id];
                    return [
                        `Question ${index + 1}: ${question.questionText}`,
                        question.options?.length ? `Options: ${question.options.join(" | ")}` : "Open response question.",
                        selectedAnswer ? `Learner draft answer: ${selectedAnswer}` : "Learner has not answered yet.",
                    ].join("\n");
                })
                .join("\n\n"),
          ].join("\n\n")
        : "";

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((current) => ({
            ...current,
            [questionId]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!dailyTask || !allQuestionsAnswered || submitting) {
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const response = await api.submitDailyTask(
                dailyTask._id,
                orderedQuestions.map(({ question }) => ({
                    questionId: question._id,
                    answer: answers[question._id],
                })),
            );

            setDailyTask((current) => current ? ({
                ...current,
                submission: {
                    score: response.data.score,
                    maxScore: response.data.maxScore,
                    earnedPoints: response.data.earnedPoints,
                    submittedAt: response.data.submission.submittedAt,
                },
            }) : current);
            setExpanded(true);

            if (currentUser && response.data.user) {
                setUser({
                    ...currentUser,
                    score: response.data.user.score,
                    level: response.data.user.level,
                    streak: response.data.user.streak,
                });
            }
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Could not submit the daily task.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="relative w-full px-6 pt-6 md:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="relative overflow-hidden rounded-3xl p-8"
                style={{
                    background: "linear-gradient(135deg, hsla(270, 30%, 9%, 0.92) 0%, hsla(262, 50%, 12%, 0.92) 100%)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid hsla(270, 80%, 55%, 0.25)",
                    boxShadow: "0 0 40px hsla(270, 80%, 55%, 0.1), inset 0 1px 0 hsla(270, 60%, 70%, 0.08)",
                }}
            >
                <div
                    className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20"
                    style={{ background: "hsl(270, 80%, 55%)", filter: "blur(60px)" }}
                />
                <div
                    className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full opacity-10"
                    style={{ background: "hsl(185, 100%, 50%)", filter: "blur(50px)" }}
                />

                <div className="relative z-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <div
                                className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                                style={{
                                    background: "hsla(270, 80%, 55%, 0.15)",
                                    border: "1px solid hsla(270, 80%, 55%, 0.3)",
                                }}
                            >
                                <Flame className="h-4 w-4 text-orange-400" />
                                <span className="font-poppins text-xs font-semibold tracking-wide text-violet-300">
                                    Daily Challenge
                                </span>
                                <span className="text-xs font-bold text-orange-400">Live task</span>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    <div className="h-8 w-56 animate-pulse rounded-2xl bg-white/10" />
                                    <div className="h-4 w-full max-w-xl animate-pulse rounded-xl bg-white/10" />
                                    <div className="h-4 w-full max-w-lg animate-pulse rounded-xl bg-white/10" />
                                </div>
                            ) : dailyTask ? (
                                <>
                                    <div className="flex flex-wrap items-start gap-3">
                                        <h3 className="font-poppins text-2xl font-bold md:text-3xl">
                                            {dailyTask.title}
                                        </h3>
                                        {dailyTask.submission ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/22 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-100">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Completed
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                        {dailyTask.description}
                                    </p>

                                    <div className="mt-5 flex flex-wrap items-center gap-5">
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4 text-violet-400" />
                                            Active until {new Date(dailyTask.expiryDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Target className="h-4 w-4 text-violet-400" />
                                            +{dailyTask.rewardPoints} XP reward
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Sparkles className="h-4 w-4 text-yellow-400" />
                                            {orderedQuestions.length} scored questions
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Trophy className="h-4 w-4 text-amber-400" />
                                            Leaderboard points update instantly
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="font-poppins text-2xl font-bold md:text-3xl">
                                        No active daily task right now
                                    </h3>
                                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                        When an admin publishes a live daily task, it will appear here and feed points into the leaderboard automatically.
                                    </p>
                                </>
                            )}
                        </div>

                        {dailyTask ? (
                            <button
                                type="button"
                                onClick={() => setExpanded((current) => !current)}
                                className="group relative shrink-0 overflow-hidden rounded-2xl px-7 py-3.5 font-poppins font-semibold text-white transition-all duration-300 hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                                    boxShadow: "0 0 25px hsla(262, 83%, 58%, 0.4)",
                                }}
                            >
                                <span
                                    className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1), transparent)" }}
                                />
                                <span className="relative z-10">
                                    {dailyTask.submission ? (expanded ? "Hide results" : "Review results") : (expanded ? "Hide challenge" : "Open challenge")}
                                </span>
                            </button>
                        ) : null}
                    </div>

                    {error ? (
                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    ) : null}

                    {expanded && dailyTask ? (
                        <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
                            {dailyTask.submission ? (
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Task score</p>
                                        <p className="mt-3 text-3xl font-bold text-white">
                                            {dailyTask.submission.score ?? 0}
                                            <span className="ml-2 text-base font-medium text-slate-400">/ {dailyTask.submission.maxScore ?? 0}</span>
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Leaderboard XP</p>
                                        <p className="mt-3 text-3xl font-bold text-violet-100">
                                            +{dailyTask.submission.earnedPoints ?? dailyTask.rewardPoints}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Completed on</p>
                                        <p className="mt-3 text-lg font-semibold text-white">
                                            {dailyTask.submission.submittedAt
                                                ? new Date(dailyTask.submission.submittedAt).toLocaleString()
                                                : "Today"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-4">
                                        {orderedQuestions.map(({ question }, index) => {
                                            const answerValue = answers[question._id] || "";
                                            const isChoiceQuestion = Array.isArray(question.options) && question.options.length > 0;

                                            return (
                                                <div
                                                    key={question._id}
                                                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                                                >
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-[11px] uppercase tracking-[0.22em] text-violet-300/72">
                                                                Question {index + 1}
                                                            </p>
                                                            <h4 className="mt-2 text-lg font-semibold text-white">
                                                                {question.questionText}
                                                            </h4>
                                                        </div>
                                                        <span className="rounded-full border border-violet-300/18 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-100">
                                                            {question.points || 1} pts
                                                        </span>
                                                    </div>

                                                    {isChoiceQuestion ? (
                                                        <div className="mt-4 grid gap-2">
                                                            {question.options!.map((option) => {
                                                                const isSelected = answerValue === option;
                                                                return (
                                                                    <button
                                                                        key={option}
                                                                        type="button"
                                                                        onClick={() => handleAnswerChange(question._id, option)}
                                                                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                                                            isSelected
                                                                                ? "border-violet-400/60 bg-violet-500/16 text-white"
                                                                                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                                                                        }`}
                                                                    >
                                                                        {option}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <textarea
                                                            value={answerValue}
                                                            onChange={(event) => handleAnswerChange(question._id, event.target.value)}
                                                            rows={3}
                                                            placeholder="Write your answer here..."
                                                            className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50 focus:bg-black/30"
                                                        />
                                                    )}

                                                    {question.explanation ? (
                                                        <p className="mt-3 text-xs leading-relaxed text-slate-400">
                                                            Tip: {question.explanation}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => void handleSubmit()}
                                        disabled={!allQuestionsAnswered || submitting}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(109,40,217,0.35)] transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-55"
                                    >
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        Submit daily task
                                    </button>
                                </>
                            )}

                            <ContextualAIAssistant
                                title="Daily task coach"
                                description="Ask for hints, concept refreshers, or a quick explanation before you submit this live challenge."
                                placeholder="Ask the AI coach about this daily task..."
                                responseLabel="AI daily task coach"
                                suggestions={[
                                    { label: "Explain task", prompt: "Explain what this daily task is testing in simple English." },
                                    { label: "Give a hint", prompt: "Give me a short hint without revealing the full answer." },
                                    { label: "How to score well", prompt: "What should I focus on to earn the best score on this daily task?" },
                                ]}
                                onAsk={(question) => api.askLearningCoach("daily task", dailyTaskContext, question)}
                            />
                        </div>
                    ) : null}
                </div>
            </motion.div>
        </section>
    );
};

export default LiveDailyChallenge;
