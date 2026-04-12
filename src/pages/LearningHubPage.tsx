import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, CheckCircle2, Clock3, GraduationCap, Lightbulb, Loader2, PlayCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ContextualAIAssistant from "@components/shared/ContextualAIAssistant";
import JourneyStrip from "@components/shared/JourneyStrip";
import UnifiedPageShell from "@components/shared/UnifiedPageShell";
import { apiService as api } from "@services/apiService";
import type {
  LearningCompletionRecord,
  LearningProgressSummary,
  LearningTaskRecord,
  LearningVideoRecord,
} from "@services/learningContentService";
import { useAuthStore } from "@store/useAuthStore";

const resources = [
  {
    key: "grammar-masterclass",
    title: "Grammar Masterclass",
    description: "Study the foundational rules of English grammar with clear examples and focused revision.",
    icon: Brain,
    color: "hsl(188 94% 68%)",
    rewardPoints: 25,
    items: ["Parts of speech", "Tense usage", "Passive voice", "Conditionals"],
    prompt: "Teach me the foundations of English grammar with examples for parts of speech, tense usage, passive voice, and conditionals.",
  },
  {
    key: "vocabulary-builder",
    title: "Vocabulary Builder",
    description: "Expand your word bank with context-based learning and strong academic phrases.",
    icon: Lightbulb,
    color: "hsl(205 84% 68%)",
    rewardPoints: 25,
    items: ["Academic words", "Phrasal verbs", "Idioms", "Collocations"],
    prompt: "Help me build stronger English vocabulary using academic words, phrasal verbs, idioms, and collocations.",
  },
  {
    key: "exam-strategies",
    title: "Exam Strategies",
    description: "Review how to approach each task type before your next attempt.",
    icon: GraduationCap,
    color: "hsl(148 72% 68%)",
    rewardPoints: 30,
    items: ["Reading tips", "Listening shortcuts", "Speaking fluency", "Writing structure"],
    prompt: "Give me practical English test strategies for reading, listening, speaking, and writing tasks.",
  },
  {
    key: "daily-tips",
    title: "Daily Tips",
    description: "Use short high-value lessons to keep the journey moving between practice sessions.",
    icon: Sparkles,
    color: "hsl(28 94% 70%)",
    rewardPoints: 20,
    items: ["Common mistakes", "Pronunciation hacks", "Spelling rules", "Punctuation"],
    prompt: "Give me a short daily English lesson covering common mistakes, pronunciation hacks, spelling rules, and punctuation.",
  },
];

