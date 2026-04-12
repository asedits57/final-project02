import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Shield, ChevronDown, Eye, Lock,
    Database, Trash2, Download, Globe,
    X, Check, RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@components/shared/AnimatedBackground";

/* ── Nav ── */
/* ── Section data ── */
const privacySections = [
    {
        id: "data",
        icon: <Database className="w-4 h-4" />,
        title: "Data We Collect",
        color: "hsl(270,80%,72%)",
        items: [
            { label: "Voice recordings", detail: "Processed locally in real-time — never stored on servers." },
            { label: "Pronunciation scores", detail: "Stored anonymously to improve the AI model." },
            { label: "Learning progress", detail: "Linked to your account to enable cross-device sync." },
            { label: "Usage analytics", detail: "Aggregated and never tied to personal identity." },
        ],
    },
    {
        id: "use",
        icon: <Eye className="w-4 h-4" />,
        title: "How We Use Your Data",
        color: "hsl(200,80%,65%)",
        items: [
            { label: "Personalise task difficulty", detail: "Your accuracy history adapts the learning curve." },
            { label: "Improve AI models", detail: "Anonymised phoneme data trains future model versions." },
            { label: "Send progress notifications", detail: "Only if you enable notifications in Settings." },
            { label: "Security & fraud prevention", detail: "Login activity is monitored to protect your account." },
        ],
    },
    {
        id: "retention",
        icon: <Globe className="w-4 h-4" />,
        title: "Data Retention",
        color: "hsl(45,90%,62%)",
        items: [
            { label: "Active account data", detail: "Kept for the duration of your account." },
            { label: "Deleted account data", detail: "Fully purged within 30 days of deletion." },
            { label: "Voice samples", detail: "Never retained — discarded after real-time processing." },
            { label: "Anonymised model data", detail: "Retained to improve pronunciation accuracy." },
        ],
    },
];

/* ── Security toggle type ── */
interface ToggleItem { label: string; sub: string; enabled: boolean }

const initialToggles: ToggleItem[] = [
    { label: "Two-factor authentication", sub: "Require a code when signing in from a new device", enabled: false },
    { label: "Login activity alerts", sub: "Get notified of sign-ins from new locations", enabled: true },
    { label: "Share anonymised data", sub: "Help improve the AI with aggregated usage data", enabled: true },
    { label: "Personalised learning", sub: "Allow your history to adapt task difficulty", enabled: true },
];

/* ── Export states ── */
type ExportState = "idle" | "preparing" | "ready";

