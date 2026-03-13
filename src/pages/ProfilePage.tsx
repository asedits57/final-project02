import { motion, AnimatePresence } from "framer-motion";
import {
    Home, CheckSquare, Trophy, User, Settings,
    Flame, Star, BookOpen, Clock, Target,
    TrendingUp, Award, Crown, CheckCircle, Edit3,
    Bell, Lock, Volume2, X, Save, LogOut,
} from "lucide-react";
import { clearUser, getUser } from "@/lib/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import TaskLevels from "@/components/task/TaskLevels";

/* ─── Nav ─── */
const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Task", icon: CheckSquare, path: "/task" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { label: "Profile", icon: User, path: "/profile" },
];

/* ─── Static data ─── */
const achievementsList = [
    { id: 1, name: "First Steps", icon: Star, unlocked: true, color: "text-yellow-400" },
    { id: 2, name: "7-Day Streak", icon: Flame, unlocked: true, color: "text-orange-400" },
    { id: 3, name: "500 Words", icon: BookOpen, unlocked: true, color: "text-violet-400" },
    { id: 4, name: "Quiz Master", icon: Trophy, unlocked: true, color: "text-fuchsia-400" },
    { id: 5, name: "30-Day Streak", icon: Flame, unlocked: false, color: "text-muted-foreground" },
    { id: 6, name: "1000 Words", icon: BookOpen, unlocked: false, color: "text-muted-foreground" },
];

const weeklyData = [
    { day: "Mon", hrs: 1.5 }, { day: "Tue", hrs: 2.0 }, { day: "Wed", hrs: 1.2 },
    { day: "Thu", hrs: 2.8 }, { day: "Fri", hrs: 1.8 }, { day: "Sat", hrs: 3.0 }, { day: "Sun", hrs: 2.2 },
];
const maxHrs = Math.max(...weeklyData.map((d) => d.hrs));

const skillBars = [
    { name: "Vocabulary", value: 75 }, { name: "Grammar", value: 65 },
    { name: "Speaking", value: 58 }, { name: "Listening", value: 72 }, { name: "Reading", value: 70 },
];

/* ─── Helpers ─── */
const glassBtn = {
    background: "rgba(139, 92, 246, 0.12)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
};

