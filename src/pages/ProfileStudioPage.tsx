import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  Camera,
  CheckSquare,
  Clock,
  Crown,
  Edit3,
  Flame,
  LogOut,
  Mail,
  Save,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import TaskLevels from "@components/task/TaskLevels";
import UnifiedPageShell from "@components/shared/UnifiedPageShell";
import { brand } from "@lib/brand";
import { useStore } from "@store/useAuthStore";

const achievementsList = [
  { id: 1, name: "First Steps", icon: Sparkles, unlocked: true, accent: "text-cyan-100" },
  { id: 2, name: "7-Day Streak", icon: Flame, unlocked: true, accent: "text-orange-200" },
  { id: 3, name: "Vocabulary Run", icon: BookOpen, unlocked: true, accent: "text-cyan-200" },
  { id: 4, name: "Quiz Master", icon: Trophy, unlocked: true, accent: "text-orange-200" },
  { id: 5, name: "Deep Focus", icon: Target, unlocked: false, accent: "text-slate-500" },
  { id: 6, name: "Elite Review", icon: Award, unlocked: false, accent: "text-slate-500" },
];

const weeklyData = [
  { day: "Mon", hours: 1.6 },
  { day: "Tue", hours: 2.2 },
  { day: "Wed", hours: 1.4 },
  { day: "Thu", hours: 3.0 },
  { day: "Fri", hours: 2.1 },
  { day: "Sat", hours: 3.4 },
  { day: "Sun", hours: 2.5 },
];

const levelLabels = ["Beginner", "Intermediate", "Advanced", "Expert"];

const glassButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10";