export default function PrivacyPage() {
    const navigate = useNavigate();

    const [openSection, setOpenSection] = useState<string | null>("data");
    const [toggles, setToggles] = useState<ToggleItem[]>(initialToggles);

    /* export */
    const [exportState, setExportState] = useState<ExportState>("idle");
    const [exportProgress, setExportProgress] = useState(0);

    /* delete confirm */
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    /* toast */
    const [toast, setToast] = useState({ msg: "", show: false });
    const showToast = (msg: string) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
    };

    /* flip a security toggle */
    const flipToggle = (i: number) => {
        setToggles((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], enabled: !next[i].enabled };
            showToast(`${next[i].label} ${next[i].enabled ? "enabled" : "disabled"} ✓`);
            return next;
        });
    };

    /* export flow */
    const startExport = () => {
        if (exportState !== "idle") return;
        setExportState("preparing");
        setExportProgress(0);

        // Animate progress to 100% over ~2 s
        const startTime = Date.now();
        const duration = 2000;
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min(100, Math.round((elapsed / duration) * 100));
            setExportProgress(pct);
            if (pct < 100) {
                requestAnimationFrame(tick);
            } else {
                setExportState("ready");
            }
        };
        requestAnimationFrame(tick);
    };

    /* trigger a fake JSON download */
    const doDownload = () => {
        const payload = {
            exported_at: new Date().toISOString(),
            profile: { name: "Alex Johnson", level: "Intermediate", xp: 2847 },
            stats: { words_learned: 1247, streak_days: 15, accuracy: "89%", practice_hours: 87 },
            settings: { notifications: true, sound: true },
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "linguai-data-export.json";
        a.click();
        URL.revokeObjectURL(url);
        setExportState("idle");
        setExportProgress(0);
        showToast("Data exported successfully ✓");
    };

    /* delete handler */
    const handleDelete = () => {
        setConfirmDelete(false);
        setDeleteConfirmText("");
        showToast("Account deletion requested — you'll receive an email confirmation ✓");
    };

    const glassRow = { background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.14)" };

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

            <div className="relative z-10 mx-auto max-w-[84rem] px-4 py-10 pb-10 sm:px-6 lg:px-8">

                {/* TOP BAR */}
                <motion.div className="flex items-center gap-4 mb-8"
                    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <button onClick={() => navigate("/settings")}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform"
                        style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}
                        aria-label="Back">
                        <ArrowLeft className="w-5 h-5" style={{ color: "hsl(270,80%,75%)" }} />
                    </button>
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, hsl(45 90% 55%), hsl(30 90% 55%))", boxShadow: "0 0 20px hsl(45 90% 55% / 0.4)" }}>
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-bold glow-text leading-tight">Privacy & Security</h1>
                            <p className="text-xs text-muted-foreground">Your data, your control</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-[1.04fr,0.96fr]">
                    <div>
                {/* PRIVACY ACCORDIONS */}
                <motion.div className="space-y-2 mb-5"
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.06 }}>
                    {privacySections.map((sec) => {
                        const isOpen = openSection === sec.id;
                        return (
                            <div key={sec.id} className="rounded-2xl overflow-hidden transition-all duration-200"
                                style={{
                                    background: isOpen ? "rgba(139,92,246,0.09)" : "rgba(139,92,246,0.05)",
                                    border: `1px solid ${isOpen ? "rgba(139,92,246,0.28)" : "rgba(139,92,246,0.12)"}`,
                                }}>
                                <button onClick={() => setOpenSection(isOpen ? null : sec.id)}
                                    className="w-full flex items-center gap-3 px-4 py-4">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: "rgba(139,92,246,0.14)", color: sec.color }}>
                                        {sec.icon}
                                    </div>
                                    <span className="flex-1 text-left text-sm font-semibold text-foreground">{sec.title}</span>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0"
                                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }} />
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.26 }} className="overflow-hidden">
                                            <div className="px-4 pb-4 space-y-3">
                                                {sec.items.map((item) => (
                                                    <div key={item.label} className="flex gap-3 items-start">
                                                        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                                            style={{ background: sec.color, boxShadow: `0 0 6px ${sec.color}` }} />
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </motion.div>

                {/* SECURITY TOGGLES */}
                <motion.div className="glass-card p-5 mb-4"
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-violet-400" />
                        <h2 className="font-display text-base font-bold text-foreground">Security Controls</h2>
                    </div>
                    <div className="space-y-1">
                        {toggles.map((t, i) => (
                            <div key={t.label} className="flex items-center justify-between gap-4 px-3 py-3 rounded-2xl transition-all"
                                style={glassRow}>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground">{t.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.sub}</p>
                                </div>
                                <button onClick={() => flipToggle(i)}
                                    className="w-11 h-6 rounded-full relative transition-all duration-300 shrink-0 cursor-pointer"
                                    style={{ background: t.enabled ? "linear-gradient(90deg, hsl(270 80% 50%), hsl(280 85% 60%))" : "rgba(139,92,246,0.15)" }}
                                    aria-label={`Toggle ${t.label}`}>
                                    <motion.span
                                        layout
                                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
                                        animate={{ left: t.enabled ? "calc(100% - 22px)" : "2px" }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* DATA ACTIONS */}
                <motion.div className="glass-card p-5 mb-5"
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="w-5 h-5 text-violet-400" />
                        <h2 className="font-display text-base font-bold text-foreground">Your Data</h2>
                    </div>
                    <div className="space-y-2">

                        {/* EXPORT BUTTON — three states */}
                        <div className="rounded-2xl overflow-hidden" style={glassRow}>
                            {exportState === "idle" && (
                                <button onClick={startExport}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:scale-[1.01] transition-transform">
                                    <Download className="w-4 h-4 shrink-0" style={{ color: "hsl(200,80%,65%)" }} />
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-foreground">Export my data</p>
                                        <p className="text-xs text-muted-foreground">Download a copy of your profile, progress & scores</p>
                                    </div>
                                </button>
                            )}
                            {exportState === "preparing" && (
                                <div className="px-4 py-3.5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <RefreshCwIcon className="w-4 h-4 animate-spin shrink-0" style={{ color: "hsl(200,80%,65%)" }} />
                                        <p className="text-sm font-semibold text-foreground">Preparing export… {exportProgress}%</p>
                                    </div>
                                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(139,92,246,0.15)" }}>
                                        <div className="h-full rounded-full transition-all duration-100"
                                            style={{ width: `${exportProgress}%`, background: "linear-gradient(90deg, hsl(200 80% 45%), hsl(220 85% 55%))" }} />
                                    </div>
                                </div>
                            )}
                            {exportState === "ready" && (
                                <button onClick={doDownload}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:scale-[1.01] transition-transform"
                                    style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}>
                                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-green-400">Ready — tap to download</p>
                                        <p className="text-xs text-muted-foreground">linguai-data-export.json</p>
                                    </div>
                                    <Download className="w-4 h-4 text-green-400 shrink-0" />
                                </button>
                            )}
                        </div>

                        {/* DELETE */}
                        <button onClick={() => setConfirmDelete(true)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:scale-[1.01] transition-all"
                            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                            <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-semibold text-red-400">Delete my account</p>
                                <p className="text-xs text-muted-foreground">Permanently erase all data within 30 days</p>
                            </div>
                        </button>
                    </div>
                </motion.div>

                <motion.p className="text-center text-xs text-muted-foreground px-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    We never sell your data. Voice recordings are processed entirely on-device and discarded immediately.
                </motion.p>

            </div>

            {/* DELETE CONFIRM MODAL */}
                    </div>

                    <div className="space-y-4">
                        <motion.div
                            className="app-surface app-grid px-6 py-6"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.08 }}
                        >
                            <span className="app-kicker">Privacy Promise</span>
                            <h2 className="mt-4 text-2xl font-bold text-white">Clear controls, clear boundaries</h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-300/76">
                                This screen should make your protections easy to scan. Review the policy details on the left, then use the side status cards to understand what is active right now.
                            </p>

                            <div className="mt-5 space-y-3">
                                {[
                                    "Voice processing stays local and is discarded immediately after analysis.",
                                    "Account-level progress stays linked only so learning can follow you across sessions.",
                                    "Exports and deletion remain visible so critical controls never feel hidden.",
                                ].map((item) => (
                                    <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="app-surface-soft p-5"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.14 }}
                        >
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Security Snapshot</p>
                            <div className="mt-4 space-y-3">
                                {toggles.map((toggle) => (
                                    <div key={toggle.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                                        <p className="text-sm font-semibold text-white">{toggle.label}</p>
                                        <p className="mt-1 text-xs text-slate-300/72">{toggle.sub}</p>
                                        <p className={`mt-3 text-xs font-semibold uppercase tracking-[0.16em] ${toggle.enabled ? "text-emerald-200" : "text-slate-400"}`}>
                                            {toggle.enabled ? "Enabled" : "Disabled"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="app-surface-soft p-5"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.18 }}
                        >
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Data Actions Status</p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                                    <p className="text-sm font-semibold text-white">Export readiness</p>
                                    <p className="mt-1 text-xs text-slate-300/72">
                                        {exportState === "idle"
                                            ? "Ready to prepare a fresh export."
                                            : exportState === "preparing"
                                                ? `Preparing now: ${exportProgress}%`
                                                : "Prepared and ready for download."}
                                    </p>
                                </div>
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                                    <p className="text-sm font-semibold text-white">Deletion workflow</p>
                                    <p className="mt-1 text-xs text-slate-300/72">A typed confirmation is required before permanent removal can be requested.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

            <AnimatePresence>
                {confirmDelete && (
                    <>
                        <motion.div className="fixed inset-0 z-[60]"
                            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setConfirmDelete(false); setDeleteConfirmText(""); }} />
                        <motion.div
                            className="fixed z-[70] left-1/2 top-1/2 w-[88%] max-w-sm rounded-3xl p-6"
                            style={{ background: "rgba(18,10,40,0.97)", border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 0 50px rgba(239,68,68,0.15)" }}
                            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}>
                            <button onClick={() => { setConfirmDelete(false); setDeleteConfirmText(""); }}
                                className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
                            <h3 className="font-display text-base font-bold text-foreground text-center mb-2">Delete Account?</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed text-center mb-4">
                                All your data — progress, scores, and settings — will be permanently deleted within 30 days. This cannot be undone.
                            </p>
                            <p className="text-xs text-muted-foreground mb-2 text-center">Type <span className="text-red-400 font-semibold">DELETE</span> to confirm</p>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                                placeholder="Type DELETE here"
                                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground outline-none mb-4 text-center tracking-widest"
                                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)" }}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => { setConfirmDelete(false); setDeleteConfirmText(""); }}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 transition-all"
                                    style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "hsl(270,80%,75%)" }}>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteConfirmText !== "DELETE"}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                                    style={{
                                        background: deleteConfirmText === "DELETE" ? "linear-gradient(135deg, #ef4444, #dc2626)" : "rgba(239,68,68,0.2)",
                                        boxShadow: deleteConfirmText === "DELETE" ? "0 0 20px rgba(239,68,68,0.3)" : "none",
                                        cursor: deleteConfirmText === "DELETE" ? "pointer" : "not-allowed",
                                        color: deleteConfirmText === "DELETE" ? "white" : "rgba(255,255,255,0.3)",
                                    }}>
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* TOAST */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div key="toast"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold text-white"
                        style={{ background: "rgba(30,20,60,0.92)", border: "1px solid rgba(139,92,246,0.35)", backdropFilter: "blur(16px)", boxShadow: "0 4px 24px rgba(139,92,246,0.25)", whiteSpace: "nowrap" }}>
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOTTOM NAV */}
        </div>
    );
}

/* inline spinner icon */
function RefreshCwIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <RefreshCw className={className} style={style} />;
}
