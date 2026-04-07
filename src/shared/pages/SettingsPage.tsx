import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Settings, Volume2, Bell, Moon,
    Shield, HelpCircle, LogOut, ChevronRight,
    Home, CheckSquare, Trophy, User, BookOpen
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AnimatedBackground from "@components/AnimatedBackground";

const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Task", icon: CheckSquare, path: "/task" },
    { label: "Learn", icon: BookOpen, path: "/learning" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { label: "Profile", icon: User, path: "/profile" },
];

interface ToastState { message: string; visible: boolean }

export default function SettingsPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [sound, setSound] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [toast, setToast] = useState<ToastState>({ message: "", visible: false });

    const showToast = (msg: string) => {
        setToast({ message: msg, visible: true });
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2000);
    };

    const toggle = (
        val: boolean,
        setter: (v: boolean) => void,
        label: string
    ) => {
        setter(!val);
        showToast(`${label} ${!val ? "enabled" : "disabled"}`);
    };

    return (
        <div className="relative min-h-screen animated-bg overflow-hidden text-foreground">
            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div
                    className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, hsl(270 80% 55% / 0.4), transparent 70%)" }}
                />
                <div
                    className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, hsl(280 85% 60% / 0.4), transparent 70%)" }}
                />
            </div>

            <AnimatedBackground />

            {/* Scrollable content */}
            <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 pb-28">

                {/* ── TOP BAR ── */}
                <motion.div
                    className="flex items-center gap-4 mb-8"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        onClick={() => navigate("/profile")}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                        style={{
                            background: "rgba(139, 92, 246, 0.12)",
                            border: "1px solid rgba(139, 92, 246, 0.25)",
                        }}
                        aria-label="Back to Profile"
                    >
                        <ArrowLeft className="w-5 h-5" style={{ color: "hsl(270, 80%, 75%)" }} />
                    </button>

                    <div className="flex items-center gap-3 flex-1">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, hsl(270 80% 50%), hsl(280 85% 60%))",
                                boxShadow: "0 0 20px hsl(270 80% 55% / 0.4)",
                            }}
                        >
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-bold glow-text leading-tight">Settings</h1>
                            <p className="text-xs text-muted-foreground">Manage preferences &amp; account</p>
                        </div>
                    </div>
                </motion.div>

                {/* ── MAIN CARD ── */}
                <motion.div
                    className="glass-card mb-4"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                >
                    {/* Sound Effects */}
                    <ToggleRow
                        icon={<Volume2 className="w-4 h-4" style={{ color: "hsl(270,80%,75%)" }} />}
                        label="Sound Effects"
                        sublabel="In-app sounds & haptics"
                        value={sound}
                        onToggle={() => toggle(sound, setSound, "Sound Effects")}
                    />

                    <Divider />

                    {/* Notifications */}
                    <ToggleRow
                        icon={<Bell className="w-4 h-4" style={{ color: "hsl(280,85%,70%)" }} />}
                        label="Notifications"
                        sublabel="Push & in-app alerts"
                        value={notifications}
                        onToggle={() => toggle(notifications, setNotifications, "Notifications")}
                    />

                    <Divider />

                    {/* Dark Mode */}
                    <ToggleRow
                        icon={<Moon className="w-4 h-4" style={{ color: "hsl(240,80%,75%)" }} />}
                        label="Dark Mode"
                        sublabel="Reduce eye strain at night"
                        value={darkMode}
                        onToggle={() => toggle(darkMode, setDarkMode, "Dark Mode")}
                    />

                    <Divider />

                    <NavRow
                        icon={<Shield className="w-4 h-4" style={{ color: "hsl(45,90%,65%)" }} />}
                        label="Privacy & Security"
                        value=""
                        onClick={() => navigate("/privacy")}
                    />

                    <Divider />

                    {/* Help & Support */}
                    <NavRow
                        icon={<HelpCircle className="w-4 h-4" style={{ color: "hsl(200,80%,65%)" }} />}
                        label="Help & Support"
                        value=""
                        onClick={() => navigate("/help")}
                    />

                    <Divider />

                    <NavRow
                        icon={<Shield className="w-4 h-4" style={{ color: "hsl(270,80%,65%)" }} />}
                        label="Admin Panel"
                        value=""
                        onClick={() => navigate("/admin")}
                    />
                </motion.div>

                {/* ── LOGOUT CARD ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.16 }}
                >
                    <button
                        onClick={() => showToast("Logging out…")}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.01]"
                        style={{
                            background: "rgba(239, 68, 68, 0.06)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                    >
                        <LogOut className="w-5 h-5 text-red-400 shrink-0" />
                        <span className="flex-1 text-left text-sm font-semibold text-red-400">Log Out</span>
                        <ChevronRight className="w-4 h-4 text-red-400 opacity-60" />
                    </button>
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-xs text-muted-foreground mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Language Intelligence v1.0.0 · Made with care
                </motion.p>
            </div>

            {/* ── TOAST ── */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold text-white shadow-xl"
                        style={{
                            background: "rgba(30, 20, 60, 0.92)",
                            border: "1px solid rgba(139, 92, 246, 0.35)",
                            backdropFilter: "blur(16px)",
                            boxShadow: "0 4px 24px rgba(139, 92, 246, 0.25)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── BOTTOM NAVIGATION BAR ── */}
            <motion.nav
                className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3"
                style={{
                    background: "rgba(15, 10, 30, 0.75)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderTop: "1px solid rgba(139, 92, 246, 0.2)",
                    boxShadow: "0 -4px 30px rgba(139, 92, 246, 0.1)",
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                {navItems.map(({ label, icon: Icon, path }) => {
                    const active = location.pathname === path;
                    return (
                        <button
                            key={label}
                            onClick={() => navigate(path)}
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200"
                            style={{
                                background: active ? "rgba(139, 92, 246, 0.18)" : "transparent",
                                border: active ? "1px solid rgba(139, 92, 246, 0.35)" : "1px solid transparent",
                            }}
                        >
                            <Icon
                                className="w-5 h-5 transition-all duration-200"
                                style={{
                                    color: active ? "hsl(270, 80%, 75%)" : "rgba(160, 140, 200, 0.6)",
                                    filter: active ? "drop-shadow(0 0 6px hsl(270 80% 65%))" : "none",
                                }}
                            />
                            <span
                                className="text-[10px] font-medium leading-none"
                                style={{
                                    color: active ? "hsl(270, 80%, 80%)" : "rgba(160, 140, 200, 0.5)",
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                {label}
                            </span>
                        </button>
                    );
                })}
            </motion.nav>
        </div>
    );
}

/* ── Sub-components ── */

function Divider() {
    return (
        <div
            className="mx-5"
            style={{ height: "1px", background: "rgba(139, 92, 246, 0.1)" }}
        />
    );
}

interface ToggleRowProps {
    icon: React.ReactNode;
    label: string;
    sublabel: string;
    value: boolean;
    onToggle: () => void;
}
function ToggleRow({ icon, label, sublabel, value, onToggle }: ToggleRowProps) {
    return (
        <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.18)" }}
                >
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className="w-11 h-6 rounded-full relative transition-all duration-300 shrink-0"
                style={{
                    background: value
                        ? "linear-gradient(90deg, hsl(270 80% 50%), hsl(280 85% 60%))"
                        : "rgba(139, 92, 246, 0.15)",
                }}
                aria-label={label}
            >
                <span
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                    style={{ left: value ? "calc(100% - 22px)" : "2px" }}
                />
            </button>
        </div>
    );
}

interface NavRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    onClick: () => void;
}
function NavRow({ icon, label, value, onClick }: NavRowProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-5 py-4 transition-all duration-150 hover:bg-white/[0.02]"
        >
            <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.18)" }}
            >
                {icon}
            </div>
            <span className="flex-1 text-left text-sm font-semibold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground mr-1">{value}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-60" />
        </button>
    );
}
