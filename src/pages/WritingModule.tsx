import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, PenTool, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MAX_CHARS = 350;

const WritingModule = () => {
    const navigate = useNavigate();
    const [text, setText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState<{
        score: number; grammar: number; vocabulary: number; clarity: number;
        suggestions: string[]; highlight: string;
    } | null>(null);

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => {
            const words = text.trim().split(/\s+/).length;
            const score = Math.min(100, Math.max(30, words * 4));
            setFeedback({
                score,
                grammar: Math.min(100, score + Math.floor(Math.random() * 10 - 5)),
                vocabulary: Math.min(100, score - 5 + Math.floor(Math.random() * 15)),
                clarity: Math.min(100, score + 5),
                suggestions: [
                    "Consider using more varied sentence structures to improve readability.",
                    "Strong use of descriptive language in the opening paragraph.",
                    "Try to include a clear concluding sentence that reinforces your main idea.",
                ],
                highlight: text.split(" ").slice(0, 6).join(" "),
            });
            setShowFeedback(true);
        }, 800);
    };

    const percent = Math.round((text.length / MAX_CHARS) * 100);
    const circumference = 2 * Math.PI * 16;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="min-h-screen animated-bg relative overflow-hidden text-foreground">
            <div className="orb orb-violet w-[400px] h-[400px] top-20 -right-24 float opacity-15 pointer-events-none" />
            <div className="orb orb-cyan w-[200px] h-[200px] bottom-10 -left-10 float-delayed opacity-10 pointer-events-none" />

            {/* Header */}
            <div
                className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
                style={{
                    background: "hsla(270, 25%, 6%, 0.85)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid hsla(270, 40%, 35%, 0.15)",
                }}
            >
                <button onClick={() => navigate("/task")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-violet-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" />Back
                </button>
                <div className="font-poppins font-semibold text-foreground flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-violet-400" />Writing Module
                </div>
                <div className="w-16" />
            </div>

            <div className="flex h-[calc(100vh-65px)]">
                {/* Main writing area */}
                <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl mx-auto w-full pb-10 overflow-y-auto">
                    {/* Image Preview Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl overflow-hidden mb-6 relative"
                        style={{
                            background: "hsla(270, 20%, 8%, 0.8)",
                            border: "1px solid hsla(270, 60%, 55%, 0.15)",
                            height: 200,
                        }}
                    >
                        {/* Gradient preview image */}
                        <div
                            className="w-full h-full flex items-center justify-center relative"
                            style={{
                                background: "linear-gradient(135deg, hsla(270, 60%, 15%, 0.9), hsla(185, 60%, 15%, 0.9))",
                            }}
                        >
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 30% 50%, hsla(270, 80%, 40%, 0.3) 0%, transparent 50%),
                                                  radial-gradient(circle at 70% 30%, hsla(185, 80%, 40%, 0.2) 0%, transparent 40%)`,
                            }} />
                            <div className="relative z-10 text-center">
                                <div className="text-5xl mb-2">🏙️</div>
                                <p className="text-sm text-muted-foreground font-poppins">
                                    A futuristic cityscape at night with glowing lights
                                </p>
                                <p className="text-xs text-violet-400 mt-1 font-poppins font-medium">
                                    Describe what you see — use vivid language
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Instructions */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-4"
                    >
                        <h2 className="font-poppins font-bold text-lg mb-1">Describe the Image</h2>
                        <p className="text-sm text-muted-foreground font-poppins">
                            Write at least 50 words describing the scene. Focus on details, atmosphere, and your impression.
                        </p>
                    </motion.div>

                    {/* Textarea */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative mb-4 flex-1"
                    >
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
                            disabled={submitted}
                            placeholder="Begin your description here..."
                            rows={8}
                            className="w-full rounded-2xl px-5 py-4 text-sm font-poppins outline-none resize-none transition-all duration-300"
                            style={{
                                background: "hsla(270, 30%, 10%, 0.7)",
                                border: "1.5px solid hsla(270, 60%, 55%, 0.2)",
                                color: "hsl(270, 20%, 90%)",
                                caretColor: "hsl(270, 80%, 70%)",
                            }}
                            onFocus={e => {
                                e.currentTarget.style.border = "1.5px solid hsla(270, 80%, 55%, 0.5)";
                                e.currentTarget.style.boxShadow = "0 0 20px hsla(270, 80%, 55%, 0.12)";
                            }}
                            onBlur={e => {
                                e.currentTarget.style.border = "1.5px solid hsla(270, 60%, 55%, 0.2)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        />

                        {/* Character counter ring */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-poppins">{text.length}/{MAX_CHARS}</span>
                            <svg width="38" height="38" className="-rotate-90">
                                <circle cx="19" cy="19" r="16" fill="none" strokeWidth="2.5" stroke="hsla(270, 30%, 25%, 0.5)" />
                                <circle
                                    cx="19" cy="19" r="16" fill="none" strokeWidth="2.5"
                                    stroke={percent >= 90 ? "hsl(0, 80%, 60%)" : "hsl(270, 80%, 65%)"}
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    style={{
                                        filter: `drop-shadow(0 0 4px ${percent >= 90 ? "hsl(0,80%,55%)" : "hsl(270,80%,55%)"})`,
                                        transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
                                    }}
                                />
                            </svg>
                        </div>
                    </motion.div>

                    {/* Submit */}
                    {!submitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={text.trim().split(/\s+/).length < 10}
                            className="flex items-center gap-2 w-full justify-center rounded-2xl py-4 font-poppins font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                                boxShadow: "0 0 30px hsla(262, 83%, 58%, 0.35)",
                            }}
                        >
                            <ChevronRight className="w-4 h-4" />
                            Submit Writing
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/task")}
                            className="w-full rounded-2xl py-4 font-poppins font-semibold text-sm text-violet-300 transition-all hover:scale-[1.02]"
                            style={{ background: "hsla(270, 80%, 55%, 0.1)", border: "1px solid hsla(270, 80%, 55%, 0.3)" }}
                        >
                            Back to Dashboard
                        </button>
                    )}
                </div>

                {/* AI Feedback Panel - slides in from right */}
                <AnimatePresence>
                    {showFeedback && feedback && (
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="hidden md:flex w-80 flex-col ai-feedback-panel overflow-y-auto py-8 px-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <span className="font-poppins font-bold text-sm text-violet-300">🤖 AI Feedback</span>
                                <button onClick={() => setShowFeedback(false)} className="text-muted-foreground hover:text-violet-300 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Score */}
                            <div className="text-center mb-6">
                                <div
                                    className="font-poppins text-5xl font-extrabold mb-1"
                                    style={{
                                        background: "linear-gradient(135deg, #a78bfa, #7f5af0)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    {feedback.score}
                                </div>
                                <div className="text-xs text-muted-foreground font-poppins">Overall Score / 100</div>
                            </div>

                            {/* Score Bars */}
                            {[
                                { label: "Grammar", value: feedback.grammar },
                                { label: "Vocabulary", value: feedback.vocabulary },
                                { label: "Clarity", value: feedback.clarity },
                            ].map(({ label, value }) => (
                                <div key={label} className="mb-4">
                                    <div className="flex justify-between text-xs font-poppins mb-1">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span style={{ color: "hsl(270, 80%, 75%)" }}>{value}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsla(270, 30%, 20%, 0.6)" }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${value}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ background: "linear-gradient(90deg, #7f5af0, #a78bfa)" }}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="mt-4 pt-4" style={{ borderTop: "1px solid hsla(270, 40%, 30%, 0.2)" }}>
                                <div className="text-xs font-semibold text-violet-300 font-poppins mb-3">💡 Suggestions</div>
                                {feedback.suggestions.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2 mb-3">
                                        <span className="text-violet-500 mt-0.5 text-xs shrink-0">•</span>
                                        <p className="text-xs text-muted-foreground font-poppins leading-relaxed">{s}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WritingModule;
