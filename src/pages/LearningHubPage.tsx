import { useEffect, useMemo, useState } from "react";
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
    color: "hsl(270, 80%, 75%)",
    rewardPoints: 25,
    items: ["Parts of speech", "Tense usage", "Passive voice", "Conditionals"],
    prompt: "Teach me the foundations of English grammar with examples for parts of speech, tense usage, passive voice, and conditionals.",
  },
  {
    key: "vocabulary-builder",
    title: "Vocabulary Builder",
    description: "Expand your word bank with context-based learning and strong academic phrases.",
    icon: Lightbulb,
    color: "hsl(230, 80%, 75%)",
    rewardPoints: 25,
    items: ["Academic words", "Phrasal verbs", "Idioms", "Collocations"],
    prompt: "Help me build stronger English vocabulary using academic words, phrasal verbs, idioms, and collocations.",
  },
  {
    key: "exam-strategies",
    title: "Exam Strategies",
    description: "Review how to approach each task type before your next attempt.",
    icon: GraduationCap,
    color: "hsl(140, 80%, 75%)",
    rewardPoints: 30,
    items: ["Reading tips", "Listening shortcuts", "Speaking fluency", "Writing structure"],
    prompt: "Give me practical English test strategies for reading, listening, speaking, and writing tasks.",
  },
  {
    key: "daily-tips",
    title: "Daily Tips",
    description: "Use short high-value lessons to keep the journey moving between practice sessions.",
    icon: Sparkles,
    color: "hsl(40, 90%, 70%)",
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

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [videoResponse, taskResponse, progressResponse] = await Promise.all([
          api.listLearningVideos(),
          api.listLearnerTasks(),
          api.getLearningProgress(),
        ]);

        if (!active) {
          return;
        }

        setVideos(videoResponse.data);
        setTasks(taskResponse.data);
        setProgress(progressResponse.data);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Could not load learning content.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

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
    () => [...tasks].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 4),
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
    () => videos.slice(0, 6),
    [videos],
  );

  return (
    <UnifiedPageShell
      eyebrow="Step 3 / Study"
      title="Learning hub that follows your practice"
      description="This page now feels like the next stop after tasks. Review concepts, open admin-published videos, then jump back into practice or move forward to the live leaderboard."
    >
      <JourneyStrip
        items={[
          { label: "Home", detail: "Start in the main workspace.", path: "/", state: "done" },
          { label: "Task", detail: "Practice before studying.", path: "/task", state: "done" },
          { label: "Learn", detail: "Use guides and strategy refreshers.", path: "/learning", state: "current" },
          { label: "Leaderboard", detail: "Track performance after the cycle.", path: "/leaderboard", state: "next" },
        ]}
      />

      <motion.section
        className="app-surface app-grid mt-6 px-6 py-7 sm:px-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className="app-kicker">Study Between Practice Sessions</span>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Review what you need, then continue to the next page
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/78">
              The learning hub now sits in the same journey as home and task pages, and it can surface admin-published videos alongside the built-in study guides.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/task")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to task page
            </button>
            <button
              type="button"
              onClick={() => navigate("/leaderboard")}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(109,40,217,0.35)] transition hover:bg-violet-400"
            >
              Next: Leaderboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Learning XP claimed", value: `${progress.totalLearningPoints} XP` },
          { label: "Guides completed", value: `${progress.completedGuides.length}` },
          { label: "Videos completed", value: `${progress.completedVideos.length}` },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            className="app-surface-soft p-5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04 * (index + 1) }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
            <p className="mt-3 text-2xl font-bold text-white">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="app-surface-soft group p-6 transition-all duration-300 hover:border-violet-300/24 hover:bg-white/8"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className="rounded-2xl border p-3"
                style={{ background: `${resource.color}20`, borderColor: `${resource.color}33` }}
              >
                <resource.icon className="h-6 w-6" style={{ color: resource.color }} />
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300/72">
                {completedGuideMap.has(resource.key) ? "Completed" : "Guide"}
              </span>
            </div>

            <h3 className="mt-5 text-2xl font-semibold text-white">{resource.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300/72">{resource.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {resource.items.map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-200/72">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedAiContext({
                  area: "learning guide",
                  title: resource.title,
                  context: buildGuideContext(resource),
                })}
                className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/18 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/16"
              >
                Study with AI
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => void handleCompleteGuide(resource.key)}
                disabled={guideBusyKey === resource.key || completedGuideMap.has(resource.key)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guideBusyKey === resource.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {completedGuideMap.has(resource.key) ? "Completed" : `Claim ${resource.rewardPoints} XP`}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.section
        className="app-surface mt-6 px-6 py-7 sm:px-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="app-kicker">Admin Published Content</span>
            <h3 className="mt-4 text-2xl font-bold text-white">Learning videos in the live section</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/76">
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
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-56 rounded-[2rem] border border-white/10 bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : featuredVideos.length ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredVideos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="app-surface-soft group overflow-hidden p-5 transition-all duration-300 hover:border-violet-300/24 hover:bg-white/8"
              >
                {(() => {
                  const completedVideo = completedVideoMap.get(video._id);
                  return (
                    <>
                <div className="aspect-[16/9] rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(76,29,149,0.35),rgba(30,41,59,0.85))] p-5">
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-violet-100">
                        {video.category}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                        {video.level}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open(new URL(video.videoUrl, window.location.origin).toString(), "_blank", "noopener,noreferrer")}
                      className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:scale-105 hover:bg-white/15"
                      aria-label={`Open ${video.title}`}
                    >
                      <PlayCircle className="h-7 w-7" />
                    </button>
                  </div>
                </div>

                <h4 className="mt-5 text-lg font-semibold text-white">{video.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300/72">{video.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300/70">
                  <div className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDuration(video.duration)}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {video.visibility}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {video.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-violet-300/14 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-100">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(new URL(video.videoUrl, window.location.origin).toString(), "_blank", "noopener,noreferrer")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
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
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Ask AI
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCompleteVideo(video._id)}
                    disabled={videoBusyId === video._id || completedVideoMap.has(video._id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-violet-300/18 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/16 disabled:cursor-not-allowed disabled:opacity-60"
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
        className="app-surface mt-6 px-6 py-7 sm:px-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="app-kicker">Practice Queue</span>
            <h3 className="mt-4 text-2xl font-bold text-white">Tasks currently available for learners</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/76">
              Tasks created in the admin console are now visible from the live backend with their linked question-bank content.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/task")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open Task Hub
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {taskCategorySummary.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {taskCategorySummary.slice(0, 8).map(([category, count]) => (
              <span key={category} className="rounded-full border border-violet-300/16 bg-violet-500/10 px-3 py-1 text-xs text-violet-100">
                {category} • {count}
              </span>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-44 rounded-[2rem] border border-white/10 bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : featuredTasks.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {featuredTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="app-surface-soft p-5 transition-all duration-300 hover:border-violet-300/24 hover:bg-white/8"
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

                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">{task.category}</span>
                  <span className="rounded-full border border-violet-300/14 bg-violet-500/10 px-3 py-1 text-violet-100">{task.difficulty}</span>
                  {typeof task.questionCount === "number" ? (
                    <span className="rounded-full border border-violet-300/14 bg-violet-500/10 px-3 py-1 text-violet-100">
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
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-slate-400">
            No published tasks are available yet. Admin-created tasks will appear here after they are published.
          </div>
        )}
      </motion.section>

      <div className="mt-6">
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
      </div>

      <motion.section
        className="app-surface mt-6 flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
      >
        <div>
          <span className="app-kicker">Need more support?</span>
          <h3 className="mt-4 text-2xl font-bold text-white">Ask the AI tutor without leaving the flow</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/76">
            Keep the same learning journey going by opening the AI tutor directly from here.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/ai-tutor", { state: { initialPrompt: "Help me choose what to study next based on grammar, vocabulary, listening, speaking, and writing." } })}
          className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(109,40,217,0.35)] transition hover:bg-violet-400"
        >
          Open AI tutor
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.section>
    </UnifiedPageShell>
  );
};

export default LearningHubPage;
