import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, HelpCircle, Search, ChevronDown,
    Mic, RefreshCw, AlertCircle, Zap,
    Mail, MessageCircle, Home, CheckSquare, Trophy, User, X, BookOpen
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AnimatedBackground from "@components/AnimatedBackground";

/* ── Nav ── */
const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Task", icon: CheckSquare, path: "/task" },
    { label: "Learn", icon: BookOpen, path: "/learning" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { label: "Profile", icon: User, path: "/profile" },
];

/* ── FAQ data ── */
const faqs = [
    {
        id: 1, icon: "📊",
        title: "How are my pronunciation scores calculated?",
        keywords: "pronunciation score accuracy rating speaking voice",
        answer: "Your pronunciation score compares your spoken sounds against native-speaker patterns using phoneme-level analysis. Scores update in real time as you speak. Repeated practice on flagged sounds triggers focused drills to help you improve.",
        advanced: "The scoring engine uses spectral feature comparison across phonemes. Fricatives and plosives are weighted differently based on the target language's phonological inventory. Low scores on specific phonemes trigger adaptive drills automatically.",
    },
    {
        id: 2, icon: "🔊",
        title: "Why isn't my microphone being detected?",
        keywords: "audio microphone not detected recording input sound",
        answer: "Check that you've granted microphone permission in your browser settings. Speak closer to your device and reduce background noise. A quiet environment with your mouth ~20 cm from the mic gives the best results.",
        advanced: "Audio capture uses the Web Audio API with a noise gate threshold of -45 dB. Voice Activity Detection applies a 200 ms debounce window. Environments consistently above 55 dB may clip speech onset frames.",
    },
    {
        id: 3, icon: "📈",
        title: "Why do tasks keep repeating?",
        keywords: "task recommendation repetitive spaced repetition review",
        answer: "Repeated tasks are part of the spaced-repetition schedule — revisiting vocabulary at increasing intervals is the fastest path to long-term retention. The system shows a word again only when you're about to forget it.",
        advanced: "The recommendation engine blends knowledge-tracing (BKT), collaborative filtering, and an SM-2 spaced-repetition scheduler at a 50/20/30 ratio. You can shift the balance towards Discovery or Review in Settings → Learning Preferences.",
    },
    {
        id: 4, icon: "⚡",
        title: "My progress isn't saving",
        keywords: "session progress lost save data sync",
        answer: "Progress saves automatically when you complete an exercise. Exiting mid-exercise may lose partial data. Always finish the current exercise before navigating away to ensure your streak and XP are recorded.",
        advanced: "Session state persists via IndexedDB with 30-second checkpoints. Network sync uses exponential backoff (1 s, 3 s, 9 s). If the service worker is stale, clearing Application Storage and reloading re-establishes the sync pipeline.",
    },
    {
        id: 5, icon: "🤖",
        title: "The AI feedback seems wrong",
        keywords: "ai feedback wrong inaccurate correction suggestion",
        answer: "AI feedback improves with each session as it calibrates to your speech patterns and accent. Early sessions may show less precise corrections — this is normal and resolves after 4–5 completed sessions.",
        advanced: "The feedback model uses a speaker-adaptive layer that updates its prior after ~5 sessions. L1 transfer patterns are detected via contrastive phonological analysis. Corrections may reflect target-language norms rather than mistakes.",
    },
    {
        id: 6, icon: "⏱️",
        title: "The time limit feels too short",
        keywords: "timer time limit countdown too fast timed task",
        answer: "Time limits are designed to build fluency. After a few sessions the system adapts to your average response speed. You can also enable Relaxed Timing in Settings → Learning Preferences for extra time.",
        advanced: "Allocations use a per-task baseline multiplied by your learner-speed coefficient (derived from your median response latency over the last 20 tasks). Relaxed Timing adds a 1.5× multiplier. Timed-out tasks don't negatively affect your rating.",
    },
];