const ProfileStudioPage = () => {
  const navigate = useNavigate();
  const clearUser = useStore((state) => state.clearUser);
  const storeUser = useStore((state) => state.user);

  const [avatarSrc, setAvatarSrc] = useState<string | null>(storeUser?.avatar || null);
  const [name, setName] = useState(storeUser?.fullName || storeUser?.email?.split("@")[0] || "Guest User");
  const [level, setLevel] = useState(
    storeUser?.level ? levelLabels[storeUser.level - 1] || "Beginner" : "Beginner",
  );
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftLevel, setDraftLevel] = useState(level);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState({ msg: "", show: false });

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const dept = storeUser?.dept || "English Practice Track";
  const mecId = storeUser?.username || "Not set";
  const email = storeUser?.email || "No email";
  const score = typeof storeUser?.score === "number" ? storeUser.score : 0;
  const streak = typeof storeUser?.streak === "number" ? storeUser.streak : 0;

  const maxHours = useMemo(
    () => Math.max(...weeklyData.map((item) => item.hours)),
    [],
  );

  const skillBars = [
    { name: "Vocabulary", value: Math.min(96, 48 + Math.floor(score / 8)) },
    { name: "Grammar", value: Math.min(94, 44 + streak * 3) },
    { name: "Speaking", value: Math.min(90, 42 + Math.floor(score / 10)) },
    { name: "Listening", value: Math.min(93, 46 + Math.floor(score / 9)) },
    { name: "Reading", value: Math.min(95, 45 + Math.floor(score / 8.5)) },
  ];

  const statsCards = [
    { label: "Total XP", value: `${score}`, icon: Zap, accent: "text-cyan-200" },
    { label: "Day Streak", value: `${streak}`, icon: Flame, accent: "text-orange-200" },
    { label: "Practice Hours", value: "87h", icon: Clock, accent: "text-sky-200" },
    { label: "Accuracy", value: "89%", icon: Target, accent: "text-orange-200" },
  ];

  const quickRoutes = [
    {
      label: "Continue practice",
      detail: "Pick up exactly where your task flow left off.",
      path: "/task",
      icon: CheckSquare,
    },
    {
      label: "Review concepts",
      detail: "Move into reading, grammar, and study material.",
      path: "/learning",
      icon: BookOpen,
    },
  ];

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, 2200);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
    showToast("Profile photo updated");
  };

  const openEdit = () => {
    setDraftName(name);
    setDraftLevel(level);
    setEditOpen(true);
  };

  const saveEdit = () => {
    setName(draftName.trim() || name);
    setLevel(draftLevel);
    setEditOpen(false);
    showToast("Profile saved");
  };

  const handleLogout = async () => {
    await clearUser();
    navigate("/login", { replace: true });
  };

  return (
    <UnifiedPageShell
      eyebrow="Identity And Momentum"
      title={`${name}'s profile studio`}
      description={`Keep your learner identity, progress, and settings in one place. This profile now uses the same product language as the rest of ${brand.name} while keeping your real actions close.`}
      heroClassName="px-4 py-4 sm:px-5 sm:py-5"
      headerAction={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className={glassButtonClass}
          >
            <Settings className="h-4 w-4 text-cyan-100" />
            Settings
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-500/15"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      }
    >
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <motion.section
          className="app-surface px-5 py-5 sm:px-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="app-kicker">Profile Identity</span>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-400 to-orange-400 shadow-[0_18px_48px_rgba(45,212,191,0.2)]">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/90 text-white transition hover:scale-105"
                aria-label="Change avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">{name}</h2>
                <Crown className="h-5 w-5 text-yellow-300 drop-shadow-glow" />
                {storeUser?.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950">
                  {level}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-100">
                  {score} XP
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-100">
                  {streak} day streak
                </span>
              </div>

              <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Email</p>
                  <p className="mt-2 break-all text-sm font-medium text-white">{email}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Track</p>
                  <p className="mt-2 text-sm font-medium text-white">{dept}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Workspace ID</p>
                  <p className="mt-2 text-sm font-medium text-white">{mecId}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Current mode</p>
                  <p className="mt-2 text-sm font-medium text-white">Focused practice</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={openEdit}
                  className="brand-button-primary"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit profile
                </button>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className={glassButtonClass}
                >
                  <Camera className="h-4 w-4 text-cyan-200" />
                  Change photo
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="app-surface app-grid px-6 py-7 sm:px-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <span className="app-kicker">Momentum Atlas</span>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            A richer picture of your learning rhythm
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/78">
            Your profile now reads like a progress desk instead of a static form. Track your score,
            weekly pace, and the skills that are moving fastest.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statsCards.map(({ label, value, icon: Icon, accent }, index) => (
              <motion.div
                key={label}
                className="app-surface-soft p-4"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 + index * 0.04 }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                    <Icon className={`h-4 w-4 ${accent}`} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-500/10 p-2.5">
                  <TrendingUp className="h-4 w-4 text-cyan-100" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Weekly pulse</p>
                  <p className="text-xs text-slate-300/70">How steadily you are showing up this week.</p>
                </div>
              </div>

              <div className="mt-5 flex h-36 items-end justify-between gap-3">
                {weeklyData.map(({ day, hours }) => (
                  <div key={day} className="flex flex-1 flex-col items-center gap-3">
                    <div className="relative w-full overflow-hidden rounded-t-2xl bg-white/5" style={{ height: `${(hours / maxHours) * 100}px` }}>
                      <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-cyan-400 to-orange-400" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-2.5">
                  <Mail className="h-4 w-4 text-cyan-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Current route</p>
                  <p className="text-xs text-slate-300/70">Stay close to the next actions that matter most.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {quickRoutes.map(({ label, detail, path, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(path)}
                    className="group flex w-full items-start justify-between rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-4 text-left transition hover:bg-white/8"
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
            </div>
          </div>
        </motion.section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <motion.section
          className="app-surface-soft p-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Quick Settings</p>

          <div className="mt-4 space-y-3">
            {[
              {
                label: "Push notifications",
                detail: "Get gentle nudges when progress moves.",
                icon: Bell,
                value: notificationsEnabled,
                setValue: setNotificationsEnabled,
              },
              {
                label: "System sounds",
                detail: "Keep audio cues while you practice.",
                icon: Volume2,
                value: soundEnabled,
                setValue: setSoundEnabled,
              },
            ].map(({ label, detail, icon: Icon, value, setValue }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                    <Icon className="h-4 w-4 text-cyan-100" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs text-slate-300/72">{detail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValue(!value);
                    showToast(`${label} ${!value ? "enabled" : "disabled"}`);
                  }}
                  className={`relative h-7 w-14 rounded-full transition ${value ? "bg-cyan-400" : "bg-white/10"}`}
                  aria-label={label}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${value ? "left-8" : "left-1"}`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Settings className="h-4 w-4 text-cyan-100" />
            Open advanced settings
          </button>
        </motion.section>

        <motion.section
          className="app-surface px-6 py-7 sm:px-8"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
            <div>
              <span className="app-kicker">Skill Matrix</span>
              <h2 className="mt-4 text-2xl font-bold text-white">Strengths building across your core skills</h2>
              <div className="mt-5 space-y-4">
                {skillBars.map(({ name: skillName, value }) => (
                  <div key={skillName}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-200">{skillName}</span>
                      <span className="text-slate-400">{value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-orange-400"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="app-kicker">Achievement Shelf</span>
              <h2 className="mt-4 text-2xl font-bold text-white">Milestones already earned and what is next</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {achievementsList.map(({ id, name: achievementName, icon: Icon, unlocked, accent }) => (
                  <div
                    key={id}
                    className={`rounded-[1.5rem] border p-4 text-center ${
                      unlocked
                        ? "border-white/10 bg-white/5"
                        : "border-white/5 bg-white/[0.03] opacity-70"
                    }`}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40">
                      <Icon className={`h-5 w-5 ${accent}`} />
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                      {achievementName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <motion.section
        className="app-surface mt-6 px-6 py-7 sm:px-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="app-kicker">Practice Runway</span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Keep your next practice level close
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/78">
              Your profile should not trap you in settings. It should send you back into practice with context.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/task")}
            className="brand-button-primary"
          >
            Return to practice
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">
          <TaskLevels compact />
        </div>
      </motion.section>

      <AnimatePresence>
        {editOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditOpen(false)}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 z-[70] w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/10 bg-[rgba(14,12,28,0.96)] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
              initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.92, x: "-50%", y: "-50%" }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Profile Edit</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Adjust your display setup</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Display name</span>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="glass-input"
                    placeholder="Your name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Practice level</span>
                  <select
                    value={draftLevel}
                    onChange={(event) => setDraftLevel(event.target.value)}
                    className="glass-input cursor-pointer appearance-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="brand-button-primary flex-1 px-4 py-3"
                >
                  <span className="inline-flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div
            key="profile-toast"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-28 left-1/2 z-[999] -translate-x-1/2 rounded-2xl border border-white/10 bg-[rgba(22,18,44,0.95)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </UnifiedPageShell>
  );
};

export default ProfileStudioPage;
