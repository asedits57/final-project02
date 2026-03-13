import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, MicOff, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const prompts = [
    "Describe what you see in this image: a busy city street at night with glowing neon signs.",
    "Talk about a memorable trip you have taken. Where did you go and what did you do?",
    "Explain the importance of learning a second language in today's world.",
];

const SpeakingModule = () => {
    const navigate = useNavigate();
    const [promptIdx, setPromptIdx] = useState(0);
    const [recording, setRecording] = useState(false);
    const [done, setDone] = useState(false);
    const [feedback, setFeedback] = useState<{
        overall: number; pronunciation: number; fluency: number; coherence: number; tips: string[];
    } | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [elapsed, setElapsed] = useState(0);

    const handleMic = () => {
        if (recording) {
            clearInterval(timerRef.current!);
            setRecording(false);
            setDone(true);
            // Simulate AI feedback after 1s
            setTimeout(() => {
                setFeedback({
                    overall: 82,
                    pronunciation: 78,
                    fluency: 85,
                    coherence: 83,
                    tips: [
                        "Great pace — avoid rushing through complex words.",
                        "Pronunciation of 'th' sounds needs slight refinement.",
                        "Strong use of connective phrases and transitions.",
                    ],
                });
            }, 900);
        } else {
            setElapsed(0);
            setDone(false);
            setFeedback(null);
            setRecording(true);
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
        }
    };

    const handleNext = () => {
        setPromptIdx(i => (i + 1) % prompts.length);
        setRecording(false);
        setDone(false);
        setFeedback(null);
        setElapsed(0);
        clearInterval(timerRef.current!);
    };

    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const ScoreBar = ({ label, value }: { label: string; value: number }) => (
        <div className="mb-3">
            <div className="flex justify-between text-xs font-poppins mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span style={{ color: "hsl(270, 80%, 75%)" }}>{value}/100</span>
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
    );

    return (
        <div className="min-h-screen animated-bg relative pb-10 text-foreground">
            <div className="orb orb-violet w-[450px] h-[450px] -top-20 left-1/2 -translate-x-1/2 float opacity-15 pointer-events-none" />

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
                    <Mic className="w-4 h-4 text-violet-400" />Speaking Module
                </div>
                <div className="text-xs text-muted-foreground font-poppins">{promptIdx + 1}/{prompts.length}</div>
            </div>

            <div className="container mx-auto px-6 py-10 max-w-xl text-center">
                {/* Prompt Card */}
                <motion.div
                    key={promptIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-7 mb-8"
                    style={{
                        background: "hsla(270, 20%, 8%, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid hsla(270, 60%, 55%, 0.15)",
                    }}
                >
                    <p className="text-base font-poppins text-foreground leading-relaxed">{prompts[promptIdx]}</p>
                </motion.div>

                {/* Big Mic Button */}
                <div className="relative flex items-center justify-center mb-8">
                    {/* Pulse rings */}
                    {recording && [1, 2, 3].map(n => (
                        <motion.div
                            key={n}
                            className="absolute rounded-full border"
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 1 + n * 0.4, opacity: 0 }}
                            transition={{ duration: 1.5, delay: n * 0.4, repeat: Infinity, ease: "easeOut" }}
                            style={{
                                width: 120,
                                height: 120,
                                borderColor: "hsla(270, 80%, 55%, 0.5)",
                            }}
                        />
                    ))}

                    <button
                        onClick={handleMic}
                        className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-105"
                        style={recording ? {
                            background: "linear-gradient(135deg, hsla(0, 80%, 50%, 0.9), hsla(0, 70%, 40%, 0.9))",
                            boxShadow: "0 0 50px hsla(0, 80%, 55%, 0.5), 0 0 100px hsla(0, 80%, 55%, 0.2)",
                            animation: "micPulse 1.5s ease-in-out infinite",
                        } : {
                            background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                            boxShadow: "0 0 40px hsla(262, 83%, 58%, 0.5), 0 0 80px hsla(262, 83%, 58%, 0.2)",
                        }}
                    >
                        {recording
                            ? <MicOff className="w-8 h-8 text-white" />
                            : <Mic className="w-8 h-8 text-white" />}
                    </button>
                </div>

                {/* Status text */}
                <div className="mb-8">
                    {recording ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="font-poppins font-semibold text-red-400">Recording...</span>
                            </div>
                            <span className="font-poppins text-2xl font-bold" style={{ color: "hsl(270, 80%, 75%)" }}>
                                {fmt(elapsed)}
                            </span>
                            <p className="text-xs text-muted-foreground">Tap again to stop</p>
                        </motion.div>
                    ) : done ? (
                        <p className="text-sm text-muted-foreground font-poppins">Analyzing your response...</p>
                    ) : (
                        <p className="text-sm text-muted-foreground font-poppins">Tap the microphone to start recording</p>
                    )}
                </div>

                {/* AI Feedback Card */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ duration: 0.5 }}
                            className="text-left rounded-2xl p-7 mb-6"
                            style={{
                                background: "hsla(270, 20%, 8%, 0.9)",
                                border: "1px solid hsla(270, 60%, 55%, 0.2)",
                                boxShadow: "0 0 40px hsla(270, 80%, 55%, 0.08)",
                            }}
                        >
                            {/* Overall Score */}
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <div className="text-xs text-muted-foreground font-poppins mb-1">AI Score</div>
                                    <div
                                        className="font-poppins text-4xl font-extrabold"
                                        style={{
                                            background: "linear-gradient(135deg, #a78bfa, #7f5af0)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                        }}
                                    >
                                        {feedback.overall}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-poppins">out of 100</div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star
                                            key={s}
                                            className="w-5 h-5"
                                            fill={s <= Math.round(feedback.overall / 20) ? "hsl(270, 80%, 70%)" : "transparent"}
                                            stroke={s <= Math.round(feedback.overall / 20) ? "hsl(270, 80%, 70%)" : "hsla(270, 20%, 40%, 0.5)"}
                                        />
                                    ))}
                                </div>
                            </div>

                            <ScoreBar label="Pronunciation" value={feedback.pronunciation} />
                            <ScoreBar label="Fluency" value={feedback.fluency} />
                            <ScoreBar label="Coherence" value={feedback.coherence} />

                            <div className="mt-4">
                                <div className="text-xs font-semibold text-violet-300 font-poppins mb-2">💡 Suggestions</div>
                                {feedback.tips.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-2 mb-2">
                                        <span className="text-violet-500 mt-0.5 text-xs">•</span>
                                        <p className="text-xs text-muted-foreground font-poppins">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Next / Back */}
                {feedback && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate("/task")}
                            className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm text-muted-foreground transition-all hover:scale-[1.02]"
                            style={{ background: "hsla(270, 20%, 12%, 0.7)", border: "1px solid hsla(270, 30%, 25%, 0.3)" }}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm text-white transition-all hover:scale-[1.02]"
                            style={{ background: "linear-gradient(135deg, #7f5af0, #8b5cf6)", boxShadow: "0 0 20px hsla(262, 83%, 58%, 0.35)" }}
                        >
                            Next Prompt
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeakingModule;