export default function ProfilePage() {
    const navigate = useNavigate();
    const location = useLocation();

    /* ── profile state ── */
    const authUser = getUser();
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
    const [name, setName] = useState(authUser?.fullName || authUser?.username || "Guest User");
    const [dept, setDept] = useState(authUser?.dept || "Department not set");
    const [level, setLevel] = useState(authUser?.level ? authUser.level.charAt(0).toUpperCase() + authUser.level.slice(1) : "Beginner");
    const avatarInputRef = useRef<HTMLInputElement>(null);

    /* ── edit modal ── */
    const [editOpen, setEditOpen] = useState(false);
    const [draftName, setDraftName] = useState(name);
    const [draftLevel, setDraftLevel] = useState(level);

    /* ── toggles ── */
    const [notifs, setNotifs] = useState(true);
    const [pronounce, setPronounce] = useState(true);
    const [grammar, setGrammar] = useState(false);

    /* ── toast ── */
    const [toast, setToast] = useState({ msg: "", show: false });
    const showToast = (msg: string) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    };

    /* ── handlers ── */
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAvatarSrc(url);
        showToast("Profile photo updated ✓");
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
        showToast("Profile saved ✓");
    };



    const handleLogout = () => {
        clearUser();
        navigate("/login");
    };

    const statsCards = [
        { label: "Words Learned", value: "1,247", icon: BookOpen, color: "text-violet-400" },
        { label: "Day Streak", value: "15", icon: Flame, color: "text-orange-400" },
        { label: "Accuracy", value: "89%", icon: Target, color: "text-fuchsia-400" },
        { label: "Practice Hours", value: "87h", icon: Clock, color: "text-blue-400" },
    ];

    return (
        <div className="relative min-h-screen animated-bg overflow-hidden text-foreground">
            {/* Gradient blobs */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, hsl(270 80% 55% / 0.4), transparent 70%)" }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, hsl(280 85% 60% / 0.4), transparent 70%)" }} />
            </div>
            <AnimatedBackground />

            {/* ── Hidden file input for avatar ── */}
            <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
            />

            {/* ══ Content ══ */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 pb-28">

                {/* TOP BAR */}
                <motion.div className="flex items-center justify-between mb-8"
                    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <h1 className="font-display text-2xl font-bold glow-text">My Profile</h1>
                    <div className="flex items-center gap-3">
                        <button
                            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                            style={glassBtn}
                            aria-label="Settings"
                            onClick={() => navigate("/settings")}
                        >
                            <Settings className="w-5 h-5" style={{ color: "hsl(270, 80%, 75%)" }} />
                        </button>
                        <button
                            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                            style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)" }}
                            aria-label="Logout"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" style={{ color: "hsl(0, 80%, 70%)" }} />
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Profile & Status */}
                    <div className="md:col-span-5 space-y-8">
                        {/* PROFILE CARD */}
                        <motion.div className="glass-card p-8"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                            <div className="flex items-center gap-6">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div
                                        className="w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden"
                                        style={{
                                            background: "linear-gradient(135deg, hsl(270 80% 50%), hsl(280 85% 60%))",
                                            boxShadow: "0 0 30px hsl(270 80% 55% / 0.35)",
                                        }}
                                    >
                                        {avatarSrc
                                            ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                                            : <User className="w-11 h-11 text-white" />}
                                    </div>
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                        style={{ background: "hsl(270 80% 55%)", border: "2px solid hsl(270 100% 4%)" }}
                                        aria-label="Change avatar"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h2 className="font-display text-xl font-bold text-foreground">{name}</h2>
                                        <Crown className="w-4 h-4 text-yellow-400"
                                            style={{ filter: "drop-shadow(0 0 6px rgba(234,179,8,0.6))" }} />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-3 opacity-60">
                                        {dept}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="text-[11px] px-3.5 py-1 rounded-full font-bold text-white"
                                            style={{ background: "linear-gradient(135deg, hsl(270 80% 50%), hsl(280 85% 60%))" }}>
                                            {level}
                                        </span>
                                        <span className="text-[11px] px-3.5 py-1 rounded-full font-bold"
                                            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "hsl(270,80%,75%)" }}>
                                            2,847 XP
                                        </span>
                                    </div>
                                    <button
                                        onClick={openEdit}
                                        className="text-[11px] px-4 py-1.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                                        style={{ ...glassBtn, color: "hsl(270,80%,75%)" }}
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* STATS - BIGGER AND FILLING SPACE */}
                        <div className="grid grid-cols-2 gap-6">
                            {statsCards.map(({ label, value, icon: Icon, color }, i) => (
                                <motion.div key={label} className="glass-card p-8 flex flex-col justify-between"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: 0.1 + i * 0.1 }}>
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                                                <Icon className={`w-5 h-5 ${color}`} />
                                            </div>
                                            <span className="text-[11px] text-muted-foreground font-black uppercase tracking-wider">{label}</span>
                                        </div>
                                        <p className="font-display text-3xl lg:text-4xl font-bold text-foreground tracking-tight">{value}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black opacity-30">Lifetime Stat</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Progress & Insights */}
                    <div className="md:col-span-7 space-y-8">
                        {/* LEARNING PROGRESS */}
                        <motion.div className="glass-card p-8"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                                    <TrendingUp className="w-5 h-5 text-violet-400" />
                                </div>
                                <h3 className="font-display text-lg font-bold text-foreground">Learning progress</h3>
                            </div>
                            <div className="mb-8">
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-muted-foreground font-bold italic opacity-70">Progress to next level</span>
                                    <span className="font-black text-violet-400">67%</span>
                                </div>
                                <div className="h-3.5 rounded-full bg-violet-500/5 p-1 border border-violet-500/10">
                                    <div className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: "67%", background: "linear-gradient(90deg, hsl(270 80% 50%), hsl(280 85% 60%))", boxShadow: "0 0 15px hsl(270 80% 55% / 0.4)" }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                                {skillBars.map(({ name: n, value }) => (
                                    <div key={n}>
                                        <div className="flex justify-between text-[11px] mb-2.5">
                                            <span className="text-muted-foreground font-black uppercase tracking-tight">{n}</span>
                                            <span className="text-foreground font-black">{value}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-violet-500/5">
                                            <div className="h-full rounded-full"
                                                style={{ width: `${value}%`, background: "linear-gradient(90deg, hsl(270 80% 55%), hsl(280 85% 65%))" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {/* WEEKLY ACTIVITY */}
                            <motion.div className="glass-card p-8"
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                                        <Clock className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <h3 className="font-display text-base font-bold text-foreground">Weekly activity</h3>
                                </div>
                                <div className="flex items-end justify-between gap-3" style={{ height: 110 }}>
                                    {weeklyData.map(({ day, hrs }) => (
                                        <div key={day} className="flex-1 flex flex-col items-center gap-3">
                                            <div className="w-full rounded-t-2xl relative overflow-hidden group"
                                                style={{ height: `${(hrs / maxHrs) * 100}px` }}>
                                                <div className="absolute inset-0 rounded-t-2xl transition-all duration-300 group-hover:brightness-125"
                                                    style={{ background: "linear-gradient(180deg, hsl(275 85% 65%), hsl(270 80% 50%))", boxShadow: "0 0 8px hsl(270 80% 55% / 0.3)" }} />
                                            </div>
                                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">{day}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* DAILY GOAL */}
                            <motion.div className="glass-card p-8"
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                            <Target className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <h3 className="font-display text-base font-bold text-foreground">Daily goal</h3>
                                    </div>
                                    <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">15 / 20</span>
                                </div>
                                <div className="h-3.5 rounded-full mb-8 bg-emerald-500/5 p-1 border border-emerald-500/10">
                                    <div className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: "75%", background: "linear-gradient(90deg, #10b981, #059669)", boxShadow: "0 0 12px rgba(16,185,129,0.3)" }} />
                                </div>
                                <div className="flex gap-2">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className="flex-1 h-8 rounded-xl flex items-center justify-center text-[10px] font-black"
                                            style={
                                                i < 5
                                                    ? { background: "linear-gradient(135deg, #10b981, #059669)", color: "white", boxShadow: "0 2px 5px rgba(16,185,129,0.2)" }
                                                    : i === 5
                                                        ? { background: "linear-gradient(135deg, hsl(270 80% 50%), hsl(280 85% 60%))", color: "white", boxShadow: "0 2px 5px rgba(139,92,246,0.3)" }
                                                        : { background: "rgba(139,92,246,0.05)", color: "hsl(270,80%,60%)", border: "1px dashed rgba(139,92,246,0.2)" }
                                            }>
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* EXPANDED SECTION: ACHIEVEMENTS & SETTINGS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* ACHIEVEMENTS - BIGGER */}
                    <motion.div className="glass-card p-10"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.4 }}>
                        <div className="flex items-center gap-5 mb-8">
                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                <Award className="w-7 h-7 text-amber-400" />
                            </div>
                            <h3 className="font-display text-xl font-bold text-foreground">Achievements</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {achievementsList.map(({ id, name: aName, icon: Icon, unlocked, color }) => (
                                <div key={id}
                                    className="relative flex flex-col items-center gap-4 p-6 rounded-[2rem] transition-all duration-300 group hover:scale-[1.03]"
                                    style={{
                                        background: unlocked ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.04)",
                                        border: `1px solid ${unlocked ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.08)"}`,
                                        opacity: unlocked ? 1 : 0.6,
                                        boxShadow: unlocked ? "0 8px 30px rgba(0,0,0,0.15)" : "none"
                                    }}>
                                    {!unlocked && (
                                        <div className="absolute top-4 right-4 p-1 rounded-full bg-black/20 backdrop-blur-sm">
                                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <Icon className={`w-9 h-9 ${color} transition-transform duration-300 group-hover:scale-110`}
                                        style={unlocked ? { filter: "drop-shadow(0 0 12px currentColor)" } : {}} />
                                    <span className="text-[11px] text-center font-black text-foreground leading-tight uppercase tracking-tighter">{aName}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* QUICK SETTINGS - BIGGER */}
                    <motion.div className="glass-card p-10"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.5 }}>
                        <div className="flex items-center gap-5 mb-8">
                            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <Settings className="w-7 h-7 text-blue-400" />
                            </div>
                            <h3 className="font-display text-xl font-bold text-foreground">Quick Settings</h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                { label: "Push notifications", desc: "Get updates about your progress", icon: Bell, val: notifs, set: setNotifs },
                                { label: "System sounds", desc: "Audio feedback for interactions", icon: Volume2, val: pronounce, set: setPronounce },
                            ].map(({ label, desc, icon: Icon, val, set }) => (
                                <div key={label}
                                    className="flex items-center justify-between p-6 rounded-[2rem] transition-all duration-300 hover:bg-white/5"
                                    style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.1)" }}>
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                            <Icon className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <span className="text-sm text-foreground font-black block mb-0.5">{label}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium opacity-60">{desc}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            set(!val);
                                            showToast(`${label} ${!val ? "enabled" : "disabled"}`);
                                        }}
                                        className="w-12 h-6 rounded-full relative transition-all duration-500 shrink-0 shadow-inner"
                                        style={{ background: val ? "linear-gradient(90deg, hsl(270 80% 50%), hsl(280 85% 60%))" : "rgba(255,255,255,0.1)" }}
                                        aria-label={label}
                                    >
                                        <span
                                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-500"
                                            style={{ left: val ? "calc(100% - 20px)" : "4px" }}
                                        />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-6">
                                <button
                                    onClick={() => navigate("/settings")}
                                    className="w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md uppercase tracking-wider"
                                    style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "hsl(270,80%,75%)" }}
                                >
                                    Advanced settings
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* TASK LEVELS - AT THE BOTTOM */}
                <div className="mt-12">
                    <TaskLevels compact={true} />
                </div>

            </div>

            {/* ══ EDIT PROFILE MODAL ══ */}
            <AnimatePresence>
                {editOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-[60]"
                            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setEditOpen(false)}
                        />
                        <motion.div
                            className="fixed z-[70] left-1/2 top-1/2 w-[90%] max-w-sm rounded-[2.5rem] p-8"
                            style={{
                                background: "rgba(18, 10, 40, 0.95)",
                                border: "1px solid rgba(139,92,246,0.3)",
                                boxShadow: "0 0 50px rgba(139,92,246,0.2)",
                            }}
                            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-display text-xl font-bold glow-text">Edit Profile</h2>
                                <button
                                    onClick={() => setEditOpen(false)}
                                    className="w-9 h-9 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
                                    style={glassBtn}
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <label className="block mb-6">
                                <span className="text-xs text-muted-foreground font-black uppercase tracking-tight mb-2 block ml-1">Display Name</span>
                                <input
                                    type="text"
                                    value={draftName}
                                    onChange={(e) => setDraftName(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl text-sm text-white outline-none transition-all placeholder:text-white/20"
                                    style={{
                                        background: "rgba(139,92,246,0.1)",
                                        border: "1px solid rgba(139,92,246,0.25)",
                                    }}
                                    placeholder="Your name"
                                />
                            </label>

                            <label className="block mb-10">
                                <span className="text-xs text-muted-foreground font-black uppercase tracking-tight mb-2 block ml-1">Practice Level</span>
                                <select
                                    value={draftLevel}
                                    onChange={(e) => setDraftLevel(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl text-sm text-white outline-none transition-all appearance-none cursor-pointer"
                                    style={{
                                        background: "rgba(139,92,246,0.1)",
                                        border: "1px solid rgba(139,92,246,0.25)",
                                    }}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </label>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setEditOpen(false)}
                                    className="flex-1 py-4 rounded-2xl text-xs font-black transition-all duration-200 hover:opacity-80 uppercase tracking-widest"
                                    style={{ ...glassBtn, color: "hsl(270,80%,75%)" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className="flex-1 py-4 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.02] uppercase tracking-widest"
                                    style={{ background: "linear-gradient(135deg, hsl(270 80% 50%), hsl(280 85% 60%))", boxShadow: "0 8px 25px hsl(270 80% 55% / 0.35)" }}
                                >
                                    <Save className="w-4 h-4" /> Save
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ══ TOAST ══ */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                        className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[999] px-6 py-4 rounded-2xl text-xs font-black text-white shadow-2xl uppercase tracking-widest"
                        style={{
                            background: "rgba(30, 20, 60, 0.95)",
                            border: "1px solid rgba(139,92,246,0.4)",
                            backdropFilter: "blur(20px)",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══ BOTTOM NAV ══ */}
            <motion.nav
                className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-6 py-4"
                style={{
                    background: "rgba(15, 10, 30, 0.8)",
                    backdropFilter: "blur(25px)",
                    WebkitBackdropFilter: "blur(25px)",
                    borderTop: "1px solid rgba(139, 92, 246, 0.25)",
                    boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.2)",
                }}
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            >
                {navItems.map(({ label, icon: Icon, path }) => {
                    const active = location.pathname === path;
                    return (
                        <button key={label} onClick={() => navigate(path)}
                            className="flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-[1.5rem] transition-all duration-300"
                            style={{
                                background: active ? "rgba(139,92,246,0.22)" : "transparent",
                                border: active ? "1px solid rgba(139,92,246,0.4)" : "1px solid transparent",
                                transform: active ? "translateY(-2px)" : "none",
                            }}>
                            <Icon className="w-5 h-5 transition-all duration-300"
                                style={{
                                    color: active ? "hsl(270, 80%, 75%)" : "rgba(160, 140, 200, 0.5)",
                                    filter: active ? "drop-shadow(0 0 8px hsl(270 80% 65%))" : "none",
                                }} />
                            <span className="text-[10px] font-black leading-none uppercase tracking-tighter"
                                style={{
                                    color: active ? "hsl(270, 80%, 85%)" : "rgba(160, 140, 200, 0.4)",
                                    fontFamily: "'Inter', sans-serif",
                                }}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </motion.nav>
        </div>
    );
}