/* ── Action configs ── */
const actions = [
    { id: "mic", icon: <Mic className="w-4 h-4" />, label: "Check Microphone", title: "Microphone Diagnostic", desc: "Testing input levels and adjusting noise gate threshold…", done: "Microphone calibrated ✓" },
    { id: "sync", icon: <RefreshCw className="w-4 h-4" />, label: "Sync Progress", title: "Sync Task Data", desc: "Re-syncing your task completions, streaks, and XP…", done: "Progress synced ✓" },
    { id: "difficulty", icon: <Zap className="w-4 h-4" />, label: "Recalibrate Level", title: "Recalibrate Difficulty", desc: "Resetting your learner rating. Next 3 tasks will be diagnostic…", done: "Difficulty recalibrated ✓" },
    { id: "report", icon: <AlertCircle className="w-4 h-4" />, label: "Report an Issue", title: "Submit Issue Report", desc: "Collecting information and flagging for our team to review…", done: "Issue submitted — thank you ✓" },
];

/* ── AI suggestions map ── */
const suggestions: Record<string, string> = {
    pronunciation: "Your recent sessions show strong vowel accuracy. Focus on consonant clusters for the next step.",
    mic: "Run the microphone diagnostic below to test your audio input.",
    progress: "Progress saves automatically at the end of each exercise.",
    task: "Completed tasks update your streak and XP — ensure the final submit step completes.",
    ai: "AI feedback personalises after ~5 sessions — stay consistent for best results.",
    timer: "Enable Relaxed Timing in Settings → Learning Preferences for extra buffer.",
    score: "Your score trend is upward — consistent daily practice drives the biggest gains.",
};

/* ── Contact modal ── */
interface ContactModal { type: "email" | "chat" | null }

