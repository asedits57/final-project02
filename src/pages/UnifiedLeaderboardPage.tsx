import { useEffect, useState } from "react";
import { Activity, Sparkles, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Podium } from "@components/leaderboard/Podium";
import { RankingsList } from "@components/leaderboard/RankingsList";
import { SkeletonPodiumItem, SkeletonListRow } from "@components/ui/SkeletonLoader";
import ErrorMessage from "@components/ui/ErrorMessage";
import JourneyStrip from "@components/shared/JourneyStrip";
import UnifiedPageShell from "@components/shared/UnifiedPageShell";
import type { LeaderboardUser } from "@lib/leaderboard-types";
import { useLeaderboard } from "@hooks/useLeaderboard";
import { acquireRealtimeSocket, releaseRealtimeSocket } from "@lib/socket";
import { getAccessToken } from "@services/apiClient";
import { useAuthStore } from "@store/useAuthStore";
import type { LeaderboardSnapshot } from "@services/userService";

function LeaderboardSkeleton() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex items-end justify-center gap-4 max-w-4xl mx-auto px-4 py-8">
        <SkeletonPodiumItem className="flex-1" />
        <SkeletonPodiumItem className="flex-1" high />
        <SkeletonPodiumItem className="flex-1" />
      </div>
      <div className="max-w-4xl mx-auto px-4 space-y-2">
        {[1, 2, 3, 4, 5].map((index) => (
          <SkeletonListRow key={index} className="bg-white/5 rounded-2xl border border-white/10" />
        ))}
      </div>
    </div>
  );
}

const UnifiedLeaderboardPage = () => {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const { data, isLoading, isError, error, refetch } = useLeaderboard();
  const [liveSnapshot, setLiveSnapshot] = useState<LeaderboardSnapshot | null>(null);

  useEffect(() => {
    if (data) {
      setLiveSnapshot(data);
    }
  }, [data]);

  useEffect(() => {
    const token = getAccessToken();
    const socket = acquireRealtimeSocket(token);
    if (!socket) {
      return;
    }

    const handleSnapshot = (snapshot: LeaderboardSnapshot) => {
      setLiveSnapshot(snapshot);
    };

    const subscribe = () => {
      socket.emit("leaderboard:subscribe");
    };

    socket.on("leaderboard:snapshot", handleSnapshot);
    if (socket.connected) {
      subscribe();
    } else {
      socket.on("connect", subscribe);
    }

    return () => {
      socket.off("leaderboard:snapshot", handleSnapshot);
      socket.off("connect", subscribe);
      releaseRealtimeSocket();
    };
  }, []);

  if (isError) {
    return (
      <UnifiedPageShell
        eyebrow="Step 4 / Results"
        title="Live leaderboard"
        description="The leaderboard now feels like the next page in the same journey, not a separate product area."
        headerAction={
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="brand-button-secondary rounded-full px-4 py-2 text-xs"
          >
            <UserRound className="h-3.5 w-3.5 text-cyan-100" />
            Open Profile
          </button>
        }
      >
        <ErrorMessage
          message={(error as Error)?.message || "Failed to load leaderboard. Please try again."}
          onRetry={() => refetch()}
        />
      </UnifiedPageShell>
    );
  }

  const snapshot = liveSnapshot || data;
  const activeUsers = snapshot?.activeUsers || 0;
  const snapshotUsers = snapshot?.users || [];

  const users: LeaderboardUser[] = snapshotUsers.map((user, index) => ({
    id: user.id || String(index + 1),
    username: user.email.split("@")[0],
    xp: user.score || 0,
    level: user.level || Math.floor((user.score || 0) / 100) + 1,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
    weekly_xp: user.score || 0,
    rank: index + 1,
    created_at: "",
    updated_at: "",
    is_live: user.isLive,
    live_modules: user.liveModules,
    is_current_user: currentUserId === user.id,
  }));

  const topThree = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <UnifiedPageShell
      eyebrow="Step 4 / Results"
      title="Live leaderboard"
      description="This is now the natural next page after your home, task, and learning flow. Active users rise in real time as they perform."
      headerAction={
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="brand-button-secondary rounded-full px-4 py-2 text-xs"
        >
          <UserRound className="h-3.5 w-3.5 text-cyan-100" />
          Open Profile
        </button>
      }
    >
      <JourneyStrip
        items={[
          { label: "Home", detail: "Begin in your main workspace.", path: "/home", state: "done" },
          { label: "Practice", detail: "Practice and score points.", path: "/task", state: "done" },
          { label: "Learn", detail: "Review guides between attempts.", path: "/learning", state: "done" },
          { label: "Leaderboard", detail: "Track the live results now.", path: "/leaderboard", state: "current" },
        ]}
      />

      <motion.section
        className="app-surface app-grid mt-4 px-4 py-4 sm:px-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="app-kicker">Live Performance</span>
            <h2 className="mt-2.5 text-2xl font-bold text-white sm:text-3xl">
              See who is performing right now
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300/78">
              {activeUsers > 0
                ? `${activeUsers} learners are live right now.`
                : "No one is live yet, but this page will update as soon as practice starts."}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            <Activity className="h-4 w-4" />
            Live users rise as they score
          </div>
        </div>
      </motion.section>

      {isLoading ? (
        <div className="mt-6">
          <LeaderboardSkeleton />
        </div>
      ) : (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6 flex items-center justify-center gap-3">
            <Sparkles className="h-5 w-5 text-cyan-100" />
            <p className="text-sm text-slate-300/72">The leaderboard is part of the same connected journey now.</p>
          </div>
          <Podium topThree={topThree} />
          <div className="mt-8">
            <RankingsList users={remaining} currentUserId={currentUserId} />
          </div>
        </motion.div>
      )}
    </UnifiedPageShell>
  );
};

export default UnifiedLeaderboardPage;
