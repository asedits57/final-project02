import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser } from "@/lib/auth";
import { updateUserXP } from "@/lib/leaderboard-supabase";

const TIMER_DURATION = 300; // 5 minutes

const passage = {
    title: "The Rise of Artificial Intelligence",
    text: [
        { type: "text" as const, content: "Artificial intelligence has " },
        { type: "blank" as const, id: 0, answer: "transformed" },
        { type: "text" as const, content: " nearly every aspect of modern life. From healthcare to transportation, AI systems are becoming increasingly " },
        { type: "blank" as const, id: 1, answer: "sophisticated" },
        { type: "text" as const, content: ". Researchers continue to " },
        { type: "blank" as const, id: 2, answer: "develop" },
        { type: "text" as const, content: " new algorithms that enable machines to learn from " },
        { type: "blank" as const, id: 3, answer: "experience" },
        { type: "text" as const, content: " and improve their performance over time. However, ethical considerations remain " },
        { type: "blank" as const, id: 4, answer: "crucial" },
        { type: "text" as const, content: " as this technology continues to evolve." },
    ],
};

const hints = ["transformed", "sophisticated", "develop", "experience", "crucial"];

const ReadingModule = () => {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [validation, setValidation] = useState<Record<number, "correct" | "wrong" | null>>({});
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
    const [submitted, setSubmitted] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const timerOffset = circumference - (timeLeft / TIMER_DURATION) * circumference;

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, []);

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const handleInput = (id: number, val: string) => {
        setAnswers(prev => ({ ...prev, [id]: val }));
        if (validation[id]) {
            setValidation(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleSubmit = () => {
        const newValidation: Record<number, "correct" | "wrong"> = {};
        hints.forEach((ans, i) => {
            newValidation[i] = answers[i]?.trim().toLowerCase() === ans.toLowerCase() ? "correct" : "wrong";
        });
        setValidation(newValidation);
        setSubmitted(true);
        clearInterval(timerRef.current!);

        // Award 20 XP per correct answer in Reading Module
        const correctCount = Object.values(newValidation).filter(v => v === "correct").length;
        const user = getUser();
        if (user?.id) {
            updateUserXP(user.id, correctCount * 20).catch(console.error);
        }
    };

    const score = Object.values(validation).filter(v => v === "correct").length;

    return (
        <div className="min-h-screen animated-bg relative pb-10 text-foreground">
            {/* Orbs */}
            <div className="orb orb-violet w-[400px] h-[400px] -top-20 -right-20 float opacity-15 pointer-events-none" />
            <div className="orb orb-cyan w-[250px] h-[250px] bottom-20 -left-10 float-delayed opacity-10 pointer-events-none" />

            {/* Header */}
            <div
                className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
                style={{
                    background: "hsla(270, 25%, 6%, 0.85)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid hsla(270, 40%, 35%, 0.15)",
                }}
            >
                <button
                    onClick={() => navigate("/task")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-violet-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex items-center gap-2 font-poppins font-semibold text-foreground">
                    <span className="text-violet-400">📖</span>
                    Reading Module
                </div>

                {/* Timer Ring */}
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                        <svg width="56" height="56" className="-rotate-90">
                            <circle cx="28" cy="28" r={radius} fill="none" strokeWidth="3" className="timer-ring-track" />
                            <circle
                                cx="28" cy="28" r={radius} fill="none" strokeWidth="3"
                                stroke={timeLeft < 60 ? "hsl(0, 80%, 60%)" : "hsl(270, 80%, 65%)"}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={timerOffset}
                                style={{
                                    filter: `drop-shadow(0 0 6px ${timeLeft < 60 ? "hsl(0,80%,55%)" : "hsl(270,80%,55%)"})`,
                                    transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
                                }}
                            />
                        </svg>
                        <div
                            className="absolute text-[10px] font-bold font-poppins"
                            style={{
                                color: timeLeft < 60 ? "hsl(0, 80%, 65%)" : "hsl(270, 80%, 80%)",
                                animation: timeLeft < 60 ? "timerPulse 1s infinite" : "none",
                            }}
                        >
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-3xl">
                {/* Passage Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl p-8 mb-6"
                    style={{
                        background: "hsla(270, 20%, 8%, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid hsla(270, 60%, 55%, 0.15)",
                        boxShadow: "0 0 30px hsla(270, 80%, 55%, 0.06)",
                    }}
                >
                    <div className="flex items-center gap-2 mb-5">
                        <div className="h-1 w-6 rounded-full" style={{ background: "linear-gradient(90deg, #7f5af0, #8b5cf6)" }} />
                        <h2 className="font-poppins font-bold text-xl">{passage.title}</h2>
                    </div>

                    <p className="text-base leading-relaxed text-foreground/90 font-poppins">
                        {passage.text.map((segment, i) => {
                            if (segment.type === "text") return <span key={i}>{segment.content}</span>;
                            const blankId = segment.id;
                            const state = validation[blankId];
                            return (
                                <span key={i} className="inline-block mx-1 align-baseline">
                                    <input
                                        type="text"
                                        value={answers[blankId] ?? ""}
                                        onChange={e => handleInput(blankId, e.target.value)}
                                        disabled={submitted}
                                        placeholder="___"
                                        className="inline-block w-32 text-center text-sm font-medium rounded-lg px-2 py-1 outline-none transition-all duration-300 font-poppins"
                                        style={{
                                            background: "hsla(270, 30%, 14%, 0.8)",
                                            border:
                                                state === "correct"
                                                    ? "1.5px solid hsl(142, 70%, 50%)"
                                                    : state === "wrong"
                                                        ? "1.5px solid hsl(0, 80%, 60%)"
                                                        : "1.5px solid hsla(270, 60%, 55%, 0.3)",
                                            boxShadow:
                                                state === "correct"
                                                    ? "0 0 12px hsla(142, 70%, 50%, 0.35)"
                                                    : state === "wrong"
                                                        ? "0 0 12px hsla(0, 80%, 60%, 0.35)"
                                                        : "none",
                                            color: state === "correct" ? "hsl(142, 70%, 60%)" : state === "wrong" ? "hsl(0, 80%, 70%)" : "inherit",
                                        }}
                                    />
                                    {state && (
                                        <span className="inline-block ml-1 align-middle">
                                            {state === "correct"
                                                ? <CheckCircle className="w-3.5 h-3.5 text-green-400 inline" />
                                                : <XCircle className="w-3.5 h-3.5 text-red-400 inline" />}
                                        </span>
                                    )}
                                </span>
                            );
                        })}
                    </p>
                </motion.div>

                {/* Hint Strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl px-5 py-3 flex flex-wrap gap-2 items-center mb-6"
                    style={{
                        background: "hsla(270, 20%, 7%, 0.7)",
                        border: "1px solid hsla(270, 40%, 30%, 0.2)",
                    }}
                >
                    <span className="text-xs text-muted-foreground mr-2 font-poppins font-medium">Word Bank:</span>
                    {hints.map((h, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                const firstEmpty = hints.findIndex((_, idx) => !answers[idx]);
                                if (firstEmpty !== -1) handleInput(firstEmpty, h);
                            }}
                            className="text-xs px-3 py-1 rounded-lg font-poppins font-medium transition-all duration-200 hover:scale-105"
                            style={{
                                background: "hsla(270, 80%, 55%, 0.12)",
                                border: "1px solid hsla(270, 80%, 55%, 0.25)",
                                color: "hsl(270, 80%, 75%)",
                            }}
                        >
                            {h}
                        </button>
                    ))}
                </motion.div>

                {/* Results */}
                <AnimatePresence>
                    {submitted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-2xl p-6 mb-6"
                            style={{
                                background: score === 5
                                    ? "hsla(142, 70%, 50%, 0.08)"
                                    : "hsla(270, 30%, 10%, 0.8)",
                                border: `1px solid ${score === 5 ? "hsla(142, 70%, 50%, 0.3)" : "hsla(270, 60%, 50%, 0.2)"}`,
                            }}
                        >
                            <h3 className="font-poppins font-bold text-lg mb-1">
                                {score === 5 ? "🎉 Perfect Score!" : `Score: ${score}/5`}
                            </h3>
                            <p className="text-sm text-muted-foreground font-poppins">
                                {score === 5
                                    ? "Excellent! All answers are correct."
                                    : `${5 - score} answer${5 - score > 1 ? "s" : ""} need${5 - score === 1 ? "s" : ""} review.`}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button */}
                {!submitted ? (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        onClick={handleSubmit}
                        className="flex items-center gap-2 w-full justify-center rounded-2xl py-4 font-poppins font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                        style={{
                            background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                            boxShadow: "0 0 30px hsla(262, 83%, 58%, 0.4)",
                        }}
                    >
                        Submit Answers
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                ) : (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => navigate("/task")}
                        className="flex items-center gap-2 w-full justify-center rounded-2xl py-4 font-poppins font-semibold text-violet-300 transition-all duration-300 hover:scale-[1.02]"
                        style={{
                            background: "hsla(270, 80%, 55%, 0.1)",
                            border: "1px solid hsla(270, 80%, 55%, 0.3)",
                        }}
                    >
                        Back to Dashboard
                        <ArrowLeft className="w-4 h-4" />
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default ReadingModule;
