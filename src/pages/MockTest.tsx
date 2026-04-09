import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Headphones, PenTool, Mic, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore as useStore } from "@store/useAuthStore";
import { apiService as api } from "@services/apiService";
import Spinner from "@components/ui/Spinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import { useLiveModuleActivity } from "@hooks/useLiveModuleActivity";


const TOTAL_TIME = 1800; // 30 minutes
const TOTAL_QUESTIONS = 22;

type QuestionType = "reading" | "listening" | "writing" | "speaking";



const typeIcons: Record<QuestionType, React.ReactNode> = {
    reading: <BookOpen className="w-4 h-4" />,
    listening: <Headphones className="w-4 h-4" />,
    writing: <PenTool className="w-4 h-4" />,
    speaking: <Mic className="w-4 h-4" />,
};

const typeColors: Record<QuestionType, string> = {
    reading: "#7f5af0",
    listening: "#8b5cf6",
    writing: "#a78bfa",
    speaking: "#7f5af0",
};

const MockTest = () => {
    useLiveModuleActivity("mock-test");
    const navigate = useNavigate();
    const { 
        questions, loading, error, current, selected, timeLeft, finished, 
        loadQuestions, tick, handleSelect, nextQuestion, resetTest 
    } = useExamStore();

    if (error) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6 text-white text-center">
                <ErrorMessage 
                    message={error} 
                    onRetry={() => loadQuestions()} 
                />
            </div>
        );
    }

    // Use a ref to ensure we only load once or when needed
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            loadQuestions();
            initialized.current = true;
        }
        
        // Reset state on mount
        resetTest(TOTAL_TIME);

        const timer = setInterval(() => tick(), 1000);
        return () => clearInterval(timer);
    }, [loadQuestions, tick, resetTest]);

    // Data extraction
    const mockQuestions = (questions as any).mock || [];
    const usedQuestions = mockQuestions.slice(0, Math.min(TOTAL_QUESTIONS, mockQuestions.length));
    const q = usedQuestions[current];
    const totalQ = usedQuestions.length;
    const progressPct = totalQ > 0 ? (current / totalQ) * 100 : 0;

    const formatTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const onOptionSelect = (option: string) => {
        handleSelect(current, option);
    };

    const onNext = () => {
        nextQuestion(totalQ);
    };

    const score = usedQuestions.reduce((acc, q, i) => {
        return acc + (selected[i] === q.answer ? 1 : 0);
    }, 0);

    const pctScore = Math.round((score / totalQ) * 100);

    useEffect(() => {
        if (finished && usedQuestions.length > 0) {
            // Award 50 XP per correct answer in Mock Test
            const xpAwarded = score * 50;
            api.updateProgress(xpAwarded).catch(console.error);
        }
    }, [finished, score, usedQuestions.length]);

    if (loading) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6 text-white text-center">
                <Spinner />
            </div>
        );
    }

    if (!q && !finished) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6 text-white text-center">
                <ErrorMessage 
                    message="The mock test database appears to be empty." 
                    onRetry={() => window.location.reload()} 
                />
            </div>
        );
    }

    if (finished) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6 text-foreground">
                <div className="orb orb-violet w-[500px] h-[500px] top-0 left-1/2 -translate-x-1/2 float opacity-15 pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-3xl p-10 max-w-md w-full text-center relative z-10"
                    style={{
                        background: "hsla(270, 20%, 8%, 0.9)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid hsla(270, 80%, 55%, 0.2)",
                        boxShadow: "0 0 60px hsla(270, 80%, 55%, 0.12)",
                    }}
                >
                    <div className="text-5xl mb-4">
                        {pctScore >= 80 ? "🎉" : pctScore >= 60 ? "👏" : "📚"}
                    </div>
                    <h2 className="font-poppins font-bold text-2xl mb-2">Test Complete!</h2>
                    <p className="text-muted-foreground text-sm font-poppins mb-8">
                        {pctScore >= 80
                            ? "Outstanding performance! You're test-ready."
                            : pctScore >= 60
                                ? "Good job! A little more practice will take you far."
                                : "Keep practicing! Every attempt makes you stronger."}
                    </p>

                    <div
                        className="font-poppins text-7xl font-extrabold mb-1"
                        style={{
                            background: "linear-gradient(135deg, #a78bfa, #7f5af0)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            filter: "drop-shadow(0 0 20px hsla(270, 80%, 55%, 0.4))",
                        }}
                    >
                        {pctScore}%
                    </div>
                    <p className="text-muted-foreground text-sm font-poppins mb-8">
                        {score} / {totalQ} correct
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate("/task")}
                            className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm text-muted-foreground transition-all hover:scale-[1.02]"
                            style={{ background: "hsla(270, 20%, 14%, 0.7)", border: "1px solid hsla(270, 30%, 25%, 0.3)" }}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => resetTest(TOTAL_TIME)}
                            className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm text-white transition-all hover:scale-[1.02]"
                            style={{ background: "linear-gradient(135deg, #7f5af0, #8b5cf6)", boxShadow: "0 0 20px hsla(262, 83%, 58%, 0.35)" }}
                        >
                            Retake
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen animated-bg mock-overlay relative flex flex-col text-foreground">
            <div className="orb orb-violet w-[300px] h-[300px] -top-10 -right-10 float opacity-10 pointer-events-none" />

            {/* Top bar */}
            <div
                className="flex items-center justify-between px-6 py-4 z-40 relative"
                style={{
                    background: "hsla(270, 25%, 5%, 0.9)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid hsla(270, 40%, 25%, 0.2)",
                }}
            >
                <button onClick={() => navigate("/task")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-violet-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" />Exit
                </button>

                {/* Timer center */}
                <div className="flex items-center gap-2">
                    <Clock
                        className="w-4 h-4"
                        style={{ color: timeLeft < 300 ? "hsl(0, 80%, 60%)" : "hsl(270, 80%, 70%)" }}
                    />
                    <span
                        className="font-poppins font-bold text-lg tabular-nums"
                        style={{
                            color: timeLeft < 300 ? "hsl(0, 80%, 65%)" : "hsl(270, 80%, 80%)",
                            animation: timeLeft < 60 ? "timerPulse 1s infinite" : "none",
                        }}
                    >
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <div className="text-xs text-muted-foreground font-poppins">
                    Q{current + 1}/{totalQ}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5" style={{ background: "hsla(270, 30%, 15%, 0.5)" }}>
                <motion.div
                    className="h-full mock-progress-bar"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                />
            </div>

            {/* Question area */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.35 }}
                        className="w-full max-w-xl"
                    >
                        {/* Type badge */}
                        <div className="flex items-center gap-2 mb-6">
                            <div
                                className="inline-flex items-center gap-2 rounded-xl px-4 py-1.5 font-poppins font-semibold text-xs"
                                style={{
                                    background: `${typeColors[q.type]}18`,
                                    border: `1px solid ${typeColors[q.type]}44`,
                                    color: typeColors[q.type],
                                }}
                            >
                                {typeIcons[q.type]}
                                <span className="capitalize">{q.type}</span>
                            </div>
                            <div
                                className="ml-2 text-xs text-muted-foreground font-poppins"
                                style={{ letterSpacing: "0.05em" }}
                            >
                                Question {current + 1} of {totalQ}
                            </div>
                        </div>

                        {/* Question card */}
                        <div
                            className="rounded-2xl p-8 mb-6"
                            style={{
                                background: "hsla(270, 20%, 8%, 0.8)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid hsla(270, 60%, 55%, 0.12)",
                            }}
                        >
                            <p className="font-poppins text-base leading-relaxed text-foreground">{q.prompt}</p>
                        </div>

                        {/* Options */}
                        {q.options && (
                            <div className="flex flex-col gap-3">
                                {q.options.map((opt, i) => {
                                    const letter = String.fromCharCode(65 + i);
                                    const isSelected = selected[current] === letter;
                                    return (
                                        <motion.button
                                            key={i}
                                            onClick={() => onOptionSelect(letter)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="text-left rounded-2xl px-5 py-4 font-poppins text-sm transition-all duration-200"
                                            style={{
                                                background: isSelected
                                                    ? "hsla(270, 80%, 55%, 0.15)"
                                                    : "hsla(270, 20%, 8%, 0.7)",
                                                backdropFilter: "blur(16px)",
                                                border: isSelected
                                                    ? "1.5px solid hsla(270, 80%, 55%, 0.5)"
                                                    : "1px solid hsla(270, 40%, 30%, 0.2)",
                                                boxShadow: isSelected ? "0 0 20px hsla(270, 80%, 55%, 0.12)" : "none",
                                                color: isSelected ? "hsl(270, 80%, 85%)" : "hsl(270, 15%, 75%)",
                                            }}
                                        >
                                            <span
                                                className="font-bold mr-3"
                                                style={{ color: isSelected ? "hsl(270, 80%, 75%)" : "hsla(270, 30%, 55%, 0.6)" }}
                                            >
                                                {letter}.
                                            </span>
                                            {opt}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Writing Task UI */}
                        {q.type === "writing" && !q.options && (
                            <textarea
                                value={selected[current] || ""}
                                onChange={(e) => onOptionSelect(e.target.value)}
                                placeholder="Type your response here..."
                                className="w-full h-48 rounded-2xl p-5 bg-black/20 border border-white/10 outline-none focus:border-violet-500/50 transition-all font-poppins text-sm resize-none"
                            />
                        )}

                        {/* Speaking Task UI */}
                        {q.type === "speaking" && (
                            <div className="flex flex-col items-center gap-6 py-6">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-violet-500/10 border border-violet-500/30 animate-pulse">
                                    <Mic className="w-8 h-8 text-violet-400" />
                                </div>
                                <p className="text-xs text-muted-foreground font-poppins italic">Recording functionality will be integrated with our AI engine.</p>
                                <button 
                                    onClick={() => onOptionSelect("recorded")}
                                    className="px-6 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition-all"
                                >
                                    {selected[current] ? "Re-record" : "Start Recording"}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Next button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selected[current] !== undefined ? 1 : 0.3 }}
                    onClick={onNext}
                    disabled={selected[current] === undefined}
                    className="mt-8 flex items-center gap-2 rounded-2xl px-8 py-3.5 font-poppins font-semibold text-white transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed"
                    style={{
                        background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                        boxShadow: selected[current] !== undefined ? "0 0 25px hsla(262, 83%, 58%, 0.4)" : "none",
                    }}
                >
                    {current === totalQ - 1 ? "Finish Test" : "Next Question"}
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </div>
    );
};

export default MockTest;