const formatDuration = (seconds?: number) => {
  const totalSeconds = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

const emptyLearningProgress = (): LearningProgressSummary => ({
  completedGuides: [],
  completedVideos: [],
  totalLearningPoints: 0,
});

const buildGuideContext = (resource: typeof resources[number]) =>
  [
    `Guide title: ${resource.title}`,
    `Description: ${resource.description}`,
    `Topics: ${resource.items.join(" | ")}`,
    `Suggested study prompt: ${resource.prompt}`,
  ].join("\n\n");

const buildVideoContext = (video: LearningVideoRecord) =>
  [
    `Video title: ${video.title}`,
    `Description: ${video.description}`,
    `Category: ${video.category}`,
    `Level: ${video.level}`,
    `Tags: ${video.tags.join(" | ") || "None"}`,
    `Duration: ${formatDuration(video.duration)}`,
  ].join("\n\n");

const LearningHubPage = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<LearningVideoRecord[]>([]);
  const [tasks, setTasks] = useState<LearningTaskRecord[]>([]);
  const [progress, setProgress] = useState<LearningProgressSummary>(emptyLearningProgress);
  const [guideBusyKey, setGuideBusyKey] = useState<string | null>(null);
  const [videoBusyId, setVideoBusyId] = useState<string | null>(null);
  const [selectedAiContext, setSelectedAiContext] = useState({
    area: "learning guide",
    title: resources[0].title,
    context: buildGuideContext(resources[0]),
  });

  const loadLearningContent = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      const [videoResponse, taskResponse, progressResponse] = await Promise.all([
        api.listLearningVideos(),
        api.listLearnerTasks(),
        api.getLearningProgress(),
      ]);

      setVideos(videoResponse.data);
      setTasks(taskResponse.data);
      setProgress(progressResponse.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load learning content.");
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadLearningContent();
  }, [loadLearningContent]);

  useEffect(() => {
    const handleTasksChanged = () => {
      void loadLearningContent({ silent: true });
    };
    const handleVideosChanged = () => {
      void loadLearningContent({ silent: true });
    };

    window.addEventListener("app:tasks-changed", handleTasksChanged);
    window.addEventListener("app:videos-changed", handleVideosChanged);

    return () => {
      window.removeEventListener("app:tasks-changed", handleTasksChanged);
      window.removeEventListener("app:videos-changed", handleVideosChanged);
    };
  }, [loadLearningContent]);

  const completedGuideMap = useMemo(
    () => new Map(progress.completedGuides.map((item) => [item.contentKey, item])),
    [progress.completedGuides],
  );

  const completedVideoMap = useMemo(
    () => new Map(progress.completedVideos.map((item) => [item.contentKey, item])),
    [progress.completedVideos],
  );

  const applyCompletionResult = (completion: LearningCompletionRecord, awardedPoints: number) => {
    setProgress((current) => {
      const next = emptyLearningProgress();
      next.completedGuides = [...current.completedGuides];
      next.completedVideos = [...current.completedVideos];
      next.totalLearningPoints = current.totalLearningPoints + awardedPoints;

      if (completion.contentType === "guide") {
        if (!next.completedGuides.some((item) => item.contentKey === completion.contentKey)) {
          next.completedGuides.unshift(completion);
        } else {
          next.totalLearningPoints = current.totalLearningPoints;
        }
      } else {
        if (!next.completedVideos.some((item) => item.contentKey === completion.contentKey)) {
          next.completedVideos.unshift(completion);
        } else {
          next.totalLearningPoints = current.totalLearningPoints;
        }
      }

      return next;
    });
  };

  const syncUserProgress = (user?: { score: number; level: number; streak: number }) => {
    if (!currentUser || !user) {
      return;
    }

    setUser({
      ...currentUser,
      score: user.score,
      level: user.level,
      streak: user.streak,
    });
  };

  const handleCompleteGuide = async (guideKey: string) => {
    try {
      setGuideBusyKey(guideKey);
      setError(null);
      const response = await api.completeLearningGuide(guideKey);
      applyCompletionResult(response.data.completion, response.data.awardedPoints);
      syncUserProgress(response.data.user);
    } catch (completionError) {
      setError(completionError instanceof Error ? completionError.message : "Could not update learning progress.");
    } finally {
      setGuideBusyKey(null);
    }
  };

  const handleCompleteVideo = async (videoId: string) => {
    try {
      setVideoBusyId(videoId);
      setError(null);
      const response = await api.completeLearningVideo(videoId);
      applyCompletionResult(response.data.completion, response.data.awardedPoints);
      syncUserProgress(response.data.user);
    } catch (completionError) {
      setError(completionError instanceof Error ? completionError.message : "Could not update learning progress.");
    } finally {
      setVideoBusyId(null);
    }
  };

  const featuredTasks = useMemo(
    () => [...tasks].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [tasks],
  );

  const taskCategorySummary = useMemo(() => {
    const summary = new Map<string, number>();
    tasks.forEach((task) => {
      const key = task.category || "general";
      summary.set(key, (summary.get(key) || 0) + 1);
    });
    return Array.from(summary.entries()).sort((left, right) => right[1] - left[1]);
  }, [tasks]);

  const featuredVideos = useMemo(
    () => [...videos].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [videos],
  );

  return (
    <UnifiedPageShell
      eyebrow="Step 3 / Study"
      title="Learning hub that follows your practice"
      description="This page now feels like the natural next stop after practice. Review concepts, open admin-published videos, then jump back into guided work or forward into the live leaderboard."
    >
      <JourneyStrip
        items={[
          { label: "Home", detail: "Start in the main workspace.", path: "/home", state: "done" },
          { label: "Task", detail: "Practice before studying.", path: "/task", state: "done" },
          { label: "Learn", detail: "Use guides and strategy refreshers.", path: "/learning", state: "current" },
          { label: "Leaderboard", detail: "Track performance after the cycle.", path: "/leaderboard", state: "next" },
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
              <span className="app-kicker">Study between practice sessions</span>
              <h2 className="mt-2.5 text-3xl font-semibold text-white sm:text-4xl">
                Review only what you need, then move on
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/78">
                This page is now a calmer review space. Use it to close the gap you noticed in practice,
                then continue into the next guided session or the live leaderboard.
              </p>
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
                onClick={() => navigate("/leaderboard")}
                className="brand-button-primary w-full sm:w-auto"
              >
                Next: Leaderboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {[
              { label: "Learning XP claimed", value: `${progress.totalLearningPoints} XP` },
              { label: "Guides completed", value: `${progress.completedGuides.length}` },
              { label: "Videos completed", value: `${progress.completedVideos.length}` },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="app-surface-soft p-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.04 * (index + 1) }}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="app-surface-soft p-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Study rhythm</p>
          <div className="mt-3 space-y-2.5">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Current AI focus</p>
              <p className="mt-1.5 text-sm font-semibold text-white">{selectedAiContext.title}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-3.5 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Top categories</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {taskCategorySummary.slice(0, 4).map(([category, count]) => (
                  <span key={category} className="rounded-full border border-cyan-300/16 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                    {category} / {count}
                  </span>
                ))}
                {!taskCategorySummary.length ? (
                  <span className="text-xs text-slate-400">Categories will appear once tasks are available.</span>
                ) : null}
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <motion.section
        className="app-surface mt-4 px-5 py-5 sm:px-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="app-kicker">Core guides</span>
            <h3 className="mt-3 text-2xl font-bold text-white">Study guides for the next improvement step</h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300/76">
              Choose a guide, review the key topics, and keep the AI coach anchored to that lesson while you work.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="app-surface-soft group p-4 transition-all duration-300 hover:border-cyan-300/24 hover:bg-white/8"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="rounded-2xl border p-2.5"
                style={{ background: `${resource.color}20`, borderColor: `${resource.color}33` }}
              >
                <resource.icon className="h-5 w-5" style={{ color: resource.color }} />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300/72">
                {completedGuideMap.has(resource.key) ? "Completed" : "Guide"}
              </span>
            </div>

            <h3 className="mt-4 text-xl font-semibold text-white">{resource.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300/72">{resource.description}</p>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {resource.items.map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-200/72">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-200" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedAiContext({
                  area: "learning guide",
                  title: resource.title,
                  context: buildGuideContext(resource),
                })}
                className="brand-button-secondary w-full sm:w-auto"
              >
                Study with AI
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => void handleCompleteGuide(resource.key)}
                disabled={guideBusyKey === resource.key || completedGuideMap.has(resource.key)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {guideBusyKey === resource.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {completedGuideMap.has(resource.key) ? "Completed" : `Claim ${resource.rewardPoints} XP`}
              </button>
            </div>
          </motion.div>
        ))}
        </div>
      </motion.section>

      <motion.section
        className="app-surface mt-4 px-5 py-5 sm:px-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="app-kicker">Admin Published Content</span>
            <h3 className="mt-3 text-2xl font-bold text-white">Learning videos in the live section</h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300/76">
              Videos added from the admin page show up here automatically when they are published.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-300/70">
            <BookOpen className="h-3.5 w-3.5" />
            {featuredVideos.length} live videos
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-56 rounded-[2rem] border border-white/10 bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : featuredVideos.length ? (
          <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {featuredVideos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="app-surface-soft group overflow-hidden p-4 transition-all duration-300 hover:border-cyan-300/24 hover:bg-white/8"
              >
                {(() => {
                  const completedVideo = completedVideoMap.get(video._id);
                  return (
                    <>
                <div className="aspect-[16/9] rounded-[1.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(15,23,42,0.92))] p-4 sm:rounded-[1.5rem]">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                        {video.category}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                        {video.level}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open(new URL(video.videoUrl, window.location.origin).toString(), "_blank", "noopener,noreferrer")}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:scale-105 hover:bg-white/15 sm:h-14 sm:w-14"
                      aria-label={`Open ${video.title}`}
                    >
                      <PlayCircle className="h-7 w-7" />
                    </button>
                  </div>
                </div>

                <h4 className="mt-4 text-lg font-semibold text-white">{video.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300/72">{video.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300/70">
                  <div className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDuration(video.duration)}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {video.visibility}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {video.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-cyan-300/14 bg-cyan-500/10 px-3 py-1 text-[11px] text-cyan-100">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(new URL(video.videoUrl, window.location.origin).toString(), "_blank", "noopener,noreferrer")}
                    className="brand-button-primary w-full sm:w-auto"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Watch lesson
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAiContext({
                      area: "learning video",
                      title: video.title,
                      context: buildVideoContext(video),
                    })}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                  >
                    Ask AI
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCompleteVideo(video._id)}
                    disabled={videoBusyId === video._id || completedVideoMap.has(video._id)}
                    className="brand-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {videoBusyId === video._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {completedVideo
                      ? `Completed +${completedVideo.pointsAwarded} XP`
                      : "Mark complete + video XP"}
                  </button>
                </div>
                    </>
                  );
                })()}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-slate-400">
            No published learning videos yet. Admins can add them from the admin console.
          </div>
        )}
      </motion.section>

      <motion.section
        className="app-surface mt-4 px-5 py-5 sm:px-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
      >
        <div className="flex flex-col gap-3">
          <div>
            <span className="app-kicker">Practice Queue</span>
            <h3 className="mt-3 text-2xl font-bold text-white">Tasks currently available for learners</h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300/76">
              Tasks created in the admin console are now visible from the live backend with their linked question-bank content.
            </p>
          </div>
        </div>

        {taskCategorySummary.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {taskCategorySummary.slice(0, 8).map(([category, count]) => (
              <span key={category} className="rounded-full border border-cyan-300/16 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100">
                {category} / {count}
              </span>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-5 grid gap-3.5 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-44 rounded-[2rem] border border-white/10 bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : featuredTasks.length ? (
          <div className="mt-5 grid gap-3.5 lg:grid-cols-2">
            {featuredTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="app-surface-soft p-4 transition-all duration-300 hover:border-cyan-300/24 hover:bg-white/8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300/72">{task.description}</p>
                  </div>
                  {task.submission ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-100">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-200">
                      Ready
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 capitalize">{task.category}</span>
                  <span className="rounded-full border border-cyan-300/14 bg-cyan-500/10 px-3 py-1 text-cyan-100 capitalize">{task.difficulty}</span>
                  {typeof task.questionCount === "number" ? (
                    <span className="rounded-full border border-cyan-300/14 bg-cyan-500/10 px-3 py-1 text-cyan-100">
                      {task.questionCount} questions
                    </span>
                  ) : null}
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">{task.rewardPoints} XP</span>
                  {task.dueDate ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  ) : null}
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
          <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-slate-400">
            No published tasks are available yet. Admin-created tasks will appear here after they are published.
          </div>
        )}
      </motion.section>

      <div className="mt-4 grid gap-3.5 xl:grid-cols-[minmax(0,1fr),20rem]">
        <ContextualAIAssistant
          title={`${selectedAiContext.title} coach`}
          description="Keep the learning page conversational by asking follow-up questions about the guide or video you are working through right now."
          placeholder={`Ask AI about ${selectedAiContext.title.toLowerCase()}...`}
          responseLabel="AI learning coach"
          suggestions={[
            { label: "Summarize", prompt: "Summarize this learning content in simple English." },
            { label: "Quiz me", prompt: "Quiz me on this content with three short questions." },
            { label: "Next steps", prompt: "Tell me what I should practice next after this lesson." },
          ]}
          onAsk={(question) => api.askLearningCoach(selectedAiContext.area, selectedAiContext.context, question)}
        />

        <motion.section
          className="app-surface-soft p-4"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Need more support?</p>
          <h3 className="mt-2.5 text-xl font-semibold text-white">Open the full AI tutor</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300/74">
            Use the full tutor when you want a longer study conversation or help planning the next session.
          </p>

          <button
            type="button"
            onClick={() => navigate("/ai-tutor", { state: { initialPrompt: "Help me choose what to study next based on grammar, vocabulary, listening, speaking, and writing." } })}
            className="brand-button-primary mt-3.5 w-full"
          >
            Open AI tutor
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.section>
      </div>
    </UnifiedPageShell>
  );
};

export default LearningHubPage;