export default function HelpSupportPage() {
    const navigate = useNavigate();
    const location = useLocation();

    /* search */
    const [query, setQuery] = useState("");

    /* FAQ state */
    const [openId, setOpenId] = useState<number | null>(null);
    const [advancedId, setAdvancedId] = useState<number | null>(null);

    /* micro-flow modal */
    const [activeFlow, setActiveFlow] = useState<typeof actions[0] | null>(null);
    const [flowProgress, setFlowProgress] = useState(0);   // 0-100
    const [flowDone, setFlowDone] = useState(false);
    const flowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* contact section */
    const [contactOpen, setContactOpen] = useState(false);
    const [contactModal, setContactModal] = useState<ContactModal>({ type: null });

    /* toast */
    const [toast, setToast] = useState({ msg: "", show: false });
    const showToast = (msg: string) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200);
    };

    /* Filtered FAQs */
    const q = query.toLowerCase().trim();
    const filtered = q
        ? faqs.filter((f) =>
            (f.title + " " + f.keywords).toLowerCase().split(/\s+/).some((w) => w.includes(q))
        )
        : faqs;

    const suggestionKey = Object.keys(suggestions).find((k) => q.includes(k));

    /* Micro-flow: open */
    const openFlow = useCallback((a: typeof actions[0]) => {
        // clear any running timer
        if (flowTimerRef.current) clearTimeout(flowTimerRef.current);
        setActiveFlow(a);
        setFlowProgress(0);
        setFlowDone(false);
        // animate progress to 100% after a frame then mark done at ~1.8s
        requestAnimationFrame(() => {
            setTimeout(() => setFlowProgress(100), 30);
        });
        flowTimerRef.current = setTimeout(() => setFlowDone(true), 2000);
    }, []);

    /* Micro-flow: close */
    const closeFlow = useCallback(() => {
        if (flowTimerRef.current) clearTimeout(flowTimerRef.current);
        setActiveFlow(null);
        setFlowProgress(0);
        setFlowDone(false);
    }, []);

    const glassStyle = { background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.14)" };

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

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 pb-28">

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
                            style={{ background: "linear-gradient(135deg, hsl(200 80% 45%), hsl(220 85% 55%))", boxShadow: "0 0 20px hsl(200 80% 50% / 0.4)" }}>
                            <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-bold glow-text leading-tight">Help & Support</h1>
                            <p className="text-xs text-muted-foreground">Browse FAQs or run diagnostics</p>
                        </div>
                    </div>
                </motion.div>

                {/* SEARCH */}
                <motion.div className="relative mb-4"
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: 0.06 }}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search — e.g. pronunciation, mic, progress…"
                        className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm text-foreground outline-none transition-all"
                        style={{ background: "rgba(139,92,246,0.07)", border: `1px solid ${query ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.18)"}` }} />
                    {query && (
                        <button onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                            style={{ background: "rgba(139,92,246,0.2)" }}>
                            <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                    )}
                </motion.div>

                {/* AI SUGGESTION */}
                <AnimatePresence>
                    {suggestionKey && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}
                            className="mb-4 px-4 py-3 rounded-2xl text-xs leading-relaxed overflow-hidden"
                            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)", color: "hsl(270,80%,80%)" }}>
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 mr-2">AI Tip</span>
                            {suggestions[suggestionKey]}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FAQ CARDS */}
                <motion.div className="space-y-2 mb-6"
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
                    {filtered.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-8">No results for "{query}"</p>
                    )}
                    {filtered.map((faq) => {
                        const isOpen = openId === faq.id;
                        const showAdv = advancedId === faq.id;
                        return (
                            <div key={faq.id} className="rounded-2xl overflow-hidden transition-all duration-200"
                                style={{
                                    background: isOpen ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.06)",
                                    border: `1px solid ${isOpen ? "rgba(139,92,246,0.28)" : "rgba(139,92,246,0.12)"}`,
                                }}>
                                <button onClick={() => { setOpenId(isOpen ? null : faq.id); if (isOpen) setAdvancedId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                                    <span className="text-base shrink-0">{faq.icon}</span>
                                    <span className="flex-1 text-sm font-semibold text-foreground">{faq.title}</span>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300"
                                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }} />
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.28 }} className="overflow-hidden">
                                            <div className="px-4 pb-4 pt-1">
                                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{faq.answer}</p>
                                                <button onClick={(e) => { e.stopPropagation(); setAdvancedId(showAdv ? null : faq.id); }}
                                                    className="text-xs flex items-center gap-1 hover:opacity-100 opacity-60 transition-opacity"
                                                    style={{ color: "hsl(270,80%,75%)" }}>
                                                    <span>{showAdv ? "− Hide" : "+ Show"} advanced explanation</span>
                                                </button>
                                                <AnimatePresence>
                                                    {showAdv && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.22 }} className="overflow-hidden">
                                                            <p className="mt-3 text-xs text-muted-foreground leading-relaxed px-3 py-2"
                                                                style={{ borderLeft: "2px solid rgba(139,92,246,0.3)", borderRadius: "0 8px 8px 0", background: "rgba(139,92,246,0.04)" }}>
                                                                {faq.advanced}
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </motion.div>

                {/* QUICK ACTIONS */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.18 }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {actions.map((a) => (
                            <button key={a.id} onClick={() => openFlow(a)}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                style={glassStyle}>
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: "rgba(139,92,246,0.18)" }}>
                                    <span style={{ color: "hsl(270,80%,75%)" }}>{a.icon}</span>
                                </div>
                                <span className="text-xs font-semibold text-foreground">{a.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* CONTACT SUPPORT */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.24 }}>
                    <button onClick={() => setContactOpen(!contactOpen)}
                        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200"
                        style={glassStyle}>
                        <span className="text-sm font-semibold text-foreground">Contact Support</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-300"
                            style={{ transform: contactOpen ? "rotate(180deg)" : "rotate(0)" }} />
                    </button>
                    <AnimatePresence>
                        {contactOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.26 }} className="overflow-hidden">
                                <div className="flex gap-3 pt-3">
                                    <button onClick={() => setContactModal({ type: "email" })}
                                        className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl hover:scale-[1.02] transition-transform"
                                        style={glassStyle}>
                                        <Mail className="w-4 h-4" style={{ color: "hsl(270,80%,75%)" }} />
                                        <span className="text-sm text-foreground">Email us</span>
                                    </button>
                                    <button onClick={() => setContactModal({ type: "chat" })}
                                        className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl hover:scale-[1.02] transition-transform"
                                        style={glassStyle}>
                                        <MessageCircle className="w-4 h-4" style={{ color: "hsl(280,85%,70%)" }} />
                                        <span className="text-sm text-foreground">Live chat</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

            </div>

            {/* ── MICRO-FLOW MODAL ── */}
            <AnimatePresence>
                {activeFlow && (
                    <>
                        <motion.div className="fixed inset-0 z-[60]"
                            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeFlow} />
                        <motion.div
                            className="fixed z-[70] left-1/2 top-1/2 w-[88%] max-w-sm rounded-3xl p-7 text-center"
                            style={{ background: "rgba(18,10,40,0.96)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 50px rgba(139,92,246,0.2)" }}
                            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}>
                            <h3 className="font-display text-base font-bold text-foreground mb-2">{activeFlow.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{activeFlow.desc}</p>
                            {/* Progress bar */}
                            <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(139,92,246,0.15)" }}>
                                <motion.div className="h-full rounded-full"
                                    style={{ background: "linear-gradient(90deg, hsl(270 80% 50%), hsl(280 85% 60%))" }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${flowProgress}%` }}
                                    transition={{ duration: 1.8, ease: "easeOut" }} />
                            </div>
                            <AnimatePresence>
                                {flowDone && (
                                    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                        className="text-xs font-semibold mb-4" style={{ color: "hsl(142,76%,50%)" }}>
                                        {activeFlow.done}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            <button onClick={closeFlow}
                                className="px-8 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "hsl(270,80%,75%)" }}>
                                {flowDone ? "Done" : "Cancel"}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── CONTACT MODAL ── */}
            <AnimatePresence>
                {contactModal.type && (
                    <>
                        <motion.div className="fixed inset-0 z-[60]"
                            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setContactModal({ type: null })} />
                        <motion.div
                            className="fixed z-[70] left-1/2 top-1/2 w-[88%] max-w-sm rounded-3xl p-6"
                            style={{ background: "rgba(18,10,40,0.96)", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 50px rgba(139,92,246,0.2)" }}
                            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}>
                            <button onClick={() => setContactModal({ type: null })}
                                className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            {contactModal.type === "email" ? (
                                <>
                                    <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(270,80%,75%)" }} />
                                    <h3 className="font-display text-base font-bold text-foreground text-center mb-1">Email Support</h3>
                                    <p className="text-xs text-muted-foreground text-center mb-4">We typically respond within 24 hours</p>
                                    <div className="px-4 py-3 rounded-2xl mb-4 text-center"
                                        style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                                        <p className="text-sm font-semibold" style={{ color: "hsl(270,80%,75%)" }}>support@linguai.app</p>
                                    </div>
                                    <button
                                        onClick={() => { setContactModal({ type: null }); showToast("Email address copied ✓"); navigator.clipboard?.writeText("support@linguai.app").catch(() => { }); }}
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                                        style={{ background: "linear-gradient(135deg, hsl(270 80% 50%), hsl(280 85% 60%))" }}>
                                        Copy email address
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MessageCircle className="w-8 h-8 mx-auto mb-3" style={{ color: "hsl(280,85%,70%)" }} />
                                    <h3 className="font-display text-base font-bold text-foreground text-center mb-1">Live Chat</h3>
                                    <p className="text-xs text-muted-foreground text-center mb-4">Available Mon–Fri, 9 AM – 6 PM IST</p>
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 justify-center"
                                        style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                        <p className="text-sm text-red-400 font-semibold">Offline right now</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center mb-4">Email us in the meantime and we'll get back to you within 24 hours.</p>
                                    <button onClick={() => { setContactModal({ type: "email" }); }}
                                        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                                        style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "hsl(270,80%,75%)" }}>
                                        Switch to Email
                                    </button>
                                </>
                            )}
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
            <motion.nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3"
                style={{ background: "rgba(15,10,30,0.75)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 -4px 30px rgba(139,92,246,0.1)" }}
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                {navItems.map(({ label, icon: Icon, path }) => {
                    const active = location.pathname === path;
                    return (
                        <button key={label} onClick={() => navigate(path)}
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200"
                            style={{ background: active ? "rgba(139,92,246,0.18)" : "transparent", border: active ? "1px solid rgba(139,92,246,0.35)" : "1px solid transparent" }}>
                            <Icon className="w-5 h-5"
                                style={{ color: active ? "hsl(270,80%,75%)" : "rgba(160,140,200,0.6)", filter: active ? "drop-shadow(0 0 6px hsl(270 80% 65%))" : "none" }} />
                            <span className="text-[10px] font-medium leading-none"
                                style={{ color: active ? "hsl(270,80%,80%)" : "rgba(160,140,200,0.5)", fontFamily: "'Inter', sans-serif" }}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </motion.nav>
        </div>
    );
}
